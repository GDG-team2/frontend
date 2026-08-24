import * as Location from "expo-location";
import { Platform } from "react-native";

export async function requestMissionLocation(): Promise<{ granted: boolean; qa: boolean }> {
  if (Platform.OS === "web") return { granted: true, qa: true };
  const result = await Location.requestForegroundPermissionsAsync();
  return { granted: result.granted, qa: false };
}
