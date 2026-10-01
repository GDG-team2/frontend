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
  let timer: ReturnType<typeof setTimeout> | undefined;
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              "위치를 확인하는 데 시간이 걸려요. GPS와 위치 권한을 확인한 뒤 다시 시도해 주세요.",
            ),
          ),
        20000,
      );
    }),
  ]).finally(() => clearTimeout(timer));
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
