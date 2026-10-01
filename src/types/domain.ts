export type Mood = "지침" | "답답함" | "심심함" | "가벼움";
export type MockScenario = "success" | "slow" | "error" | "empty";

export type UserProfile = {
  id: string;
  nickname: string;
  district: string;
  rhythmWeeks: number;
  totalOutings: number;
  weeklyGoal?: number;
  weeklyDone?: number;
  points: number;
  regionCode?: string;
  birthYear?: number;
  rankingNickname?: string;
  rankingOptIn?: boolean;
};

export type Mission = {
  id: string;
  title: string;
  summary: string;
  reason: string;
  destination: string;
  address: string;
  status?: "READY" | "IN_PROGRESS" | "ARRIVED";
  startedAt?: string;
  scheduledAt?: string;
  placeUrl?: string;
  routeDistanceM?: number;
  oneWayMin?: number;
  estCost?: number;
  distanceM?: number;
  durationMin?: number;
  reward: number;
  tags: string[];
  sponsored?: boolean;
  latitude: number;
  longitude: number;
};

export type OutingRecord = {
  id: string;
  title: string;
  place: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  rating: number;
  moodBefore: Mood;
  moodAfter: Mood;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  type: "mission" | "reward" | "system";
};

export type Benefit = {
  id: string;
  brand: string;
  title: string;
  expiresAt: string;
  points: number;
};

export type RankingEntry = {
  rank: number;
  nickname: string;
  outings: number;
  isMe?: boolean;
};
