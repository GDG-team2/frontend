// Generated from api.json by bun run api:types. Do not edit.
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
export type BadgeInfo = {
  badgeId?: number;
  badgeName?: string;
  description?: string;
  iconUrl?: string;
};
export type MissionCompleteResponse = {
  missionId?: number;
  status?: string;
  completedAt?: string;
  stepCount?: number;
  reward?: RewardInfo;
  ranking?: RankingInfo;
  streak?: StreakInfo;
  newBadges?: BadgeInfo[];
};
export type RankingInfo = {
  isParticipant?: boolean;
  earnedScore?: number;
  currentWeeklyScore?: number;
};
export type RewardInfo = {
  earnedPoint?: number;
  currentTotalPoint?: number;
};
export type StreakInfo = {
  streakNow?: number;
  isStreakMaintained?: boolean;
};
export type MissionArriveRequest = {
  latitude: number;
  longitude: number;
};
export type MissionArriveResponse = {
  missionId?: number;
  status?: string;
  arrivedAt?: string;
  message?: string;
};
export type MissionAbortResponse = {
  missionId?: number;
  status?: string;
  abortedAt?: string;
  message?: string;
};
export type MissionRecommendRequest = {
  latitude: number;
  longitude: number;
};
export type MissionRecommendResponse = {
  missionId?: number;
  status?: string;
  place?: PlaceInfo;
  distanceMeters?: number;
  estDurationMinutes?: number;
  estRewardPoint?: number;
};
export type PlaceInfo = {
  placeId?: number;
  kakaoPlaceId?: string;
  name?: string;
  category?: string;
  roadAddress?: string;
  latitude?: number;
  longitude?: number;
};
export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
  birth: string;
  regionCode: string;
};
export type SignupResponse = {
  userUuid?: string;
  nickname?: string;
  message?: string;
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
export type LocalTime = {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
};
export type UserSettingsUpdateRequest = {
  allAlarm?: boolean;
  startAlarm?: boolean;
  missionAlarm?: boolean;
  insightAlarm?: boolean;
  rewardAlarm?: boolean;
  quietStart?: LocalTime;
  quietEnd?: LocalTime;
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
  quietStart?: LocalTime;
  quietEnd?: LocalTime;
  rankingSetting?: boolean;
  nameSetting?: boolean;
  placeSetting?: boolean;
  friendSetting?: boolean;
  updatedAt?: string;
  message?: string;
};
export type AssetInfo = {
  currentPoint?: number;
};
export type RegionInfo = {
  regionCode?: string;
  regionName?: string;
};
export type StatsInfo = {
  totalCompletedMissions?: number;
};
export type UserProfileResponse = {
  userUuid?: string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  region?: RegionInfo;
  asset?: AssetInfo;
  streak?: StreakInfo;
  representativeBadge?: BadgeInfo;
  stats?: StatsInfo;
};
export type PaginationInfo = {
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  hasNext?: boolean;
};
export type PointHistoryEntry = {
  historyId?: number;
  type?: string;
  amount?: number;
  description?: string;
  createdAt?: string;
};
export type PointHistoryResponse = {
  currentPoint?: number;
  history?: PointHistoryEntry[];
  pagination?: PaginationInfo;
};
export type BadgeDetail = {
  badgeId?: number;
  badgeName?: string;
  description?: string;
  iconUrl?: string;
  isAcquired?: boolean;
  isRepresentative?: boolean;
  acquiredAt?: string;
};
export type BadgeListResponse = {
  summary?: BadgeSummary;
  badges?: BadgeDetail[];
};
export type BadgeSummary = {
  totalCount?: number;
  acquiredCount?: number;
};
export type RankingEntry = {
  isParticipating?: boolean;
  userUuid?: string;
  nickname?: string;
  profileImageUrl?: string;
  rank?: number;
  score?: number;
};
export type RegionRankingResponse = {
  region?: RegionInfo;
  weekPeriod?: WeekPeriodInfo;
  myRanking?: RankingEntry;
  leaderboard?: RankingEntry[];
};
export type WeekPeriodInfo = {
  startDate?: string;
  endDate?: string;
};
export type ActiveMissionInfo = {
  missionId?: number;
  status?: string;
  startedAt?: string;
  place?: PlaceInfo;
  estRewardPoint?: number;
};
export type CurrentMissionResponse = {
  hasActiveMission?: boolean;
  mission?: ActiveMissionInfo;
};
