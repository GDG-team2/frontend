// Explicit, opt-in functional test against the disposable development server.
// Creates one synthetic account. Never writes credentials to the repository/report.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { createApiClient } from "../src/services/http-client.ts";
import { createBackend } from "../src/services/backend-client.ts";
import { toKoreaTime } from "../src/services/time.ts";

if (process.env.RUN_LIVE_API !== "1")
  throw new Error(
    "Set RUN_LIVE_API=1 to create synthetic test data on the development server.",
  );
const baseUrl = "https://ohakkom-backend.onrender.com/api/v1";
let token = null;
const checks = [];
const client = createApiClient({
  baseUrl,
  getToken: async () => token,
  onUnauthorized: async () => {
    token = null;
  },
  timeoutMs: 90000,
  fetcher: async (url, init) => {
    const response = await fetch(url, init);
    checks.push({
      method: init.method ?? "GET",
      path: new URL(url).pathname,
      status: response.status,
    });
    return response;
  },
});
const api = createBackend(client);
const credentials = {
  email: `frontend-qa-${randomUUID()}@example.com`,
  password: `Qa${randomUUID()}9`,
};
let stage = "signup";
try {
  await api.signup({
    ...credentials,
    nickname: "연동검증",
    regionCode: "1168010100",
    birthYear: 2000,
    agreements: {
      service: true,
      privacy: true,
      location: true,
      marketing: false,
    },
  });
  stage = "login/reissue";
  const login = await api.login(credentials);
  assert.ok(login.accessToken && login.refreshToken);
  const next = await api.reissue({ refreshToken: login.refreshToken });
  assert.ok(next.accessToken && next.refreshToken);
  token = next.accessToken;
  if (process.env.LIVE_QA_SESSION_FILE)
    await writeFile(
      process.env.LIVE_QA_SESSION_FILE,
      JSON.stringify({ ...credentials, ...next }),
      { mode: 0o600 },
    );
  stage = "profile/settings/preferences";
  assert.equal((await api.profile()).nickname, "연동검증");
  assert.equal(
    (
      await api.updateProfile({
        nickname: "검증완료",
        rankingNickname: "QA산책",
      })
    ).nickname,
    "검증완료",
  );
  await api.getSettings();
  const settings = await api.settings({
    quietEnabled: true,
    quietStart: "22:00",
    quietEnd: "07:00",
    rankingSetting: false,
  });
  assert.equal(settings.quietStart, "22:00:00");
  await api.preferences();
  assert.equal(
    (
      await api.updatePreferences({
        walkTime: 60,
        categories: ["WALK"],
        budget: "FREE",
        weeklyGoal: 1,
        moveType: "WALK",
      })
    ).weeklyGoal,
    1,
  );
  stage = "recommend/schedule";
  assert.equal((await api.currentMission()).hasActiveMission, false);
  const origin = { latitude: 37.498095, longitude: 127.02761 };
  const first = await api.recommend({ ...origin, mood: "BORED" });
  assert.ok(first.missionId && first.place && first.totalMinutes);
  await api.schedule(first.missionId, {
    departAt: toKoreaTime(Date.now() + 3600000),
  });
  assert.ok(
    (await api.scheduled()).missions.some(
      (m) => m.missionId === first.missionId,
    ),
  );
  const second = await api.recommend({ ...origin, rejectReason: "TOO_FAR" });
  await api.abort(second.missionId, { reason: "TIRED" });
  assert.equal((await api.mission(second.missionId)).status, "ABORTED");
  stage = "start/arrival dwell";
  await api.start(first.missionId);
  const coords = {
    latitude: first.place.latitude,
    longitude: first.place.longitude,
  };
  const arrival = await api.arrive(first.missionId, coords);
  assert.equal(arrival.status, "IN_PROGRESS");
  assert.ok(arrival.remainingDwellSeconds > 0);
  console.log(
    "Live API: arrival pending; waiting for the server-required dwell period.",
  );
  await new Promise((resolve) =>
    setTimeout(resolve, (arrival.remainingDwellSeconds + 1) * 1000),
  );
  assert.equal((await api.arrive(first.missionId, coords)).status, "ARRIVED");
  stage = "completion/rewards/history/map";
  const complete = await api.complete(first.missionId, { afterSurveyScore: 4 });
  assert.equal(complete.reward.earnedPoint, 50);
  assert.equal(complete.rhythm.thisWeekCount, 1);
  assert.equal((await api.mission(first.missionId)).status, "COMPLETED");
  assert.equal((await api.history({ period: "ALL" })).records.length, 1);
  assert.equal((await api.map({ period: "ALL" })).stats.outingCount, 1);
  assert.equal((await api.points()).currentPoint, 50);
  await api.badges();
  assert.equal((await api.ranking()).myRanking.isParticipating, false);
  const report = {
    verifiedAt: new Date().toISOString(),
    baseUrl,
    outcome: "pass",
    operations: new Set(
      checks.map(
        (r) => `${r.method} ${r.path.replace(/\/\d+(?=\/|$)/g, "/{id}")}`,
      ),
    ).size,
    checks,
  };
  await writeFile(
    process.env.LIVE_QA_REPORT ?? "/tmp/ohakkom-live-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      outcome: "pass",
      operations: report.operations,
      requests: checks.length,
    }),
  );
} catch (error) {
  await writeFile(
    process.env.LIVE_QA_REPORT ?? "/tmp/ohakkom-live-report.json",
    JSON.stringify(
      {
        outcome: "failed",
        stage,
        status: error.status,
        code: error.code,
        message: error.message,
        checks,
      },
      null,
      2,
    ),
  );
  console.error(
    `Live verification failed at ${stage}: ${error.code ?? ""} ${error.message}`,
  );
  process.exitCode = 1;
}
