import type * as DTO from "@/types/api";
import type { createApiClient } from "./http-client";
export type HistoryFilter = {
  period?: "WEEK" | "MONTH" | "ALL";
  yearMonth?: string;
  category?: DTO.MissionRecommendRequest["category"];
  freeOnly?: boolean;
  page?: number;
  size?: number;
};
function query(filters: HistoryFilter) {
  const values = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== "",
  );
  return new URLSearchParams(
    values.map(([key, value]) => [key, String(value)]),
  ).toString();
}
export function createBackend(request: ReturnType<typeof createApiClient>) {
  const apiGet = <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { signal });
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
    profile: (signal?: AbortSignal) =>
      apiGet<DTO.UserProfileResponse>("/users/profile", signal),
    updateProfile: (body: DTO.UserProfileUpdateRequest) =>
      apiPatch<DTO.UserProfileResponse>("/users/profile", body),
    reissue: (body: DTO.ReissueRequest) =>
      apiPost<DTO.ReissueResponse>("/auth/reissue", body),
    getSettings: (signal?: AbortSignal) =>
      apiGet<DTO.UserSettingsUpdateResponse>("/users/settings", signal),
    preferences: (signal?: AbortSignal) =>
      apiGet<DTO.PreferenceResponse>("/users/preferences", signal),
    updatePreferences: (body: DTO.PreferenceUpdateRequest) =>
      apiPatch<DTO.PreferenceResponse>("/users/preferences", body),
    scheduled: (signal?: AbortSignal) =>
      apiGet<DTO.ScheduledMissionsResponse>("/missions/scheduled", signal),
    schedule: (id: number, body: DTO.MissionScheduleRequest) =>
      request<DTO.ScheduledMissionInfo>(`/missions/${id}/schedule`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    history: (filters: HistoryFilter = {}, signal?: AbortSignal) =>
      apiGet<DTO.MissionHistoryResponse>(
        `/missions/history?${query(filters)}`,
        signal,
      ),
    mission: (id: number, signal?: AbortSignal) =>
      apiGet<DTO.MissionDetailResponse>(`/missions/${id}`, signal),
    map: (
      filters: Pick<HistoryFilter, "period" | "yearMonth"> = {},
      signal?: AbortSignal,
    ) =>
      apiGet<DTO.MissionMapResponse>(`/missions/map?${query(filters)}`, signal),
    settings: (body: DTO.UserSettingsUpdateRequest) =>
      apiPatch<DTO.UserSettingsUpdateResponse>("/users/settings", body),
    currentMission: (signal?: AbortSignal) =>
      apiGet<DTO.CurrentMissionResponse>("/missions/current", signal),
    recommend: (body: DTO.MissionRecommendRequest) =>
      apiPost<DTO.MissionRecommendResponse>("/missions/recommendation", body),
    start: (id: number) =>
      apiPost<DTO.MissionStartResponse>(`/missions/${id}/start`),
    arrive: (id: number, body: DTO.MissionArriveRequest) =>
      apiPost<DTO.MissionArriveResponse>(`/missions/${id}/arrive`, body),
    complete: (id: number, body: DTO.MissionCompleteRequest) =>
      apiPost<DTO.MissionCompleteResponse>(`/missions/${id}/complete`, body),
    abort: (id: number, body?: DTO.MissionAbortRequest) =>
      apiPost<DTO.MissionAbortResponse>(`/missions/${id}/abort`, body),
    points: (page = 0, size = 20) =>
      apiGet<DTO.PointHistoryResponse>(
        `/rewards/points/history?page=${page}&size=${size}`,
      ),
    badges: () => apiGet<DTO.BadgeListResponse>("/rewards/badges"),
    ranking: (limit = 50) =>
      apiGet<DTO.RegionRankingResponse>(`/rankings/my-region?limit=${limit}`),
  };
}
