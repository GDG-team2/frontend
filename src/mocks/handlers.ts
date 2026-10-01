import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/api";
import { toKoreaTime, parseKoreaTime } from "@/services/time";
import examples from "./api-examples.json";
import type * as DTO from "@/types/api";

type MockMission = DTO.MissionRecommendResponse & {
  scheduledAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  abortedAt?: string;
  dwellAt?: number;
  rating?: number;
  stepCount?: number;
  beforeMood?: DTO.MissionRecommendRequest["mood"];
  abort?: DTO.MissionAbortRequest;
};
let missions = new Map<number, MockMission>();
let nextId = 1001;
let points = 1500;
let settings: DTO.UserSettingsUpdateRequest;
let preferences: DTO.PreferenceResponse;
let profile: DTO.UserProfileResponse;
let pointHistory: DTO.PointHistoryResponsePointHistoryEntry[] = [];
let offset = 0;
const now = () => Date.now() + offset;
const timestamp = () => toKoreaTime(now());
// Deterministic elapsed-time testing; never imported by production app code.
export function advanceMockTime(ms: number) {
  offset += ms;
}
export function resetMockState() {
  missions = new Map();
  nextId = 1001;
  points = 1500;
  pointHistory = [];
  offset = 0;
  settings = {
    allAlarm: true,
    startAlarm: true,
    missionAlarm: true,
    insightAlarm: true,
    rewardAlarm: true,
    quietEnabled: false,
    quietStart: "22:00:00",
    quietEnd: "07:00:00",
    rankingSetting: false,
    nameSetting: false,
    placeSetting: false,
    friendSetting: false,
  };
  preferences = {
    walkTime: 60,
    moveType: "WALK",
    categories: [],
    budget: "ANY",
    weeklyGoal: 3,
  };
  profile = {
    ...examples.UserProfileResponse,
    nickname: "선우",
    rankingNickname: "",
    birthYear: 2000,
  };
}
resetMockState();
function failure(
  message: string,
  status = 409,
  code = "INVALID_MISSION_STATUS",
  details?: Record<string, unknown>,
) {
  return HttpResponse.json(
    { status, code, message, ...(details ? { details } : {}) },
    { status },
  );
}
async function simulate(request: Request) {
  const scenario = request.headers.get("x-ohakkom-scenario");
  if (scenario === "slow") await delay(1200);
  if (scenario === "error")
    return failure(
      "잠시 연결이 고르지 않아요. 다시 시도해 주세요.",
      503,
      "PLACE_SEARCH_FAILED",
    );
  if (
    !new URL(request.url).pathname.includes("/auth/") &&
    request.headers.get("Authorization") !== "Bearer qa-access-token"
  )
    return failure("로그인이 필요해요.", 401, "UNAUTHORIZED");
  return null;
}
const isEmpty = (request: Request) =>
  request.headers.get("x-ohakkom-scenario") === "empty";
const completed = () =>
  [...missions.values()].filter((m) => m.status === "COMPLETED");
const profileResponse = () => ({
  ...profile,
  asset: { currentPoint: points },
  stats: { totalCompletedMissions: 42 + completed().length },
  rhythm: {
    weeklyGoal: preferences.weeklyGoal,
    thisWeekCount: completed().length,
    goalAchievedThisWeek: completed().length >= preferences.weeklyGoal!,
    currentWeeks: completed().length >= preferences.weeklyGoal! ? 1 : 0,
    bestWeeks: 1,
  },
});
const settingsResponse = () => ({
  ...settings,
  userUuid: profile.userUuid,
  updatedAt: timestamp(),
  message: null,
});
function current() {
  const active = [...missions.values()].filter((m) =>
    ["READY", "IN_PROGRESS", "ARRIVED"].includes(m.status!),
  );
  return (
    active.find((m) => m.status !== "READY") ??
    active.find((m) => !m.scheduledAt) ??
    active.sort(
      (a, b) => parseKoreaTime(a.scheduledAt!) - parseKoreaTime(b.scheduledAt!),
    )[0]
  );
}
function scheduled(m: MockMission): DTO.ScheduledMissionInfo {
  return {
    missionId: m.missionId,
    missionTitle: m.missionTitle,
    scheduledAt: m.scheduledAt,
    minutesUntilDeparture: Math.max(
      0,
      Math.ceil((parseKoreaTime(m.scheduledAt!) - now()) / 60000),
    ),
    isOverdue: parseKoreaTime(m.scheduledAt!) < now(),
    placeName: m.place?.name,
    placeCategory: m.placeCategory,
    moveType: m.moveType,
    oneWayMinutes: m.oneWayMinutes,
    totalMinutes: m.totalMinutes,
    estCost: m.estCost,
  };
}
function record(m: MockMission): DTO.MissionRecordItem {
  return {
    missionId: m.missionId,
    missionTitle: m.missionTitle,
    placeName: m.place?.name,
    placeCategory: m.placeCategory,
    completedAt: m.completedAt,
    durationMinutes: Math.max(
      1,
      Math.floor(
        (parseKoreaTime(m.completedAt!) - parseKoreaTime(m.startedAt!)) / 60000,
      ),
    ),
    routeDistanceMeters: m.routeDistanceMeters,
    satisfaction: m.rating,
    isNewPlace: m.isNewPlace,
    estCost: m.estCost,
  };
}
function pagination(page: number, size: number, count: number) {
  return {
    currentPage: page,
    pageSize: size,
    totalPages: Math.ceil(count / size),
    totalElements: count,
    hasNext: count > (page + 1) * size,
  };
}
function filtered(request: Request) {
  const url = new URL(request.url);
  let records = isEmpty(request) ? [] : completed().map(record).reverse();
  const category = url.searchParams.get("category");
  if (category) records = records.filter((m) => m.placeCategory === category);
  if (url.searchParams.get("freeOnly") === "true")
    records = records.filter((m) => m.estCost === 0);
  const yearMonth = url.searchParams.get("yearMonth");
  const period = url.searchParams.get("period") ?? "MONTH";
  if (period === "MONTH")
    records = records.filter((m) =>
      m.completedAt?.startsWith(yearMonth ?? timestamp().slice(0, 7)),
    );
  if (period === "WEEK") {
    const date = new Date(now() + 9 * 3600000);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    records = records.filter(
      (m) => parseKoreaTime(m.completedAt!) >= date.getTime() - 9 * 3600000,
    );
  }
  return {
    url,
    records,
    period: {
      type: period,
      startDate:
        period === "ALL"
          ? null
          : (records.at(-1)?.completedAt?.slice(0, 10) ??
            timestamp().slice(0, 10)),
      endDate: period === "ALL" ? null : timestamp().slice(0, 10),
    },
  };
}
export const handlers = [
  http.post(`${API_BASE_URL}/auth/signup`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const body = (await request.json()) as DTO.SignupRequest;
    if (!body.email || !body.password || !body.nickname || !body.regionCode)
      return failure("회원가입 정보를 확인해 주세요.", 400, "INVALID_INPUT");
    if (
      !body.agreements?.service ||
      !body.agreements?.privacy ||
      !body.agreements?.location
    )
      return failure("필수 약관에 동의해 주세요.", 400, "TERMS_NOT_AGREED");
    return HttpResponse.json(
      { ...examples.SignupResponse, nickname: body.nickname },
      { status: 201 },
    );
  }),
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const body = (await request.json()) as DTO.LoginRequest;
    if (!body.email || !body.password)
      return failure("이메일과 비밀번호를 입력해 주세요.", 401, "LOGIN_FAILED");
    return HttpResponse.json({
      ...examples.LoginResponse,
      accessToken: "qa-access-token",
      refreshToken: "qa-refresh-token",
    });
  }),
  http.post(`${API_BASE_URL}/auth/reissue`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const body = (await request.json()) as DTO.ReissueRequest;
    if (body.refreshToken !== "qa-refresh-token")
      return failure("다시 로그인해 주세요.", 401, "INVALID_REFRESH_TOKEN");
    return HttpResponse.json({
      accessToken: "qa-access-token",
      refreshToken: "qa-refresh-token",
    });
  }),
  http.get(
    `${API_BASE_URL}/users/profile`,
    async ({ request }) =>
      (await simulate(request)) ?? HttpResponse.json(profileResponse()),
  ),
  http.patch(`${API_BASE_URL}/users/profile`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const { regionCode, ...patch } =
      (await request.json()) as DTO.UserProfileUpdateRequest;
    profile = {
      ...profile,
      ...patch,
      ...(regionCode
        ? { region: { regionCode, regionName: "지역 정보 없음" } }
        : {}),
    };
    return HttpResponse.json(profileResponse());
  }),
  http.get(
    `${API_BASE_URL}/users/settings`,
    async ({ request }) =>
      (await simulate(request)) ?? HttpResponse.json(settingsResponse()),
  ),
  http.patch(`${API_BASE_URL}/users/settings`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    settings = {
      ...settings,
      ...((await request.json()) as DTO.UserSettingsUpdateRequest),
    };
    for (const key of ["quietStart", "quietEnd"] as const)
      if (settings[key]?.length === 5) settings[key] += ":00";
    return HttpResponse.json(settingsResponse());
  }),
  http.get(
    `${API_BASE_URL}/users/preferences`,
    async ({ request }) =>
      (await simulate(request)) ?? HttpResponse.json(preferences),
  ),
  http.patch(`${API_BASE_URL}/users/preferences`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    preferences = {
      ...preferences,
      ...((await request.json()) as DTO.PreferenceUpdateRequest),
    };
    return HttpResponse.json(preferences);
  }),
  http.get(`${API_BASE_URL}/missions/current`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const m = current();
    return HttpResponse.json({
      hasActiveMission: Boolean(m),
      mission: m
        ? {
            missionId: m.missionId,
            status: m.status,
            missionTitle: m.missionTitle,
            scheduledAt: m.scheduledAt ?? null,
            startedAt: m.startedAt ?? null,
            place: m.place,
            estRewardPoint: m.estRewardPoint,
          }
        : null,
    });
  }),
  http.get(
    `${API_BASE_URL}/missions/scheduled`,
    async ({ request }) =>
      (await simulate(request)) ??
      HttpResponse.json({
        missions: [...missions.values()]
          .filter((m) => m.status === "READY" && m.scheduledAt)
          .map(scheduled)
          .sort(
            (a, b) =>
              parseKoreaTime(a.scheduledAt!) - parseKoreaTime(b.scheduledAt!),
          ),
      }),
  ),
  http.put(
    `${API_BASE_URL}/missions/:id/schedule`,
    async ({ request, params }) => {
      const error = await simulate(request);
      if (error) return error;
      const m = missions.get(Number(params.id));
      if (!m)
        return failure("미션을 찾을 수 없어요.", 404, "MISSION_NOT_FOUND");
      if (m.status !== "READY")
        return failure("출발 전 미션만 약속할 수 있어요.");
      const { departAt } = (await request.json()) as DTO.MissionScheduleRequest;
      if (
        parseKoreaTime(departAt) <= now() ||
        parseKoreaTime(departAt) > now() + 14 * 86400000
      )
        return failure("출발 시각을 확인해 주세요.", 400, "INVALID_INPUT");
      m.scheduledAt = departAt;
      return HttpResponse.json(scheduled(m));
    },
  ),
  http.post(`${API_BASE_URL}/missions/recommendation`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const body = (await request.json()) as DTO.MissionRecommendRequest;
    if (!Number.isFinite(body.latitude) || !Number.isFinite(body.longitude))
      return failure("위치가 필요해요.", 400, "INVALID_INPUT");
    if (
      [...missions.values()].some((m) =>
        ["IN_PROGRESS", "ARRIVED"].includes(m.status!),
      )
    )
      return failure(
        "진행 중인 미션을 먼저 확인해 주세요.",
        409,
        "ACTIVE_MISSION_EXISTS",
      );
    if (isEmpty(request))
      return failure(
        "주변에 추천할 장소가 없어요. 조건을 바꿔보세요.",
        404,
        "NO_NEARBY_PLACE",
      );
    for (const m of missions.values())
      if (m.status === "READY" && !m.scheduledAt) m.status = "ABORTED";
    const m: MockMission = {
      ...(examples.MissionRecommendResponse as DTO.MissionRecommendResponse),
      missionId: nextId++,
      status: "READY",
      place: examples.CurrentMissionResponsePlaceInfo,
      missionTitle: "역삼동 근린공원 한 바퀴",
      placeCategory: body.category ?? preferences.categories?.[0] ?? "WALK",
      moveType: body.moveType ?? preferences.moveType,
      budget: body.budget ?? preferences.budget,
      beforeMood: body.mood,
    };
    missions.set(m.missionId!, m);
    const { beforeMood: _, ...response } = m;
    return HttpResponse.json(response);
  }),
  ...(["start", "arrive", "complete", "abort"] as const).map((action) =>
    http.post(
      `${API_BASE_URL}/missions/:id/${action}`,
      async ({ request, params }) => {
        const error = await simulate(request);
        if (error) return error;
        const m = missions.get(Number(params.id));
        if (!m)
          return failure("미션을 찾지 못했어요.", 404, "MISSION_NOT_FOUND");
        const missionId = m.missionId;
        const at = timestamp();
        if (action === "start") {
          if (
            m.status !== "READY" ||
            [...missions.values()].some((v) =>
              ["IN_PROGRESS", "ARRIVED"].includes(v.status!),
            )
          )
            return failure(
              "미션 상태를 확인해 주세요.",
              409,
              "INVALID_MISSION_STATUS",
              { currentStatus: m.status },
            );
          m.status = "IN_PROGRESS";
          m.startedAt = at;
          return HttpResponse.json({
            missionId,
            status: m.status,
            startedAt: at,
            message: "출발했어요.",
          });
        }
        if (action === "arrive") {
          if (m.status !== "IN_PROGRESS")
            return failure("진행 중인 미션이 아니에요.");
          const body = (await request.json()) as DTO.MissionArriveRequest;
          const distance = Math.hypot(
            (body.latitude - m.place!.latitude!) * 111000,
            (body.longitude - m.place!.longitude!) * 88000,
          );
          if (!Number.isFinite(distance) || distance > 80) {
            m.dwellAt = undefined;
            return failure(
              "목적지 80m 이내에서 다시 시도해 주세요.",
              400,
              "NOT_ENOUGH_DISTANCE",
              { currentDistanceMeters: Math.round(distance) },
            );
          }
          m.dwellAt ??= now();
          const remaining = Math.max(
            0,
            Math.ceil(30 - (now() - m.dwellAt) / 1000),
          );
          if (remaining === 0) {
            m.status = "ARRIVED";
            m.arrivedAt = at;
          }
          return HttpResponse.json({
            missionId,
            status: m.status,
            arrivedAt: m.arrivedAt ?? null,
            remainingDwellSeconds: remaining,
            message: remaining
              ? "목적지 근처예요. 잠시 머물러 주세요."
              : "도착했어요.",
          });
        }
        if (action === "abort") {
          if (!["READY", "IN_PROGRESS", "ARRIVED"].includes(m.status!))
            return failure("이미 종료한 미션이에요.");
          m.abort = request.headers.get("Content-Type")
            ? ((await request.json()) as DTO.MissionAbortRequest)
            : {};
          m.status = "ABORTED";
          m.abortedAt = at;
          return HttpResponse.json({
            missionId,
            status: m.status,
            abortedAt: at,
            movedDistanceMeters: m.abort.movedDistanceMeters ?? null,
            nextRecommendationNote: ["TIRED", "FARTHER_THAN_EXPECTED"].includes(
              m.abort.reason!,
            )
              ? "오늘은 더 가까운 곳부터 제안할게요."
              : null,
            message: "멈춰도 기록은 남아요.",
          });
        }
        if (m.status !== "ARRIVED") return failure("도착 확인이 필요해요.");
        const body = (await request.json()) as DTO.MissionCompleteRequest;
        if (
          !Number.isInteger(body.afterSurveyScore) ||
          body.afterSurveyScore < 1 ||
          body.afterSurveyScore > 5
        )
          return failure("설문 점수는 1~5점이에요.", 400, "INVALID_INPUT");
        points += 50;
        m.status = "COMPLETED";
        m.completedAt = at;
        m.rating = body.afterSurveyScore;
        m.stepCount = body.stepCount;
        pointHistory.unshift({
          historyId: pointHistory.length + 1,
          type: "EARN",
          amount: 50,
          description: "미션 완주 보상",
          createdAt: at,
        });
        return HttpResponse.json({
          ...examples.MissionCompleteResponse,
          missionId,
          completedAt: at,
          stepCount: body.stepCount ?? null,
          durationMinutes: record(m).durationMinutes,
          reward: { earnedPoint: 50, currentTotalPoint: points },
          rhythm: {
            weeklyGoal: preferences.weeklyGoal,
            thisWeekCount: completed().length,
            goalJustAchieved: completed().length === preferences.weeklyGoal,
            currentWeeks: completed().length >= preferences.weeklyGoal! ? 1 : 0,
          },
          ranking: {
            ...examples.MissionCompleteResponseRankingInfo,
            isParticipant: settings.rankingSetting,
            earnedScore: completed().length <= 3 ? 100 : 0,
            currentWeeklyScore: Math.min(3, completed().length) * 100,
            scoredMissionCount: Math.min(3, completed().length),
          },
        });
      },
    ),
  ),
  http.get(`${API_BASE_URL}/missions/history`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const { url, records, period } = filtered(request);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    return HttpResponse.json({
      period,
      records: records.slice(page * size, (page + 1) * size),
      pagination: pagination(page, size, records.length),
      summary: {
        completedCount: records.length,
        totalOutdoorMinutes: records.reduce(
          (n, r) => n + r.durationMinutes!,
          0,
        ),
        averageSatisfaction: records.length
          ? records.reduce((n, r) => n + r.satisfaction!, 0) / records.length
          : null,
        totalRouteDistanceMeters: records.reduce(
          (n, r) => n + r.routeDistanceMeters!,
          0,
        ),
        newPlaceCount: records.filter((r) => r.isNewPlace).length,
      },
    });
  }),
  http.get(`${API_BASE_URL}/missions/map`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const { records, period } = filtered(request);
    const place = examples.CurrentMissionResponsePlaceInfo;
    return HttpResponse.json({
      period,
      stats: {
        outingCount: records.length,
        newPlaceCount: records.length ? 1 : 0,
        totalRouteDistanceMeters: records.reduce(
          (n, r) => n + r.routeDistanceMeters!,
          0,
        ),
      },
      places: records.length
        ? [
            {
              placeId: place.placeId,
              name: place.name,
              category: place.category,
              latitude: place.latitude,
              longitude: place.longitude,
              visitCount: records.length,
              lastVisitedAt: records[0].completedAt,
            },
          ]
        : [],
      recent: records.slice(0, 5),
    });
  }),
  http.get(`${API_BASE_URL}/missions/:id`, async ({ request, params }) => {
    const error = await simulate(request);
    if (error) return error;
    const m = missions.get(Number(params.id));
    if (!m) return failure("기록을 찾을 수 없어요.", 404, "MISSION_NOT_FOUND");
    return HttpResponse.json({
      missionId: m.missionId,
      status: m.status,
      missionTitle: m.missionTitle,
      reason: m.reason,
      place: m.place,
      placeCategory: m.placeCategory,
      moveType: m.moveType,
      isNewPlace: m.isNewPlace,
      routeDistanceMeters: m.routeDistanceMeters,
      durationMinutes: m.completedAt ? record(m).durationMinutes : 0,
      estCost: m.estCost,
      stepCount: m.stepCount ?? null,
      mood: {
        beforeMood: m.beforeMood ?? null,
        beforeScore: m.beforeMood ? 3 : null,
        afterScore: m.rating ?? null,
        change: m.beforeMood && m.rating ? m.rating - 3 : null,
      },
      timeline: [
        ["SCHEDULED", m.scheduledAt, "출발 약속"],
        ["STARTED", m.startedAt, "출발했어요"],
        ["ARRIVED", m.arrivedAt, "목적지에서 30초 머물러 도착 인증"],
        ["COMPLETED", m.completedAt, "만족도 저장"],
        ["ABORTED", m.abortedAt, "미션 중단"],
      ]
        .filter(([, at]) => at)
        .map(([type, at, note]) => ({ type, at, note })),
      abort: m.abort ?? null,
    });
  }),
  http.get(`${API_BASE_URL}/rewards/points/history`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const entries = isEmpty(request) ? [] : pointHistory;
    return HttpResponse.json({
      currentPoint: points,
      history: entries.slice(page * size, (page + 1) * size),
      pagination: pagination(page, size, entries.length),
    });
  }),
  http.get(`${API_BASE_URL}/rewards/badges`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const badges = isEmpty(request) ? [] : examples.BadgeListResponse.badges;
    return HttpResponse.json({
      badges,
      summary: {
        totalCount: badges.length,
        acquiredCount: badges.filter((badge) => badge.isAcquired).length,
      },
    });
  }),
  http.get(`${API_BASE_URL}/rankings/my-region`, async ({ request }) => {
    const error = await simulate(request);
    if (error) return error;
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 50);
    return HttpResponse.json({
      ...examples.RegionRankingResponse,
      myRanking: {
        ...examples.RegionRankingResponseRankingEntry,
        isParticipating: settings.rankingSetting,
        nickname: profile.rankingNickname || profile.nickname,
        rank: settings.rankingSetting ? 1 : null,
      },
      leaderboard: isEmpty(request)
        ? []
        : examples.RegionRankingResponse.leaderboard.slice(0, limit),
    });
  }),
];
