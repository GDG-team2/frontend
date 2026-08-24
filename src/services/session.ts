import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "ohakkom-access-token";

export async function saveAccessToken(token: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  if (Platform.OS === "web") return AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
