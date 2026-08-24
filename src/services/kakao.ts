import { apiPost } from "@/services/api";
import type { UserProfile } from "@/types/domain";

export const kakaoStatus = {
  configured: Boolean(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY),
  mapConfigured: Boolean(process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY),
};

type KakaoAuthResponse = { accessToken: string; user: UserProfile };

export async function signInWithKakao(): Promise<KakaoAuthResponse> {
  if (!kakaoStatus.configured) {
    return apiPost<KakaoAuthResponse>("/auth/kakao", { mode: "qa-bypass" });
  }

  // Native Kakao SDK access token plugs into this boundary once the Kakao app is issued.
  return apiPost<KakaoAuthResponse>("/auth/kakao", { mode: "configured-adapter" });
}
