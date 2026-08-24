import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/services/api";
import type { Benefit, Mission, NotificationItem, OutingRecord, RankingEntry, UserProfile } from "@/types/domain";

export const queryKeys = {
  me: ["me"] as const,
  recommendation: ["mission", "recommendation"] as const,
  history: ["history"] as const,
  historyDetail: (id: string) => ["history", id] as const,
  notifications: ["notifications"] as const,
  benefits: ["benefits"] as const,
  ranking: ["ranking"] as const,
};

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: () => apiGet<UserProfile>("/me") });
}

export function useRecommendation() {
  return useQuery({ queryKey: queryKeys.recommendation, queryFn: () => apiGet<Mission | null>("/missions/recommendation") });
}

export function useHistory() {
  return useQuery({ queryKey: queryKeys.history, queryFn: () => apiGet<OutingRecord[]>("/history") });
}

export function useHistoryDetail(id: string) {
  return useQuery({ queryKey: queryKeys.historyDetail(id), queryFn: () => apiGet<OutingRecord>(`/history/${id}`) });
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: () => apiGet<NotificationItem[]>("/notifications") });
}

export function useBenefits() {
  return useQuery({ queryKey: queryKeys.benefits, queryFn: () => apiGet<Benefit[]>("/benefits") });
}

export function useRanking() {
  return useQuery({ queryKey: queryKeys.ranking, queryFn: () => apiGet<RankingEntry[]>("/ranking") });
}
