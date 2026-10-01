import type {
  CurrentMissionResponseActiveMissionInfo,
  MissionRecommendResponse,
  UserProfileResponse,
} from "@/types/api";
import type { Mission, UserProfile } from "@/types/domain";

export function toProfile(data: UserProfileResponse): UserProfile {
  if (!data.userUuid || !data.nickname)
    throw new Error("프로필 응답에 사용자 정보가 없어요.");
  return {
    id: data.userUuid,
    nickname: data.nickname,
    district: data.region?.regionName ?? "동네 미등록",
    rhythmWeeks: data.rhythm?.currentWeeks ?? 0,
    weeklyGoal: data.rhythm?.weeklyGoal ?? 3,
    weeklyDone: data.rhythm?.thisWeekCount ?? 0,
    regionCode: data.region?.regionCode,
    birthYear: data.birthYear,
    rankingNickname: data.rankingNickname,
    totalOutings: data.stats?.totalCompletedMissions ?? 0,
    points: data.asset?.currentPoint ?? 0,
  };
}

export function toMission(
  data: CurrentMissionResponseActiveMissionInfo | MissionRecommendResponse,
): Mission {
  if (
    !Number.isSafeInteger(data.missionId) ||
    !data.place?.name ||
    data.place.latitude == null ||
    data.place.longitude == null ||
    !["READY", "IN_PROGRESS", "ARRIVED"].includes(data.status ?? "")
  )
    throw new Error("미션 응답을 확인할 수 없어요.");
  return {
    id: String(data.missionId),
    status: data.status as Mission["status"],
    startedAt: "startedAt" in data ? data.startedAt : undefined,
    title: data.missionTitle ?? `${data.place.name} 산책`,
    summary: "가까운 목적지까지 가볍게 걸어보세요.",
    reason:
      "reason" in data
        ? (data.reason ?? "")
        : "현재 위치를 기준으로 추천한 장소예요.",
    scheduledAt:
      "scheduledAt" in data ? (data.scheduledAt ?? undefined) : undefined,
    placeUrl: data.place.placeUrl,
    routeDistanceM:
      "routeDistanceMeters" in data ? data.routeDistanceMeters : undefined,
    oneWayMin: "oneWayMinutes" in data ? data.oneWayMinutes : undefined,
    estCost: "estCost" in data ? data.estCost : undefined,
    destination: data.place.name,
    address: data.place.roadAddress ?? "주소 정보 없음",
    distanceM: "distanceMeters" in data ? data.distanceMeters : undefined,
    durationMin: "totalMinutes" in data ? data.totalMinutes : undefined,
    reward: data.estRewardPoint ?? 0,
    tags: data.place.category ? [data.place.category] : [],
    latitude: data.place.latitude,
    longitude: data.place.longitude,
  };
}
