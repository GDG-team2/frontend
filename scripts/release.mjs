import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";

const outputDir = "dist-release";
const publicVariables = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_SERVICE_TERMS_URL",
  "EXPO_PUBLIC_PRIVACY_TERMS_URL",
  "EXPO_PUBLIC_LOCATION_TERMS_URL",
];

export function parseTag(tag) {
  const match =
    /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:[a-zA-Z][a-zA-Z0-9-]*|0|[1-9]\d*)(?:\.(?:[a-zA-Z][a-zA-Z0-9-]*|0|[1-9]\d*))*))?$/.exec(
      tag ?? "",
    );
  assert.ok(
    match && match[0] === tag,
    "Use a version tag such as v1.2.3 or v1.2.3-rc.1.",
  );
  return {
    tag,
    version: match.slice(1, 4).join("."),
    prerelease: Boolean(match[4]),
  };
}

export function configureRelease(app, eas, env) {
  const release = parseTag(env.RELEASE_TAG);
  const projectId = env.EAS_PROJECT_ID || app.expo.extra?.eas?.projectId;
  assert.match(
    projectId ?? "",
    /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i,
    "Set the EAS_PROJECT_ID repository variable or run eas init and commit app.json.",
  );
  assert.ok(eas.build?.release, "The EAS release profile is missing.");
  const nextApp = structuredClone(app);
  nextApp.expo.version = release.version;
  nextApp.expo.extra = {
    ...nextApp.expo.extra,
    eas: { ...nextApp.expo.extra?.eas, projectId },
  };
  const nextEas = structuredClone(eas);
  const buildEnv = {
    ...nextEas.build.release.env,
    EXPO_PUBLIC_USE_MSW: "false",
  };
  for (const key of publicVariables) {
    if (!env[key]) continue;
    const url = new URL(env[key]);
    assert.ok(
      url.protocol === "https:" && !url.username && !url.password,
      `${key} must be an HTTPS URL without credentials.`,
    );
    if (key === "EXPO_PUBLIC_API_BASE_URL")
      assert.ok(
        url.pathname.replace(/\/$/, "").endsWith("/api/v1"),
        "API URL must include /api/v1.",
      );
    buildEnv[key] = env[key];
  }
  // EAS remote workers do not automatically inherit GitHub's environment.
  nextEas.build.release.env = buildEnv;
  return { app: nextApp, eas: nextEas, release: { ...release, projectId } };
}

export function selectBuilds(builds, release) {
  assert.ok(
    Array.isArray(builds) && builds.length === 2,
    "Expected exactly two EAS builds.",
  );
  return ["ANDROID", "IOS"].map((platform) => {
    const matching = builds.filter((build) => build.platform === platform);
    assert.equal(matching.length, 1, `Expected one ${platform} build.`);
    const build = matching[0];
    assert.equal(
      build.status,
      "FINISHED",
      `${platform} build did not finish successfully.`,
    );
    assert.equal(build.buildProfile, "release", "Unexpected build profile.");
    assert.equal(
      build.distribution,
      "INTERNAL",
      "Expected an internal distribution build.",
    );
    assert.equal(build.app?.id, release.projectId, "Unexpected EAS project.");
    assert.equal(
      build.gitCommitHash,
      release.commit,
      "Build commit does not match the release tag.",
    );
    assert.equal(
      build.appVersion,
      release.version,
      "Build version does not match the release tag.",
    );
    assert.notEqual(
      build.isForIosSimulator,
      true,
      "A simulator build cannot be released as an IPA.",
    );
    const url = new URL(
      build.artifacts?.applicationArchiveUrl ?? build.artifacts?.buildUrl,
    );
    assert.equal(url.protocol, "https:", "Artifact downloads must use HTTPS.");
    const extension = platform === "ANDROID" ? "apk" : "ipa";
    assert.ok(
      url.pathname.endsWith(`.${extension}`),
      `Expected a .${extension} application archive.`,
    );
    return {
      build,
      url: url.href,
      filename: `ohakkom-${release.tag}.${extension}`,
    };
  });
}

function command(program, args) {
  return execFileSync(program, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}
async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function existingRelease(tag) {
  assert.ok(
    process.env.GITHUB_REPOSITORY && process.env.GH_TOKEN,
    "GitHub repository/token are required.",
  );
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/releases/tags/${encodeURIComponent(tag)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (response.status === 404) return null;
  assert.ok(
    response.ok,
    `GitHub release lookup failed: HTTP ${response.status}`,
  );
  return response.json();
}

function checkTag(release) {
  const commit = command("git", ["rev-parse", "HEAD"]);
  assert.equal(
    command("git", ["rev-parse", `refs/tags/${release.tag}^{commit}`]),
    commit,
    "Checkout must match the existing release tag.",
  );
  if (release.commit)
    assert.equal(commit, release.commit, "Release checkout changed.");
  return commit;
}

async function prepare() {
  const config = configureRelease(
    await readJson("app.json"),
    await readJson("eas.json"),
    process.env,
  );
  assert.ok(
    process.env.EXPO_TOKEN,
    "Missing EXPO_TOKEN repository secret. See docs/releases.md.",
  );
  config.release.commit = checkTag(config.release);
  const existing = await existingRelease(config.release.tag);
  assert.ok(
    !existing || existing.draft,
    "This release is already published; publish a new version instead of replacing its binaries.",
  );
  await mkdir(outputDir, { recursive: true });
  await writeJson("app.json", config.app);
  await writeJson("eas.json", config.eas);
  await writeJson(`${outputDir}/release.json`, config.release);
  console.log(
    `Prepared ${config.release.tag}: version ${config.release.version}, APK + Ad Hoc IPA.`,
  );
}

async function collect() {
  const release = await readJson(`${outputDir}/release.json`);
  const selected = selectBuilds(
    await readJson(`${outputDir}/eas-builds.json`),
    release,
  );
  const artifacts = [];
  for (const { build, url, filename } of selected) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10 * 60_000),
    });
    assert.ok(
      response.ok && response.body,
      `Could not download ${filename}: HTTP ${response.status}`,
    );
    let bytes = 0;
    const hash = createHash("sha256");
    const digest = new Transform({
      transform(chunk, _, callback) {
        bytes += chunk.length;
        if (bytes >= 2 * 1024 ** 3)
          return callback(
            new Error("GitHub release assets must be smaller than 2 GiB."),
          );
        hash.update(chunk);
        callback(null, chunk);
      },
    });
    const path = `${outputDir}/${filename}`;
    await pipeline(
      Readable.fromWeb(response.body),
      digest,
      createWriteStream(path),
    );
    command("unzip", ["-tq", path]);
    const entries = command("unzip", ["-Z1", path]);
    assert.ok(
      filename.endsWith(".apk")
        ? /^AndroidManifest\.xml$/m.test(entries)
        : /^Payload\/[^/]+\.app\/embedded\.mobileprovision$/m.test(entries),
      `${filename} is not the expected installable application archive.`,
    );
    artifacts.push({
      filename,
      sha256: hash.digest("hex"),
      bytes,
      buildId: build.id,
      platform: build.platform,
      buildVersion: build.appBuildVersion,
    });
  }
  await writeFile(
    `${outputDir}/SHA256SUMS`,
    artifacts
      .map((artifact) => `${artifact.sha256}  ${artifact.filename}\n`)
      .join(""),
  );
  await writeJson(`${outputDir}/release-manifest.json`, {
    ...release,
    artifacts,
  });
  await writeFile(
    `${outputDir}/notes.md`,
    [
      `오하꼼 ${release.tag}`,
      "",
      `소스 커밋: ${release.commit}`,
      "",
      "- Android: APK를 내려받아 설치합니다.",
      "- iOS: Apple Ad Hoc 프로비저닝에 등록된 기기에서만 IPA를 설치할 수 있습니다.",
      "- 파일 무결성은 SHA256SUMS에서 확인할 수 있습니다.",
      "- 스토어 자동 제출은 포함하지 않습니다.",
      "",
    ].join("\n"),
  );
  console.log("Both application archives validated; release assets are ready.");
}

export async function verifyAssets(directory, manifest) {
  parseTag(manifest.tag);
  assert.deepEqual(manifest.artifacts.map((a) => a.filename).sort(), [
    `ohakkom-${manifest.tag}.apk`,
    `ohakkom-${manifest.tag}.ipa`,
  ]);
  for (const artifact of manifest.artifacts) {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(
      resolve(directory, artifact.filename),
    ))
      hash.update(chunk);
    assert.equal(
      hash.digest("hex"),
      artifact.sha256,
      `Checksum mismatch: ${artifact.filename}`,
    );
  }
  assert.equal(
    await readFile(resolve(directory, "SHA256SUMS"), "utf8"),
    manifest.artifacts
      .map((artifact) => `${artifact.sha256}  ${artifact.filename}\n`)
      .join(""),
    "The checksum file does not match the release manifest.",
  );
}

async function publish() {
  const manifest = await readJson(`${outputDir}/release-manifest.json`);
  checkTag(manifest);
  await verifyAssets(outputDir, manifest);
  const existing = await existingRelease(manifest.tag);
  assert.ok(
    !existing || existing.draft,
    "Refusing to modify an already published release.",
  );
  if (!existing)
    command("gh", [
      "release",
      "create",
      manifest.tag,
      "--draft",
      "--verify-tag",
      "--title",
      `오하꼼 ${manifest.tag}`,
      "--notes-file",
      `${outputDir}/notes.md`,
    ]);
  const files = [
    ...manifest.artifacts.map((a) => `${outputDir}/${a.filename}`),
    `${outputDir}/SHA256SUMS`,
    `${outputDir}/release-manifest.json`,
  ];
  command("gh", ["release", "upload", manifest.tag, ...files, "--clobber"]);
  command("gh", [
    "release",
    "edit",
    manifest.tag,
    "--draft=false",
    `--prerelease=${manifest.prerelease}`,
    "--notes-file",
    `${outputDir}/notes.md`,
    ...(manifest.prerelease ? ["--latest=false"] : []),
  ]);
  console.log(
    command("gh", [
      "release",
      "view",
      manifest.tag,
      "--json",
      "url",
      "--jq",
      ".url",
    ]),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const actions = { prepare, collect, publish };
  assert.ok(
    actions[process.argv[2]],
    "Usage: node scripts/release.mjs prepare|collect|publish",
  );
  await actions[process.argv[2]]();
}
