import { useState } from "react";
import { Linking, View } from "react-native";
import { Navigation } from "lucide-react-native";
import { AppText, Button } from "./ui";
import { colors } from "@/constants/theme";

export function MapLink({
  name,
  latitude,
  longitude,
  placeUrl,
}: {
  name: string;
  latitude?: number;
  longitude?: number;
  placeUrl?: string;
}) {
  const [failed, setFailed] = useState(false);
  let url: string | undefined;
  if (placeUrl) {
    try {
      const parsed = new URL(placeUrl);
      if (
        ["http:", "https:"].includes(parsed.protocol) &&
        ["place.map.kakao.com", "map.kakao.com"].includes(parsed.hostname)
      ) {
        parsed.protocol = "https:";
        url = parsed.toString();
      }
    } catch {
      /* Fall back to coordinates. */
    }
  }
  if (!url && Number.isFinite(latitude) && Number.isFinite(longitude))
    url = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${latitude},${longitude}`;
  return (
    <View>
      <Button
        label="카카오맵에서 장소 보기"
        icon={Navigation}
        variant="secondary"
        disabled={!url}
        onPress={() => {
          setFailed(false);
          void Linking.openURL(url!).catch(() => setFailed(true));
        }}
      />
      {failed ? (
        <AppText color={colors.danger}>
          지도를 열지 못했어요. 연결 상태를 확인하고 다시 눌러주세요.
        </AppText>
      ) : null}
    </View>
  );
}
