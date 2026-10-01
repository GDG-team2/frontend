import { API_BASE_URL, USE_MSW } from "@/constants/api";
import { ApiError, createApiClient } from "@/services/http-client";
import {
  invalidateSession,
  getAccessToken,
  getSession,
  getSessionVersion,
  replaceSession,
} from "@/services/session";
import { useAppStore } from "@/store/app-store";
export { ApiError } from "./http-client";

export const apiRequest = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: getAccessToken,
  getSessionVersion,
  refreshSession: async (expiredToken) => {
    const previous = await getSession();
    if (!previous || previous.accessToken !== expiredToken)
      return previous?.accessToken ?? null;
    try {
      const next = await apiRequest<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/reissue", {
        method: "POST",
        body: JSON.stringify({ refreshToken: previous.refreshToken }),
      });
      if (!next.accessToken || !next.refreshToken)
        throw new ApiError("인증 응답을 확인할 수 없어요.", 502);
      return replaceSession(previous, next);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        if (await invalidateSession(expiredToken)) {
          useAppStore.getState().reset();
        }
      }
      throw error;
    }
  },
  onUnauthorized: async (token) => {
    if (await invalidateSession(token)) useAppStore.getState().reset();
  },
  scenario: USE_MSW ? () => useAppStore.getState().qaScenario : undefined,
});
export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}
export function apiPost<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
export function apiPatch<T>(path: string, body: unknown) {
  return apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}
