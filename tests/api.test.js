import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { setupServer } from "msw/node";
import {
  handlers,
  resetMockState,
  advanceMockTime,
} from "../src/mocks/handlers";
import { createApiClient, ApiError } from "../src/services/http-client";
import { createBackend } from "../src/services/backend-client";
import { toMission, toProfile } from "../src/services/adapters";
import { API_BASE_URL } from "../src/constants/api";
import spec from "../api.json";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
beforeEach(() => resetMockState());
let token = "qa-access-token";
let unauthorized = 0;
let scenario = "success";
const observed = new Set();
function validate(value, schema, where) {
  if (schema.$ref)
    return validate(
      value,
      spec.components.schemas[schema.$ref.split("/").at(-1)],
      where,
    );
  // The contract describes null active missions and acquisition dates without nullable flags.
  if (
    value === null &&
    [
      "mission",
      "acquiredAt",
      "startedAt",
      "scheduledAt",
      "arrivedAt",
      "stepCount",
      "message",
      "abort",
      "rank",
      "movedDistanceMeters",
      "nextRecommendationNote",
      "startDate",
      "endDate",
      "averageSatisfaction",
      "beforeMood",
      "beforeScore",
      "afterScore",
      "change",
    ].includes(where.split(".").at(-1))
  )
    return;
  if (schema.type === "object") {
    expect(value !== null && typeof value === "object", where).toBe(true);
    for (const key of schema.required ?? [])
      expect(value[key], `${where}.${key}`).toBeDefined();
    for (const [key, item] of Object.entries(value)) {
      expect(
        schema.properties[key],
        `${where}.${key} is documented`,
      ).toBeDefined();
      validate(item, schema.properties[key], `${where}.${key}`);
    }
  } else if (schema.type === "array") {
    expect(Array.isArray(value), where).toBe(true);
    value.forEach((item) => validate(item, schema.items, where));
  } else {
    expect(typeof value, where).toBe(
      schema.type === "integer" ? "number" : schema.type,
    );
    if (schema.enum) expect(schema.enum, where).toContain(value);
    if (schema.type === "integer")
      expect(Number.isInteger(value), where).toBe(true);
    if (schema.minimum != null)
      expect(value).toBeGreaterThanOrEqual(schema.minimum);
    if (schema.maximum != null)
      expect(value).toBeLessThanOrEqual(schema.maximum);
  }
}
const request = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: async () => token,
  onUnauthorized: async () => {
    unauthorized++;
    token = null;
  },
  scenario: () => scenario,
  fetcher: async (url, init) => {
    const path = new URL(url).pathname;
    const template = Object.keys(spec.paths).find((key) =>
      new RegExp(`^${key.replace(/\{[^}]+\}/g, "[0-9]+")}$`).test(path),
    );
    expect(template, path).toBeDefined();
    const method = (init.method ?? "GET").toLowerCase();
    const operation = spec.paths[template][method];
    expect(operation, `${method} ${path}`).toBeDefined();
    observed.add(`${method} ${template}`);
    if (!path.includes("/auth/"))
      expect(init.headers.get("Authorization")).toBe(`Bearer ${token}`);
    else expect(init.headers.has("Authorization")).toBe(false);
    if (operation.requestBody && init.body)
      validate(
        JSON.parse(init.body),
        operation.requestBody.content["application/json"].schema,
        "request",
      );
    else expect(init.body).toBeUndefined();
    const response = await fetch(url, init);
    if (response.ok)
      validate(
        await response.clone().json(),
        operation.responses[String(response.status)].content["*/*"].schema,
        "response",
      );
    return response;
  },
});
const api = createBackend(request);
beforeEach(() => {
  token = "qa-access-token";
  unauthorized = 0;
  scenario = "success";
});

test("all documented operations: signup/login, recover/start/arrive/complete, rewards/settings/ranking/abort", async () => {
  await api.signup({
    email: "user@example.com",
    password: "secret123!",
    nickname: "산책",
    birthYear: 1990,
    agreements: {
      service: true,
      privacy: true,
      location: true,
      marketing: false,
    },
    regionCode: "1168010100",
  });
  expect(
    (await api.login({ email: "user@example.com", password: "secret123!" }))
      .accessToken,
  ).toBe("qa-access-token");
  expect(
    (await api.reissue({ refreshToken: "qa-refresh-token" })).refreshToken,
  ).toBe("qa-refresh-token");
  expect(toProfile(await api.profile()).points).toBe(1500);
  expect(
    (await api.updateProfile({ nickname: "산책러", rankingNickname: "랭킹러" }))
      .nickname,
  ).toBe("산책러");
  expect((await api.preferences()).walkTime).toBe(60);
  expect((await api.updatePreferences({ weeklyGoal: 1 })).weeklyGoal).toBe(1);
  expect((await api.getSettings()).quietEnabled).toBe(false);
  expect((await api.currentMission()).hasActiveMission).toBe(false);
  const mission = await api.recommend({ latitude: 37.499, longitude: 127.028 });
  expect(toMission(mission).destination).toBe(mission.place.name);
  expect((await api.currentMission()).mission.missionId).toBe(
    mission.missionId,
  );
  await api.schedule(mission.missionId, {
    departAt: new Date(Date.now() + 3600000).toISOString(),
  });
  expect((await api.scheduled()).missions[0].missionId).toBe(mission.missionId);
  await api.start(mission.missionId);
  expect((await api.currentMission()).mission.status).toBe("IN_PROGRESS");
  await expect(
    api.complete(mission.missionId, { afterSurveyScore: 5 }),
  ).rejects.toBeInstanceOf(ApiError);
  await expect(
    api.arrive(mission.missionId, { latitude: 0, longitude: 0 }),
  ).rejects.toMatchObject({ status: 400 });
  await api.arrive(mission.missionId, {
    latitude: mission.place.latitude,
    longitude: mission.place.longitude,
  });
  expect((await api.currentMission()).mission.status).toBe("IN_PROGRESS");
  advanceMockTime(31000);
  await api.arrive(mission.missionId, {
    latitude: mission.place.latitude,
    longitude: mission.place.longitude,
  });
  expect((await api.currentMission()).mission.status).toBe("ARRIVED");
  const result = await api.complete(mission.missionId, {
    afterSurveyScore: 4,
    stepCount: 1250,
  });
  expect(result.reward.currentTotalPoint).toBe(1550);
  expect(result.rhythm.goalJustAchieved).toBe(true);
  expect((await api.mission(mission.missionId)).status).toBe("COMPLETED");
  expect((await api.history({ period: "ALL" })).records).toHaveLength(1);
  expect((await api.map({ period: "ALL" })).places).toHaveLength(1);
  expect((await api.currentMission()).hasActiveMission).toBe(false);
  expect((await api.profile()).asset.currentPoint).toBe(1550);
  await expect(
    api.complete(mission.missionId, { afterSurveyScore: 5 }),
  ).rejects.toMatchObject({ status: 409 });
  expect((await api.points(0, 1)).history).toHaveLength(1);
  expect((await api.points(1, 1)).history).toHaveLength(0);
  expect((await api.badges()).summary.totalCount).toBeGreaterThan(0);
  await api.settings({
    allAlarm: false,
    rankingSetting: true,
    quietStart: "22:00",
    quietEnabled: true,
  });
  expect((await api.ranking(1)).myRanking.isParticipating).toBe(true);
  expect((await api.ranking(1)).leaderboard).toHaveLength(1);
  const next = await api.recommend({ latitude: 37.499, longitude: 127.028 });
  await api.start(next.missionId);
  await api.abort(next.missionId);
  expect((await api.currentMission()).hasActiveMission).toBe(false);
  const operations = Object.entries(spec.paths).flatMap(([path, methods]) =>
    Object.keys(methods).map((method) => `${method} ${path}`),
  );
  expect([...observed].sort()).toEqual(operations.sort());
});

test("401 clears a protected session; failed login does not invalidate an existing token", async () => {
  token = "expired";
  await expect(api.profile()).rejects.toMatchObject({ status: 401 });
  expect(unauthorized).toBe(1);
  expect(token).toBeNull();
  const authRequest = createApiClient({
    baseUrl: API_BASE_URL,
    getToken: async () => "existing",
    onUnauthorized: async () => unauthorized++,
    fetcher: async () => new Response("{}", { status: 401 }),
  });
  await expect(
    authRequest("/auth/login", { method: "POST" }),
  ).rejects.toMatchObject({ status: 401 });
  expect(unauthorized).toBe(1);
});
test("empty and failed requests do not create or clear missions", async () => {
  scenario = "empty";
  expect((await api.badges()).badges).toEqual([]);
  expect((await api.ranking()).leaderboard).toEqual([]);
  await expect(
    api.recommend({ latitude: 37.499, longitude: 127.028 }),
  ).rejects.toMatchObject({ status: 404 });
  expect((await api.currentMission()).hasActiveMission).toBe(false);
  scenario = "success";
  const mission = await api.recommend({ latitude: 37.499, longitude: 127.028 });
  await api.start(mission.missionId);
  scenario = "error";
  await expect(api.abort(mission.missionId)).rejects.toMatchObject({
    status: 503,
  });
  scenario = "success";
  expect((await api.currentMission()).mission.status).toBe("IN_PROGRESS");
});
test("client handles network errors, timeout, proxy errors, empty body and invalid JSON", async () => {
  const options = {
    baseUrl: "https://example.test/api/v1/",
    getToken: async () => null,
    onUnauthorized: async () => {},
  };
  await expect(
    createApiClient({
      ...options,
      fetcher: async () => {
        throw new TypeError("offline");
      },
    })("/users/profile"),
  ).rejects.toMatchObject({ status: 0 });
  await expect(
    createApiClient({
      ...options,
      fetcher: async () =>
        new Response("<html>Bad gateway</html>", { status: 502 }),
    })("/users/profile"),
  ).rejects.toMatchObject({ status: 502 });
  await expect(
    createApiClient({
      ...options,
      fetcher: async () => new Response("bad json"),
    })("/users/profile"),
  ).rejects.toThrow("응답 형식");
  expect(
    await createApiClient({
      ...options,
      fetcher: async () => new Response(null, { status: 204 }),
    })("/users/profile"),
  ).toBeNull();
  await expect(
    createApiClient({
      ...options,
      timeoutMs: 5,
      fetcher: async (_, { signal }) =>
        new Promise((resolve, reject) =>
          signal.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    })("/users/profile"),
  ).rejects.toThrow("초과");
});
test("live requests omit QA headers and append Authorization; adapters reject invalid mission IDs", async () => {
  let captured;
  await createApiClient({
    baseUrl: "https://example.test/api/v1/",
    getToken: async () => "token",
    onUnauthorized: async () => {},
    fetcher: async (url, init) => {
      captured = { url, init };
      return Response.json({});
    },
  })("/users/profile");
  expect(captured.url).toBe("https://example.test/api/v1/users/profile");
  expect(captured.init.headers.get("Authorization")).toBe("Bearer token");
  expect(captured.init.headers.has("x-ohakkom-scenario")).toBe(false);
  expect(() => toMission({ missionId: "mission-01" })).toThrow();
  expect(() => toProfile({})).toThrow();
});

test("dwell resets outside 80m; scheduled missions survive a replacement recommendation", async () => {
  const first = await api.recommend({
    latitude: 37.499,
    longitude: 127.028,
    mood: "TIRED",
  });
  await api.schedule(first.missionId, {
    departAt: new Date(Date.now() + 3600000).toISOString(),
  });
  const second = await api.recommend({
    latitude: 37.499,
    longitude: 127.028,
    rejectReason: "NO_SPENDING",
  });
  expect((await api.scheduled()).missions).toHaveLength(1);
  expect((await api.currentMission()).mission.missionId).toBe(second.missionId);
  await api.start(first.missionId);
  expect((await api.currentMission()).mission.missionId).toBe(first.missionId);
  const coords = {
    latitude: first.place.latitude,
    longitude: first.place.longitude,
  };
  expect(
    (await api.arrive(first.missionId, coords)).remainingDwellSeconds,
  ).toBe(30);
  advanceMockTime(15000);
  await expect(
    api.arrive(first.missionId, { latitude: 0, longitude: 0 }),
  ).rejects.toMatchObject({ code: "NOT_ENOUGH_DISTANCE" });
  expect(
    (await api.arrive(first.missionId, coords)).remainingDwellSeconds,
  ).toBe(30);
  advanceMockTime(31000);
  expect((await api.arrive(first.missionId, coords)).status).toBe("ARRIVED");
  await api.abort(first.missionId, { reason: "TIRED" });
  expect((await api.mission(first.missionId)).abort.reason).toBe("TIRED");
  expect((await api.profile()).asset.currentPoint).toBe(1500);
});
