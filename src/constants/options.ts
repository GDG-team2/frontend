export const categories = {
  WALK: "산책",
  CAFE: "카페",
  SIGHTSEEING: "구경",
  EXHIBITION: "전시",
  FOOD: "먹기",
} as const;
export const moveTypes = {
  WALK: "도보",
  PUBLIC_TRANSIT: "대중교통",
  BIKE: "자전거",
} as const;
export const budgets = {
  FREE: "0원",
  UNDER_10K: "1만원 이내",
  UNDER_30K: "3만원 이내",
  ANY: "상관없음",
} as const;
export const moods = {
  TIRED: "지침",
  BORED: "심심함",
  GLOOMY: "꿀꿀함",
  ENERGETIC: "활기참",
} as const;
export const rejectReasons = {
  TOO_FAR: "너무 멀어요",
  DISLIKE_ACTIVITY: "이 활동은 싫어요",
  ALREADY_VISITED: "이미 가본 곳이에요",
  NO_SPENDING: "지금은 돈 쓰기 싫어요",
} as const;
export const abortReasons = {
  FARTHER_THAN_EXPECTED: "생각보다 멀었어요",
  TIRED: "피곤해졌어요",
  SOMETHING_CAME_UP: "갑자기 일이 생겼어요",
  ROUTE_INCONVENIENT: "길이 불편했어요",
} as const;
