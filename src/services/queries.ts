import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend } from "./backend";
import type { HistoryFilter } from "./backend-client";
import { toMission, toProfile } from "./adapters";
import { getMissionCoordinates } from "./location";
import { useAppStore } from "@/store/app-store";
import type { Mission } from "@/types/domain";
import type {
  UserSettingsUpdateRequest,
  MissionRecommendRequest,
  PreferenceUpdateRequest,
  UserProfileUpdateRequest,
} from "@/types/api";

export const queryKeys = {
  me: ["me"] as const,
  recommendation: ["mission", "current"] as const,
  points: ["points"] as const,
  badges: ["badges"] as const,
  ranking: ["ranking"] as const,
  settings: ["settings"] as const,
  preferences: ["preferences"] as const,
  scheduled: ["mission", "scheduled"] as const,
  history: ["history"] as const,
  map: ["map"] as const,
};
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => toProfile(await backend.profile(signal)),
  });
}

// Reads never generate a mission. In particular, remounts and retries only GET current.
export function useRecommendation() {
  const client = useQueryClient();
  return useQuery({
    queryKey: queryKeys.recommendation,
    queryFn: async ({ signal }) => {
      const data = await backend.currentMission(signal);
      if (!data.hasActiveMission || !data.mission) return null;
      const mission = toMission(data.mission);
      const previous = client.getQueryData<Mission | null>(
        queryKeys.recommendation,
      );
      if (previous?.id === mission.id)
        return {
          ...previous,
          ...mission,
          reason: previous.reason,
          distanceM: previous.distanceM,
          durationMin: previous.durationMin,
          routeDistanceM: previous.routeDistanceM,
          oneWayMin: previous.oneWayMin,
          estCost: previous.estCost,
        };
      return mission;
    },
  });
}
export function useRecommendMission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (
      options?: Omit<MissionRecommendRequest, "latitude" | "longitude">,
    ) =>
      toMission(
        await backend.recommend({
          ...(await getMissionCoordinates()),
          ...options,
        }),
      ),
    onSuccess: (mission) => {
      if (useAppStore.getState().authenticated)
        client.setQueryData(queryKeys.recommendation, mission);
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: queryKeys.recommendation });
    },
  });
}
export function useMissionAction<T>(action: (mission: Mission) => Promise<T>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Reconcile server state before writes, including after a timeout or app restart.
      const shown = client.getQueryData<Mission | null>(
        queryKeys.recommendation,
      );
      const current = await backend.currentMission();
      if (shown && current.mission?.missionId !== Number(shown.id))
        throw new Error(
          "미션 상태가 바뀌었어요. 현재 미션을 확인하고 다시 시도해 주세요.",
        );
      if (!current.hasActiveMission || !current.mission)
        throw new Error("진행 중인 미션이 없어요. 홈에서 다시 확인해 주세요.");
      return action(toMission(current.mission));
    },
    onSettled: async () => {
      await Promise.all(
        [
          queryKeys.recommendation,
          queryKeys.me,
          queryKeys.points,
          queryKeys.badges,
          queryKeys.ranking,
          queryKeys.scheduled,
          queryKeys.history,
          queryKeys.map,
        ].map((queryKey) => client.invalidateQueries({ queryKey })),
      );
    },
  });
}
export function useRanking() {
  return useQuery({
    queryKey: queryKeys.ranking,
    queryFn: () => backend.ranking(),
  });
}
export function useBadges() {
  return useQuery({ queryKey: queryKeys.badges, queryFn: backend.badges });
}
export function usePoints(page: number) {
  return useQuery({
    queryKey: [...queryKeys.points, page],
    queryFn: () => backend.points(page),
  });
}
export function useSaveSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: UserSettingsUpdateRequest) => backend.settings(patch),
    onSuccess: async (data) => {
      client.setQueryData(queryKeys.settings, data);
      await client.invalidateQueries({ queryKey: queryKeys.ranking });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => backend.getSettings(signal),
  });
}
export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: ({ signal }) => backend.preferences(signal),
  });
}
export function useSavePreferences() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: PreferenceUpdateRequest) =>
      backend.updatePreferences(patch),
    onSuccess: async (data) => {
      client.setQueryData(queryKeys.preferences, data);
      await client.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
export function useSaveProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: UserProfileUpdateRequest) =>
      backend.updateProfile(patch),
    onSuccess: async (data) => {
      client.setQueryData(queryKeys.me, toProfile(data));
      await client.invalidateQueries({ queryKey: queryKeys.ranking });
    },
  });
}
export function useHistory(filters: HistoryFilter) {
  return useQuery({
    queryKey: [...queryKeys.history, filters],
    queryFn: ({ signal }) => backend.history(filters, signal),
  });
}
export function useScheduled() {
  return useQuery({
    queryKey: queryKeys.scheduled,
    queryFn: ({ signal }) => backend.scheduled(signal),
  });
}
export function useMissionDetail(id: number) {
  return useQuery({
    queryKey: ["mission", "detail", id],
    queryFn: ({ signal }) => backend.mission(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}
export function useMissionMap(
  filters: Pick<HistoryFilter, "period" | "yearMonth">,
) {
  return useQuery({
    queryKey: [...queryKeys.map, filters],
    queryFn: ({ signal }) => backend.map(filters, signal),
  });
}
