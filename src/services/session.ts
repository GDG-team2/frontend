import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { API_BASE_URL, USE_MSW } from "@/constants/api";

// Separate QA/live and API hosts; SecureStore keys only allow letters, digits, .-_
const hostKey = Array.from(API_BASE_URL)
  .map((char) => char.charCodeAt(0).toString(16))
  .join("");
const ACCESS_TOKEN_KEY = `ohakkom-access-token-${USE_MSW ? "qa" : "live"}-${hostKey}`;

export async function saveAccessToken(token: string) {
  if (Platform.OS === "web")
    return AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  if (Platform.OS === "web") return AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getAccessToken() {
  if (Platform.OS === "web") return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}
