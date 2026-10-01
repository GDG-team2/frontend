// Generated from api.json by bun run api:types. Do not edit.
export type MissionScheduleRequest = {
  departAt: string;
};
export type ScheduledMissionInfo = {
  missionId?: number;
  missionTitle?: string;
  scheduledAt?: string;
  minutesUntilDeparture?: number;
  isOverdue?: boolean;
  placeName?: string;
  placeCategory?: "WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD";
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  oneWayMinutes?: number;
  totalMinutes?: number;
  estCost?: number;
};
export type MissionStartResponse = {
  missionId?: number;
  status?: string;
  startedAt?: string;
  message?: string;
};
export type MissionCompleteRequest = {
  afterSurveyScore: number;
  stepCount?: number;
};
export type MissionCompleteResponse = {
  missionId?: number;
  status?: string;
  completedAt?: string;
  stepCount?: number;
  isNewPlace?: boolean;
  durationMinutes?: number;
  reward?: MissionCompleteResponseRewardInfo;
  ranking?: MissionCompleteResponseRankingInfo;
  rhythm?: MissionCompleteResponseRhythmInfo;
  newBadges?: (MissionCompleteResponseBadgeInfo)[];
};
export type MissionCompleteResponseBadgeInfo = {
  badgeId?: number;
  badgeName?: string;
  description?: string;
  iconUrl?: string;
};
export type MissionCompleteResponseRankingInfo = {
  isParticipant?: boolean;
  earnedScore?: number;
  bonusScore?: number;
  currentWeeklyScore?: number;
  scoredMissionCount?: number;
  maxScoredMissions?: number;
};
export type MissionCompleteResponseRewardInfo = {
  earnedPoint?: number;
  currentTotalPoint?: number;
};
export type MissionCompleteResponseRhythmInfo = {
  weeklyGoal?: number;
  thisWeekCount?: number;
  goalJustAchieved?: boolean;
  currentWeeks?: number;
};
export type MissionArriveRequest = {
  latitude: number;
  longitude: number;
};
export type MissionArriveResponse = {
  missionId?: number;
  status?: string;
  arrivedAt?: string;
  remainingDwellSeconds?: number;
  message?: string;
};
export type MissionAbortRequest = {
  reason?: "FARTHER_THAN_EXPECTED" | "TIRED" | "SOMETHING_CAME_UP" | "ROUTE_INCONVENIENT";
  movedDistanceMeters?: number;
};
export type MissionAbortResponse = {
  missionId?: number;
  status?: string;
  abortedAt?: string;
  movedDistanceMeters?: number;
  nextRecommendationNote?: string;
  message?: string;
};
export type MissionRecommendRequest = {
  latitude: number;
  longitude: number;
  mood?: "TIRED" | "BORED" | "GLOOMY" | "ENERGETIC";
  category?: "WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD";
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  budget?: "FREE" | "UNDER_10K" | "UNDER_30K" | "ANY";
  rejectReason?: "TOO_FAR" | "DISLIKE_ACTIVITY" | "ALREADY_VISITED" | "NO_SPENDING";
};
export type MissionRecommendResponse = {
  missionId?: number;
  status?: string;
  missionTitle?: string;
  reason?: string;
  place?: MissionRecommendResponsePlaceInfo;
  distanceMeters?: number;
  routeDistanceMeters?: number;
  oneWayMinutes?: number;
  totalMinutes?: number;
  estCost?: number;
  isNewPlace?: boolean;
  estRewardPoint?: number;
  placeCategory?: "WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD";
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  budget?: "FREE" | "UNDER_10K" | "UNDER_30K" | "ANY";
};
export type MissionRecommendResponsePlaceInfo = {
  placeId?: number;
  kakaoPlaceId?: string;
  name?: string;
  category?: string;
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
  placeUrl?: string;
};
export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
  birthYear?: number;
  regionCode: string;
  agreements: SignupRequestAgreements;
};
export type SignupRequestAgreements = {
  service?: boolean;
  privacy?: boolean;
  location?: boolean;
  marketing?: boolean;
};
export type SignupResponse = {
  userUuid?: string;
  nickname?: string;
  message?: string;
};
export type ReissueRequest = {
  refreshToken: string;
};
export type ReissueResponse = {
  accessToken?: string;
  refreshToken?: string;
};
export type LoginRequest = {
  email: string;
  password: string;
};
export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  userUuid?: string;
  nickname?: string;
};
export type UserSettingsUpdateRequest = {
  allAlarm?: boolean;
  startAlarm?: boolean;
  missionAlarm?: boolean;
  insightAlarm?: boolean;
  rewardAlarm?: boolean;
  quietEnabled?: boolean;
  quietStart?: string;
  quietEnd?: string;
  rankingSetting?: boolean;
  nameSetting?: boolean;
  placeSetting?: boolean;
  friendSetting?: boolean;
};
export type UserSettingsUpdateResponse = {
  userUuid?: string;
  allAlarm?: boolean;
  startAlarm?: boolean;
  missionAlarm?: boolean;
  insightAlarm?: boolean;
  rewardAlarm?: boolean;
  quietEnabled?: boolean;
  quietStart?: string;
  quietEnd?: string;
  rankingSetting?: boolean;
  nameSetting?: boolean;
  placeSetting?: boolean;
  friendSetting?: boolean;
  updatedAt?: string;
  message?: string;
};
export type UserProfileUpdateRequest = {
  nickname?: string;
  regionCode?: string;
  birthYear?: number;
  rankingNickname?: string;
};
export type UserProfileResponse = {
  userUuid?: string;
  email?: string;
  nickname?: string;
  rankingNickname?: string;
  birthYear?: number;
  profileImageUrl?: string;
  region?: UserProfileResponseRegionInfo;
  asset?: UserProfileResponseAssetInfo;
  rhythm?: UserProfileResponseRhythmInfo;
  representativeBadge?: UserProfileResponseBadgeInfo;
  stats?: UserProfileResponseStatsInfo;
};
export type UserProfileResponseAssetInfo = {
  currentPoint?: number;
};
export type UserProfileResponseBadgeInfo = {
  badgeId?: number;
  badgeName?: string;
  iconUrl?: string;
};
export type UserProfileResponseRegionInfo = {
  regionCode?: string;
  regionName?: string;
};
export type UserProfileResponseRhythmInfo = {
  weeklyGoal?: number;
  thisWeekCount?: number;
  goalAchievedThisWeek?: boolean;
  currentWeeks?: number;
  bestWeeks?: number;
};
export type UserProfileResponseStatsInfo = {
  totalCompletedMissions?: number;
};
export type PreferenceUpdateRequest = {
  walkTime?: number;
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  categories?: ("WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD")[];
  weeklyGoal?: number;
  budget?: "FREE" | "UNDER_10K" | "UNDER_30K" | "ANY";
};
export type PreferenceResponse = {
  walkTime?: number;
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  categories?: ("WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD")[];
  weeklyGoal?: number;
  budget?: "FREE" | "UNDER_10K" | "UNDER_30K" | "ANY";
};
export type PointHistoryResponse = {
  currentPoint?: number;
  history?: (PointHistoryResponsePointHistoryEntry)[];
  pagination?: PointHistoryResponsePaginationInfo;
};
export type PointHistoryResponsePaginationInfo = {
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  hasNext?: boolean;
};
export type PointHistoryResponsePointHistoryEntry = {
  historyId?: number;
  type?: string;
  amount?: number;
  description?: string;
  createdAt?: string;
};
export type BadgeListResponse = {
  summary?: BadgeListResponseBadgeSummary;
  badges?: (BadgeListResponseBadgeDetail)[];
};
export type BadgeListResponseBadgeDetail = {
  badgeId?: number;
  badgeName?: string;
  description?: string;
  iconUrl?: string;
  isAcquired?: boolean;
  isRepresentative?: boolean;
  acquiredAt?: string;
  progressCurrent?: number;
  progressTarget?: number;
};
export type BadgeListResponseBadgeSummary = {
  totalCount?: number;
  acquiredCount?: number;
};
export type RegionRankingResponse = {
  region?: RegionRankingResponseRegionInfo;
  weekPeriod?: RegionRankingResponseWeekPeriodInfo;
  myRanking?: RegionRankingResponseRankingEntry;
  leaderboard?: (RegionRankingResponseRankingEntry)[];
};
export type RegionRankingResponseRankingEntry = {
  isParticipating?: boolean;
  userUuid?: string;
  nickname?: string;
  profileImageUrl?: string;
  rank?: number;
  score?: number;
  scoredMissionCount?: number;
  bonusScore?: number;
};
export type RegionRankingResponseRegionInfo = {
  regionCode?: string;
  regionName?: string;
};
export type RegionRankingResponseWeekPeriodInfo = {
  startDate?: string;
  endDate?: string;
};
export type MissionDetailResponse = {
  missionId?: number;
  status?: string;
  missionTitle?: string;
  reason?: string;
  place?: MissionRecommendResponsePlaceInfo;
  placeCategory?: "WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD";
  moveType?: "WALK" | "PUBLIC_TRANSIT" | "BIKE";
  isNewPlace?: boolean;
  routeDistanceMeters?: number;
  durationMinutes?: number;
  estCost?: number;
  stepCount?: number;
  mood?: MissionDetailResponseMoodChange;
  timeline?: (MissionDetailResponseTimelineEvent)[];
  abort?: MissionDetailResponseAbortInfo;
};
export type MissionDetailResponseAbortInfo = {
  reason?: "FARTHER_THAN_EXPECTED" | "TIRED" | "SOMETHING_CAME_UP" | "ROUTE_INCONVENIENT";
  movedDistanceMeters?: number;
};
export type MissionDetailResponseMoodChange = {
  beforeMood?: "TIRED" | "BORED" | "GLOOMY" | "ENERGETIC";
  beforeScore?: number;
  afterScore?: number;
  change?: number;
};
export type MissionDetailResponseTimelineEvent = {
  type?: string;
  at?: string;
  note?: string;
};
export type ScheduledMissionsResponse = {
  missions?: (ScheduledMissionInfo)[];
};
export type MissionMapResponse = {
  period?: PeriodInfo;
  stats?: MissionMapResponseStats;
  places?: (MissionMapResponseVisitedPlace)[];
  recent?: (MissionRecordItem)[];
};
export type MissionMapResponseStats = {
  outingCount?: number;
  newPlaceCount?: number;
  totalRouteDistanceMeters?: number;
};
export type MissionMapResponseVisitedPlace = {
  placeId?: number;
  name?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  visitCount?: number;
  lastVisitedAt?: string;
};
export type MissionRecordItem = {
  missionId?: number;
  missionTitle?: string;
  placeName?: string;
  placeCategory?: "WALK" | "CAFE" | "SIGHTSEEING" | "EXHIBITION" | "FOOD";
  completedAt?: string;
  durationMinutes?: number;
  routeDistanceMeters?: number;
  satisfaction?: number;
  isNewPlace?: boolean;
  estCost?: number;
};
export type PeriodInfo = {
  type?: "WEEK" | "MONTH" | "ALL";
  startDate?: string;
  endDate?: string;
};
export type MissionHistoryResponse = {
  period?: PeriodInfo;
  summary?: MissionHistoryResponseSummary;
  records?: (MissionRecordItem)[];
  pagination?: MissionHistoryResponsePagination;
};
export type MissionHistoryResponsePagination = {
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  hasNext?: boolean;
};
export type MissionHistoryResponseSummary = {
  completedCount?: number;
  totalOutdoorMinutes?: number;
  averageSatisfaction?: number;
  totalRouteDistanceMeters?: number;
  newPlaceCount?: number;
};
export type CurrentMissionResponse = {
  hasActiveMission?: boolean;
  mission?: CurrentMissionResponseActiveMissionInfo;
};
export type CurrentMissionResponseActiveMissionInfo = {
  missionId?: number;
  status?: string;
  missionTitle?: string;
  scheduledAt?: string;
  startedAt?: string;
  place?: CurrentMissionResponsePlaceInfo;
  estRewardPoint?: number;
};
export type CurrentMissionResponsePlaceInfo = {
  placeId?: number;
  kakaoPlaceId?: string;
  name?: string;
  category?: string;
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
  placeUrl?: string;
};
export type ErrorResponse = {
  status?: number;
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};
