import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  configureRelease,
  parseTag,
  selectBuilds,
  verifyAssets,
} from "../scripts/release.mjs";
import app from "../app.json";
import eas from "../eas.json";

const initialAppVersion = app.expo.version;
const projectId = "10000000-2000-4000-8000-000000000000";
const release = {
  ...parseTag("v2.3.4-rc.1"),
  projectId,
  commit: "a".repeat(40),
};
const builds = ["ANDROID", "IOS"].map((platform) => ({
  id: platform.toLowerCase(),
  platform,
  status: "FINISHED",
  buildProfile: "release",
  distribution: "INTERNAL",
  app: { id: projectId },
  appVersion: "2.3.4",
  gitCommitHash: release.commit,
  isForIosSimulator: false,
  artifacts: {
    applicationArchiveUrl: `https://expo.dev/artifacts/eas/id.${platform === "ANDROID" ? "apk" : "ipa"}`,
  },
}));

test("release tags map prereleases to a native-compatible version and reject unsafe/non-version refs", () => {
  expect(parseTag("v1.2.3")).toEqual({
    tag: "v1.2.3",
    version: "1.2.3",
    prerelease: false,
  });
  expect(parseTag("v1.2.3-beta.12")).toMatchObject({
    version: "1.2.3",
    prerelease: true,
  });
  for (const tag of [
    "main",
    "1.2.3",
    "v01.2.3",
    "v1.2",
    "v1.2.3-rc.01",
    "v1.2.3\n",
    "v1.2.3;echo bad",
    "v1.2.3/../../file",
  ]) {
    expect(() => parseTag(tag)).toThrow();
  }
});

test("release config propagates only public configuration to remote workers and requires project setup", () => {
  const configured = configureRelease(app, eas, {
    RELEASE_TAG: "v2.3.4-rc.1",
    EAS_PROJECT_ID: projectId,
    EXPO_TOKEN: "must-not-be-in-build-config",
    EXPO_PUBLIC_USE_MSW: "true",
    EXPO_PUBLIC_API_BASE_URL: "https://api.example.com/api/v1",
    EXPO_PUBLIC_PRIVACY_TERMS_URL: "https://example.com/privacy",
  });
  expect(configured.app.expo.version).toBe("2.3.4");
  expect(configured.app.expo.extra.eas.projectId).toBe(projectId);
  expect(configured.eas.build.release.env.EXPO_PUBLIC_USE_MSW).toBe("false");
  expect(configured.eas.build.release.env.EXPO_PUBLIC_API_BASE_URL).toBe(
    "https://api.example.com/api/v1",
  );
  expect(configured.eas.build.release.env.EXPO_PUBLIC_PRIVACY_TERMS_URL).toBe(
    "https://example.com/privacy",
  );
  expect(JSON.stringify(configured)).not.toContain(
    "must-not-be-in-build-config",
  );
  expect(app.expo.version).toBe(initialAppVersion);
  expect(
    configureRelease(configured.app, eas, { RELEASE_TAG: "v3.0.0" }).release
      .projectId,
  ).toBe(projectId);
  const unlinked = structuredClone(app);
  delete unlinked.expo.extra.eas;
  expect(() =>
    configureRelease(unlinked, eas, { RELEASE_TAG: "v2.3.4" }),
  ).toThrow("EAS_PROJECT_ID");
  for (const url of [
    "http://example.com/api/v1",
    "https://secret@example.com/api/v1",
    "https://example.com/",
  ]) {
    expect(() =>
      configureRelease(app, eas, {
        RELEASE_TAG: "v2.3.4",
        EAS_PROJECT_ID: projectId,
        EXPO_PUBLIC_API_BASE_URL: url,
      }),
    ).toThrow();
  }
});

test("only a successful APK/IPA pair from the exact project, tag commit and version can be collected", () => {
  expect(selectBuilds(builds, release).map((item) => item.filename)).toEqual([
    "ohakkom-v2.3.4-rc.1.apk",
    "ohakkom-v2.3.4-rc.1.ipa",
  ]);
  expect(() => selectBuilds([builds[0]], release)).toThrow();
  expect(() => selectBuilds([builds[0], builds[0]], release)).toThrow();
  for (const patch of [
    { status: "ERRORED" },
    { status: "IN_PROGRESS" },
    { buildProfile: "development" },
    { distribution: "STORE" },
    { app: { id: "another-project" } },
    { gitCommitHash: "b".repeat(40) },
    { appVersion: "1.0.0" },
    { isForIosSimulator: true },
    {
      artifacts: {
        applicationArchiveUrl: "https://expo.dev/artifacts/eas/id.tar.gz",
      },
    },
    {
      artifacts: {
        applicationArchiveUrl: "http://expo.dev/artifacts/eas/id.ipa",
      },
    },
  ])
    expect(() =>
      selectBuilds([builds[0], { ...builds[1], ...patch }], release),
    ).toThrow();
});

test("publication rejects missing, partial, changed or mislabeled artifacts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "ohakkom-release-test-"));
  try {
    const artifacts = ["apk", "ipa"].map((extension) => ({
      filename: `ohakkom-${release.tag}.${extension}`,
      sha256: createHash("sha256").update(extension).digest("hex"),
    }));
    const manifest = { ...release, artifacts };
    await writeFile(join(directory, artifacts[0].filename), "apk");
    await writeFile(join(directory, artifacts[1].filename), "ipa");
    await writeFile(
      join(directory, "SHA256SUMS"),
      artifacts.map((a) => `${a.sha256}  ${a.filename}\n`).join(""),
    );
    await expect(verifyAssets(directory, manifest)).resolves.toBeUndefined();
    await expect(
      verifyAssets(directory, { ...manifest, artifacts: [artifacts[0]] }),
    ).rejects.toThrow();
    await expect(
      verifyAssets(directory, {
        ...manifest,
        artifacts: [
          { ...artifacts[0], filename: "../outside.apk" },
          artifacts[1],
        ],
      }),
    ).rejects.toThrow();
    await writeFile(join(directory, artifacts[0].filename), "corrupted");
    await expect(verifyAssets(directory, manifest)).rejects.toThrow(
      "Checksum mismatch",
    );
    await rm(join(directory, artifacts[1].filename));
    await writeFile(join(directory, artifacts[0].filename), "apk");
    await expect(verifyAssets(directory, manifest)).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
