import type {
  Benefit,
  Mission,
  NotificationItem,
  OutingRecord,
  RankingEntry,
  UserProfile,
} from "@/types/domain";

export const mockUser: UserProfile = {
  id: "user-01",
  nickname: "은후",
  district: "서울 마포구",
  streak: 4,
  totalOutings: 28,
  weeklyGoal: 4,
  weeklyDone: 3,
  points: 1240,
  rankingOptIn: false,
};

export const mockMission: Mission = {
  id: "mission-01",
  title: "망원 골목에서 초록색 찾기",
  summary: "집에서 12분 거리의 조용한 골목을 걸으며 초록색 물건을 세 개 찾아보세요.",
  reason: "오늘은 에너지가 낮아서, 결정할 것 없이 가볍게 걷고 돌아올 수 있는 미션으로 골랐어요.",
  destination: "망원동 작은 정원",
  address: "서울 마포구 포은로 6길",
  distanceM: 780,
  durationMin: 18,
  reward: 120,
  tags: ["조용한", "가까운", "혼자"],
  latitude: 37.5564,
  longitude: 126.9032,
};

export const mockSponsoredMission: Mission = {
  ...mockMission,
  id: "mission-sponsored",
  title: "동네 책방의 오늘 문장 찾기",
  destination: "당인리 책발전소",
  reward: 280,
  sponsored: true,
  tags: ["제휴", "실내", "책방"],
};

export const mockRecords: OutingRecord[] = [
  {
    id: "record-01",
    title: "강변에서 둥근 돌 찾기",
    place: "망원한강공원",
    date: "2026-08-23T10:30:00+09:00",
    distanceKm: 1.8,
    durationMin: 31,
    rating: 5,
    moodBefore: "답답함",
    moodAfter: "가벼움",
  },
  {
    id: "record-02",
    title: "처음 보는 골목 한 칸 걷기",
    place: "연남동 산책길",
    date: "2026-08-20T18:20:00+09:00",
    distanceKm: 1.2,
    durationMin: 24,
    rating: 4,
    moodBefore: "지침",
    moodAfter: "가벼움",
  },
  {
    id: "record-03",
    title: "노란 간판 사진 찍기",
    place: "망리단길",
    date: "2026-08-17T15:00:00+09:00",
    distanceKm: 0.9,
    durationMin: 17,
    rating: 4,
    moodBefore: "심심함",
    moodAfter: "가벼움",
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "notice-01",
    title: "오늘의 외출 한 칸이 준비됐어요",
    body: "비 오기 전, 18분이면 다녀올 수 있어요.",
    date: "방금",
    unread: true,
    type: "mission",
  },
  {
    id: "notice-02",
    title: "주간 목표까지 한 번 남았어요",
    body: "이번 주 3번 외출했어요. 무리 없이 한 칸만 더 가볼까요?",
    date: "어제",
    unread: true,
    type: "reward",
  },
  {
    id: "notice-03",
    title: "위치 정보 보관 정책이 바뀌었어요",
    body: "경로 원본은 기기에서만 보관하도록 설정할 수 있어요.",
    date: "8월 18일",
    unread: false,
    type: "system",
  },
];

export const mockBenefits: Benefit[] = [
  { id: "benefit-01", brand: "동네책방", title: "따뜻한 차 1잔", expiresAt: "2026-09-30", points: 800 },
  { id: "benefit-02", brand: "마을상점", title: "산책 키트 10% 할인", expiresAt: "2026-10-15", points: 500 },
];

export const mockRanking: RankingEntry[] = [
  { rank: 1, nickname: "산책하는고래", outings: 8 },
  { rank: 2, nickname: "마포초록", outings: 7 },
  { rank: 3, nickname: "느린발걸음", outings: 6 },
  { rank: 12, nickname: "은후", outings: 3, isMe: true },
];
