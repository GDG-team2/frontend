import { USE_MSW } from "@/constants/api";
import { Image } from "expo-image";
import { Crosshair, MapPin } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, shadow, spacing } from "@/constants/theme";
import { kakaoStatus } from "@/services/kakao";

type MapVariant = "mission" | "place" | "history";

const sources = {
  mission: require("../../../assets/figma/mission-map.svg"),
  place: require("../../../assets/figma/place-map.svg"),
  history: require("../../../assets/figma/history-route.svg"),
};

export function MapPreview({ variant = "mission", height = 260, interactive = true }: { variant?: MapVariant; height?: number; interactive?: boolean }) {
  if (!USE_MSW) return <View style={[styles.container, { height: 80, padding: spacing.md }]}><AppText>목적지 지도는 장소 정보에서 열 수 있어요.</AppText></View>;
  return (
    <View style={[styles.container, { height }]}>
      <Image source={sources[variant]} contentFit="fill" style={StyleSheet.absoluteFill} accessibilityLabel="망원동 주변 지도 미리보기" />
      <View style={styles.pin}>
        <MapPin size={25} color={colors.white} fill={colors.purple} />
      </View>
      {variant === "place" ? (
        <>
          <View style={[styles.savedPin, styles.savedPinOne]}><MapPin size={15} color={colors.white} fill={colors.purple} /></View>
          <View style={[styles.savedPin, styles.savedPinTwo]}><MapPin size={15} color={colors.white} fill={colors.purple} /></View>
          <View style={[styles.savedPin, styles.savedPinThree]}><MapPin size={15} color={colors.ink} fill={colors.lime} /></View>
        </>
      ) : null}
      {!kakaoStatus.mapConfigured ? (
        <View style={styles.qaBadge}>
          <View style={styles.qaDot} />
          <AppText variant="caption" color={colors.ink}>QA 지도</AppText>
        </View>
      ) : null}
      {interactive ? (
        <Pressable accessibilityRole="button" accessibilityLabel="현재 위치로 이동" style={styles.locationButton}>
          <Crosshair size={20} color={colors.ink} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", borderRadius: radius.xl, backgroundColor: colors.surfaceSubtle },
  pin: { position: "absolute", top: "43%", left: "48%", width: 42, height: 42, borderRadius: 21, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.white, ...shadow.card },
  savedPin: { position: "absolute", width: 28, height: 28, borderRadius: 14, backgroundColor: colors.purple, borderWidth: 2, borderColor: colors.white, alignItems: "center", justifyContent: "center", ...shadow.card },
  savedPinOne: { top: "24%", left: "24%" },
  savedPinTwo: { top: "70%", left: "70%" },
  savedPinThree: { top: "63%", left: "18%", backgroundColor: colors.lime },
  qaBadge: { position: "absolute", left: spacing.sm, top: spacing.sm, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 30, borderRadius: radius.round, backgroundColor: "rgba(255,255,255,0.92)" },
  qaDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.purple },
  locationButton: { position: "absolute", right: spacing.sm, bottom: spacing.sm, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", ...shadow.card },
});
