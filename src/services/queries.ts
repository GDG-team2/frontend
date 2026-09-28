import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend } from "./backend";
import { toMission, toProfile } from "./adapters";
import { getMissionCoordinates } from "./location";
import { useAppStore } from "@/store/app-store";
import type { Mission } from "@/types/domain";
import type { UserSettingsUpdateRequest } from "@/types/api";

export const queryKeys = {
  me: ["me"] as const,
  recommendation: ["mission", "current"] as const,
  points: ["points"] as const,
  badges: ["badges"] as const,
  ranking: ["ranking"] as const,
};
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => toProfile(await backend.profile()),
  });
}

// Reads never generate a mission. In particular, remounts and retries only GET current.
export function useRecommendation() {
  const client = useQueryClient();
  return useQuery({
    queryKey: queryKeys.recommendation,
    queryFn: async () => {
      const data = await backend.currentMission();
      if (!data.hasActiveMission || !data.mission) return null;
      const mission = toMission(data.mission);
      const previous = client.getQueryData<Mission | null>(
        queryKeys.recommendation,
      );
      if (previous?.id === mission.id)
        return {
          ...mission,
          distanceM: previous.distanceM,
          durationMin: previous.durationMin,
        };
      return mission;
    },
  });
}
export function useRecommendMission() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      toMission(await backend.recommend(await getMissionCoordinates())),
    onSuccess: (mission) =>
      client.setQueryData(queryKeys.recommendation, mission),
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
      const current = await backend.currentMission();
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
      useAppStore.getState().saveSettings(data);
      await client.invalidateQueries({ queryKey: queryKeys.ranking });
    },
  });
}
