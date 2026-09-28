import { delay, http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/constants/api";
import examples from "./api-examples.json";
import type { ActiveMissionInfo, PointHistoryEntry, UserSettingsUpdateRequest } from "@/types/api";

let mission: ActiveMissionInfo | null = null;
let nextId = 1001;
let points = 1500;
let completed = 42;
let settings: UserSettingsUpdateRequest = {};
let history: PointHistoryEntry[] = [];
export function resetMockState() { mission = null; nextId = 1001; points = 1500; completed = 42; settings = {}; history = []; }
const failure = (message: string, status = 409) => HttpResponse.json({ message }, { status });
async function simulate(request: Request) {
  const scenario = request.headers.get("x-ohakkom-scenario");
  if (scenario === "slow") await delay(1200);
  if (scenario === "error") return failure("잠시 연결이 고르지 않아요. 다시 시도해 주세요.", 503);
  if (!new URL(request.url).pathname.includes("/auth/") && request.headers.get("Authorization") !== "Bearer qa-access-token") return failure("로그인이 필요해요.", 401);
  return null;
}
const isEmpty = (request: Request) => request.headers.get("x-ohakkom-scenario") === "empty";
export const handlers = [
  http.post(`${API_BASE_URL}/auth/signup`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const body = await request.json() as { email?: string; password?: string; nickname?: string; birth?: string; regionCode?: string };
    if (!body.email || !body.password || !body.nickname || !body.birth || !body.regionCode) return failure("회원가입 정보를 확인해 주세요.", 400);
    return HttpResponse.json({ ...examples.SignupResponse, nickname: body.nickname });
  }),
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const body = await request.json() as { email?: string; password?: string };
    if (!body.email || !body.password) return failure("이메일과 비밀번호를 입력해 주세요.", 400);
    return HttpResponse.json({ ...examples.LoginResponse, accessToken: "qa-access-token" });
  }),
  http.get(`${API_BASE_URL}/users/profile`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    return HttpResponse.json({ ...examples.UserProfileResponse, asset: { currentPoint: points }, stats: { totalCompletedMissions: completed } });
  }),
  http.patch(`${API_BASE_URL}/users/settings`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    settings = { ...settings, ...await request.json() as UserSettingsUpdateRequest };
    return HttpResponse.json({ ...examples.UserSettingsUpdateResponse, ...settings, updatedAt: new Date().toISOString() });
  }),
  http.get(`${API_BASE_URL}/missions/current`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    return HttpResponse.json({ hasActiveMission: Boolean(mission), mission });
  }),
  http.post(`${API_BASE_URL}/missions/recommendation`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const body = await request.json() as { latitude?: number; longitude?: number };
    if (!Number.isFinite(body.latitude) || !Number.isFinite(body.longitude)) return failure("위치가 필요해요.", 400);
    if (mission && mission.status !== "READY") return failure("진행 중인 미션을 먼저 확인해 주세요.");
    if (isEmpty(request)) return failure("주변에 추천할 장소가 없어요. 잠시 후 다시 시도해 주세요.", 404);
    mission = { missionId: nextId++, status: "READY", place: examples.PlaceInfo, estRewardPoint: 50 };
    return HttpResponse.json({ ...examples.MissionRecommendResponse, ...mission });
  }),
  ...(["start", "arrive", "complete", "abort"] as const).map((action) => http.post(`${API_BASE_URL}/missions/:id/${action}`, async ({ request, params }) => {
    const error = await simulate(request); if (error) return error;
    if (!mission || String(mission.missionId) !== params.id) return failure("미션을 찾지 못했어요.", 404);
    const missionId = mission.missionId;
    const now = new Date().toISOString();
    if (action === "start") {
      if (mission.status !== "READY") return failure("출발 대기 중인 미션이 아니에요.");
      mission = { ...mission, status: "IN_PROGRESS", startedAt: now };
      return HttpResponse.json({ missionId, status: "IN_PROGRESS", startedAt: now, message: "출발했어요." });
    }
    if (action === "arrive") {
      if (mission.status !== "IN_PROGRESS") return failure("진행 중인 미션이 아니에요.");
      const body = await request.json() as { latitude: number; longitude: number };
      const latitude = mission.place?.latitude ?? 0; const longitude = mission.place?.longitude ?? 0;
      const distance = Math.hypot((body.latitude - latitude) * 111000, (body.longitude - longitude) * 88000);
      if (!Number.isFinite(distance) || distance > 50) return failure("목적지 50m 이내에서 다시 시도해 주세요.", 400);
      mission = { ...mission, status: "ARRIVED" };
      return HttpResponse.json({ missionId, status: "ARRIVED", arrivedAt: now, message: "도착했어요." });
    }
    if (action === "abort") {
      mission = null;
      return HttpResponse.json({ missionId, status: "ABORTED", abortedAt: now, message: "산책을 중단했어요." });
    }
    if (mission.status !== "ARRIVED") return failure("도착 확인이 필요해요.");
    const body = await request.json() as { afterSurveyScore: number; stepCount?: number };
    if (!Number.isInteger(body.afterSurveyScore) || body.afterSurveyScore < 1 || body.afterSurveyScore > 5) return failure("설문 점수는 1~5점이에요.", 400);
    points += 50; completed += 1; mission = null;
    history.unshift({ historyId: history.length + 1, type: "EARN", amount: 50, description: "미션 완주 보상", createdAt: now });
    return HttpResponse.json({ ...examples.MissionCompleteResponse, missionId, completedAt: now, stepCount: body.stepCount ?? 0, reward: { earnedPoint: 50, currentTotalPoint: points } });
  })),
  http.get(`${API_BASE_URL}/rewards/points/history`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const url = new URL(request.url); const page = Number(url.searchParams.get("page") ?? 0); const size = Number(url.searchParams.get("size") ?? 20);
    const entries = isEmpty(request) ? [] : history;
    return HttpResponse.json({ currentPoint: points, history: entries.slice(page * size, (page + 1) * size), pagination: { currentPage: page, pageSize: size, totalPages: Math.ceil(entries.length / size), totalElements: entries.length, hasNext: entries.length > (page + 1) * size } });
  }),
  http.get(`${API_BASE_URL}/rewards/badges`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const badges = isEmpty(request) ? [] : examples.BadgeListResponse.badges;
    return HttpResponse.json({ badges, summary: { totalCount: badges.length, acquiredCount: badges.filter((badge) => badge.isAcquired).length } });
  }),
  http.get(`${API_BASE_URL}/rankings/my-region`, async ({ request }) => {
    const error = await simulate(request); if (error) return error;
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 50);
    return HttpResponse.json({ ...examples.RegionRankingResponse, myRanking: { ...examples.RankingEntry, isParticipating: settings.rankingSetting ?? false }, leaderboard: isEmpty(request) ? [] : examples.RegionRankingResponse.leaderboard.slice(0, limit) });
  }),
];
