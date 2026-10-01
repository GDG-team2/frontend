import { expect, test } from "bun:test";
import { createApiClient } from "../src/services/http-client";
import { createSessionManager } from "../src/services/session-manager";
import {
  parseKoreaTime,
  toKoreaTime,
  validDeparture,
} from "../src/services/time";
import {
  birthYearValue,
  validateCredentials,
} from "../src/services/validation";

const expired = () =>
  Response.json({ code: "TOKEN_EXPIRED", message: "expired" }, { status: 401 });
const base = {
  baseUrl: "https://example.test/api/v1",
  onUnauthorized: async () => {},
};

test("parallel expiry responses share a single refresh and replay each original request once", async () => {
  let token = "old";
  let refreshes = 0;
  const requests = [];
  const request = createApiClient({
    ...base,
    getToken: async () => token,
    refreshSession: async () => {
      refreshes++;
      await new Promise((r) => setTimeout(r, 5));
      token = "new";
      return token;
    },
    fetcher: async (url, init) => {
      requests.push({ url, method: init.method, body: init.body });
      return init.headers.get("Authorization") === "Bearer old"
        ? expired()
        : Response.json({ ok: true });
    },
  });
  await Promise.all([
    request("/users/profile"),
    request("/users/settings"),
    request("/missions/1/start", { method: "POST" }),
  ]);
  expect(refreshes).toBe(1);
  expect(requests).toHaveLength(6);
  expect(requests.filter((r) => r.method === "POST")).toHaveLength(2);
});

test("a failed refresh due to a network/server error preserves the session for a later retry", async () => {
  let invalidations = 0;
  const request = createApiClient({
    ...base,
    getToken: async () => "old",
    onUnauthorized: async () => invalidations++,
    refreshSession: async () => {
      throw new Error("offline");
    },
    fetcher: async () => expired(),
  });
  await expect(request("/users/profile")).rejects.toMatchObject({ status: 0 });
  expect(invalidations).toBe(0);
});

test("a second 401 stops the replay; auth requests are never refreshed", async () => {
  let token = "old";
  let calls = 0;
  let refreshes = 0;
  let invalidations = 0;
  const request = createApiClient({
    ...base,
    getToken: async () => token,
    onUnauthorized: async () => invalidations++,
    refreshSession: async () => {
      refreshes++;
      token = "new";
      return token;
    },
    fetcher: async () => {
      calls++;
      return expired();
    },
  });
  await expect(request("/users/profile")).rejects.toMatchObject({
    code: "TOKEN_EXPIRED",
  });
  expect(calls).toBe(2);
  expect(refreshes).toBe(1);
  expect(invalidations).toBe(1);
  await expect(request("/auth/login")).rejects.toMatchObject({ status: 401 });
  expect(refreshes).toBe(1);
  expect(invalidations).toBe(1);
});

test("late errors from an old account do not clear the new account", async () => {
  let token = "old";
  let invalidations = 0;
  const request = createApiClient({
    ...base,
    getToken: async () => token,
    onUnauthorized: async () => invalidations++,
    fetcher: async () => {
      token = "different-account";
      return Response.json({ code: "INVALID_TOKEN" }, { status: 401 });
    },
  });
  await expect(request("/users/profile")).rejects.toMatchObject({
    status: 401,
  });
  expect(invalidations).toBe(0);
});

test("request cancellation is forwarded; JSON null is valid and error details survive", async () => {
  const controller = new AbortController();
  const request = createApiClient({
    ...base,
    getToken: async () => null,
    fetcher: async (_, init) =>
      new Promise((_, reject) =>
        init.signal.addEventListener("abort", () => reject(new Error("abort"))),
      ),
  });
  const pending = request("/missions/current", { signal: controller.signal });
  await new Promise((resolve) => setTimeout(resolve, 0));
  controller.abort();
  await expect(pending).rejects.toMatchObject({ code: "REQUEST_ABORTED" });
  expect(
    await createApiClient({
      ...base,
      getToken: async () => null,
      fetcher: async () => Response.json(null),
    })("/missions/current"),
  ).toBeNull();
  await expect(
    createApiClient({
      ...base,
      getToken: async () => null,
      fetcher: async () =>
        Response.json(
          {
            code: "INVALID_INPUT",
            message: "입력 오류",
            details: { nickname: "이름을 입력하세요" },
          },
          { status: 400 },
        ),
    })("/users/profile"),
  ).rejects.toMatchObject({
    code: "INVALID_INPUT",
    details: { nickname: "이름을 입력하세요" },
  });
});

test("session rotation is atomic and cannot restore a logged-out or changed account", async () => {
  let stored = null;
  const manager = createSessionManager({
    read: async () => stored,
    write: async (v) => {
      stored = v;
    },
    remove: async () => {
      stored = null;
    },
  });
  const first = { accessToken: "a", refreshToken: "r1" };
  const second = { accessToken: "b", refreshToken: "r2" };
  await manager.save(first);
  const firstVersion = manager.version();
  expect(await manager.replace(first, second)).toBe("b");
  expect(await manager.get()).toEqual(second);
  expect(manager.version()).toBe(firstVersion);
  await manager.clear();
  expect(manager.version()).toBeGreaterThan(firstVersion);
  expect(await manager.replace(second, first)).toBeNull();
  expect(await manager.get()).toBeNull();
  await manager.save(second);
  expect(
    await manager.replace(first, { accessToken: "late", refreshToken: "late" }),
  ).toBeNull();
  expect(await manager.get()).toEqual(second);
  expect(await manager.invalidate("old-account")).toBe(false);
  expect(await manager.get()).toEqual(second);
  expect(await manager.invalidate(second.accessToken)).toBe(true);
  expect(await manager.get()).toBeNull();
  stored = "corrupt";
  expect(await manager.get()).toBeNull();
});

test("timezone-less timestamps and departure validation always use Korea time", () => {
  const now = Date.UTC(2026, 8, 30, 8, 0);
  expect(parseKoreaTime("2026-09-30T17:00:00")).toBe(now);
  expect(parseKoreaTime("2026-09-30T08:00:00Z")).toBe(now);
  expect(toKoreaTime(now)).toBe("2026-09-30T17:00:00");
  expect(validDeparture("2026-09-30T18:00", now)).toBe(true);
  expect(validDeparture("2026-09-30T16:00", now)).toBe(false);
  expect(validDeparture("2026-10-15T18:00", now)).toBe(false);
  expect(validDeparture("2026-02-30T18:00", Date.UTC(2026, 1, 27))).toBe(false);
});

test("signup validation uses optional birth year and real password rules", () => {
  expect(birthYearValue("")).toBeUndefined();
  expect(birthYearValue("2000")).toBe(2000);
  expect(() => birthYearValue("2050")).toThrow();
  expect(() => birthYearValue("2000x")).toThrow();
  expect(() =>
    validateCredentials("a@example.com", "Password1", true),
  ).not.toThrow();
  expect(() => validateCredentials("invalid", "Password1", true)).toThrow();
  expect(() =>
    validateCredentials("a@example.com", "password", true),
  ).toThrow();
});

test("late expired or successful responses never replay or return data into a changed account", async () => {
  for (const response of [
    expired,
    () => Response.json({ nickname: "previous account" }),
  ]) {
    let version = 1;
    let token = "first";
    let calls = 0;
    let refreshes = 0;
    let invalidations = 0;
    const request = createApiClient({
      ...base,
      getToken: async () => token,
      getSessionVersion: () => version,
      onUnauthorized: async () => invalidations++,
      refreshSession: async () => {
        refreshes++;
        return token;
      },
      fetcher: async () => {
        calls++;
        token = "second";
        version++;
        return response();
      },
    });
    await expect(
      request("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ nickname: "first" }),
      }),
    ).rejects.toMatchObject({ code: "SESSION_CHANGED" });
    expect(calls).toBe(1);
    expect(refreshes).toBe(0);
    expect(invalidations).toBe(0);
  }
});
