import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { API_BASE_URL, USE_MSW } from "@/constants/api";
import { createSessionManager } from "./session-manager";

// Separate QA/live and API hosts; SecureStore keys only allow letters, digits, .-_
const hostKey = Array.from(API_BASE_URL)
  .map((char) => char.charCodeAt(0).toString(16))
  .join("");
const SESSION_KEY = `ohakkom-session-v2-${USE_MSW ? "qa" : "live"}-${hostKey}`;
const manager = createSessionManager({
  read: () =>
    Platform.OS === "web"
      ? AsyncStorage.getItem(SESSION_KEY)
      : SecureStore.getItemAsync(SESSION_KEY),
  write: (value) =>
    Platform.OS === "web"
      ? AsyncStorage.setItem(SESSION_KEY, value)
      : SecureStore.setItemAsync(SESSION_KEY, value),
  remove: () =>
    Platform.OS === "web"
      ? AsyncStorage.removeItem(SESSION_KEY)
      : SecureStore.deleteItemAsync(SESSION_KEY),
});
export const getSession = manager.get;
export const getSessionVersion = manager.version;
export const saveSession = manager.save;
export const replaceSession = manager.replace;
export const invalidateSession = manager.invalidate;

export async function saveAccessToken(token: string) {
  if (!USE_MSW) throw new Error("액세스·리프레시 토큰을 함께 저장해야 합니다.");
  return saveSession({ accessToken: token, refreshToken: "qa-refresh-token" });
}

export async function clearAccessToken() {
  return manager.clear();
}

export async function getAccessToken() {
  return (await getSession())?.accessToken ?? null;
}
