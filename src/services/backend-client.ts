import type * as DTO from "@/types/api";
import type { createApiClient } from "./http-client";
export function createBackend(request: ReturnType<typeof createApiClient>) {
  const apiGet = <T>(path: string) => request<T>(path);
  const apiPost = <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const apiPatch = <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) });

  return {
    signup: (body: DTO.SignupRequest) =>
      apiPost<DTO.SignupResponse>("/auth/signup", body),
    login: (body: DTO.LoginRequest) =>
      apiPost<DTO.LoginResponse>("/auth/login", body),
    profile: () => apiGet<DTO.UserProfileResponse>("/users/profile"),
    settings: (body: DTO.UserSettingsUpdateRequest) =>
      apiPatch<DTO.UserSettingsUpdateResponse>("/users/settings", body),
    currentMission: () =>
      apiGet<DTO.CurrentMissionResponse>("/missions/current"),
    recommend: (body: DTO.MissionRecommendRequest) =>
      apiPost<DTO.MissionRecommendResponse>("/missions/recommendation", body),
    start: (id: number) =>
      apiPost<DTO.MissionStartResponse>(`/missions/${id}/start`),
    arrive: (id: number, body: DTO.MissionArriveRequest) =>
      apiPost<DTO.MissionArriveResponse>(`/missions/${id}/arrive`, body),
    complete: (id: number, body: DTO.MissionCompleteRequest) =>
      apiPost<DTO.MissionCompleteResponse>(`/missions/${id}/complete`, body),
    abort: (id: number) =>
      apiPost<DTO.MissionAbortResponse>(`/missions/${id}/abort`),
    points: (page = 0, size = 20) =>
      apiGet<DTO.PointHistoryResponse>(
        `/rewards/points/history?page=${page}&size=${size}`,
      ),
    badges: () => apiGet<DTO.BadgeListResponse>("/rewards/badges"),
    ranking: (limit = 50) =>
      apiGet<DTO.RegionRankingResponse>(`/rankings/my-region?limit=${limit}`),
  };
}
