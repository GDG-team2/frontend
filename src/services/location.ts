import * as Location from "expo-location";
import { USE_MSW } from "@/constants/api";

export async function requestMissionLocation(): Promise<{
  granted: boolean;
  qa: boolean;
}> {
  if (USE_MSW) return { granted: true, qa: true };
  const result = await Location.requestForegroundPermissionsAsync();
  return { granted: result.granted, qa: false };
}

export async function getMissionCoordinates() {
  if (USE_MSW) return { latitude: 37.499, longitude: 127.028 };
  if (!(await requestMissionLocation()).granted)
    throw new Error(
      "위치 권한을 허용해야 미션을 추천하고 도착을 확인할 수 있어요.",
    );
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
