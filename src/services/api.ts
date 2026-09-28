import { API_BASE_URL, USE_MSW } from "@/constants/api";
import { createApiClient } from "@/services/http-client";
import { clearAccessToken, getAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";
export { ApiError } from "./http-client";

export const apiRequest = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: getAccessToken,
  onUnauthorized: async () => {
    await clearAccessToken();
    useAppStore.getState().reset();
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
