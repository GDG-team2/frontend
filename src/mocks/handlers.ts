import { delay, http, HttpResponse } from "msw";

import { API_BASE_URL } from "@/constants/api";
import { mockBenefits, mockMission, mockNotifications, mockRanking, mockRecords, mockUser } from "@/mocks/data";
import type { MockScenario } from "@/types/domain";

function scenarioOf(request: Request): MockScenario {
  const value = request.headers.get("x-ohakkom-scenario");
  return value === "slow" || value === "error" || value === "empty" ? value : "success";
}

async function simulate(request: Request) {
  const scenario = scenarioOf(request);
  if (scenario === "slow") await delay(1200);
  if (scenario === "error") {
    return HttpResponse.json(
      { code: "MOCK_NETWORK_ERROR", message: "잠시 연결이 고르지 않아요. 다시 시도해 주세요." },
      { status: 503 },
    );
  }
  return null;
}

export const handlers = [
  http.post(`${API_BASE_URL}/auth/kakao`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json({ accessToken: "qa-access-token", user: mockUser });
  }),
  http.get(`${API_BASE_URL}/me`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json(mockUser);
  }),
  http.patch(`${API_BASE_URL}/me`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    const patch = (await request.json()) as Partial<typeof mockUser>;
    return HttpResponse.json({ ...mockUser, ...patch });
  }),
  http.get(`${API_BASE_URL}/missions/recommendation`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    if (scenarioOf(request) === "empty") return new HttpResponse(null, { status: 204 });
    return HttpResponse.json(mockMission);
  }),
  http.post(`${API_BASE_URL}/missions/:id/start`, async ({ request, params }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json({ missionId: params.id, startedAt: new Date().toISOString() });
  }),
  http.post(`${API_BASE_URL}/missions/:id/complete`, async ({ request, params }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json({ missionId: params.id, record: mockRecords[0], earnedPoints: 120 });
  }),
  http.post(`${API_BASE_URL}/missions/:id/reject`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json({ next: mockMission });
  }),
  http.get(`${API_BASE_URL}/history`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json(scenarioOf(request) === "empty" ? [] : mockRecords);
  }),
  http.get(`${API_BASE_URL}/history/:id`, async ({ request, params }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    const record = mockRecords.find((item) => item.id === params.id) ?? mockRecords[0];
    return HttpResponse.json(record);
  }),
  http.get(`${API_BASE_URL}/notifications`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json(scenarioOf(request) === "empty" ? [] : mockNotifications);
  }),
  http.get(`${API_BASE_URL}/benefits`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json(scenarioOf(request) === "empty" ? [] : mockBenefits);
  }),
  http.get(`${API_BASE_URL}/ranking`, async ({ request }) => {
    const failure = await simulate(request);
    if (failure) return failure;
    return HttpResponse.json(scenarioOf(request) === "empty" ? [] : mockRanking);
  }),
];
