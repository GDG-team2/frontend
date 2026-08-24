import { useRouter } from "expo-router";
import { Flag, MapPin, MoreHorizontal, Pause, Play, ShieldAlert } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Button, Card, MapPreview, Page } from "@/components/ui";
import { colors, layout, radius, shadow, spacing } from "@/constants/theme";

export default function ActiveMissionScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(7 * 60 + 24);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [paused]);

  const elapsed = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  return (
    <Page
      testID="active-mission-screen"
      scroll={false}
      padded={false}
      action={<Button label="도착했어요" icon={Flag} onPress={() => router.push("/mission/complete")} />}
      contentStyle={styles.page}
    >
      <MapPreview height={460} />
      <View style={styles.topOverlay}>
        <View style={styles.routeCard}>
          <View style={styles.routeIcon}><MapPin size={19} color={colors.limeInk} /></View>
          <View style={styles.routeCopy}>
            <AppText variant="label">망원동 작은 정원</AppText>
            <AppText variant="caption" color={colors.inkMuted}>앞으로 430m · 약 6분</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="이동 메뉴" style={styles.moreButton} onPress={() => router.push("/mission/end")}><MoreHorizontal size={21} color={colors.ink} /></Pressable>
        </View>
      </View>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.liveRow}>
          <View>
            <AppText variant="caption" color={colors.inkMuted}>이동 중</AppText>
            <AppText variant="title">{elapsed}</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={paused ? "다시 시작" : "잠시 멈춤"} onPress={() => setPaused((value) => !value)} style={[styles.pause, paused && styles.pauseActive]}>
            {paused ? <Play size={20} color={colors.ink} /> : <Pause size={20} color={colors.ink} />}
          </Pressable>
        </View>
        <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        <View style={styles.statRow}>
          <View><AppText variant="heading">350m</AppText><AppText variant="caption" color={colors.inkMuted}>걸어온 거리</AppText></View>
          <View><AppText variant="heading">430m</AppText><AppText variant="caption" color={colors.inkMuted}>남은 거리</AppText></View>
          <View><AppText variant="heading">42%</AppText><AppText variant="caption" color={colors.inkMuted}>진행</AppText></View>
        </View>
        <Card tone="subtle" style={styles.safetyRow} onPress={() => router.push("/mission/end")} accessibilityLabel="안전하게 중도 종료">
          <ShieldAlert size={18} color={colors.inkMuted} />
          <AppText variant="caption" color={colors.inkMuted}>불편하거나 위험하면 바로 돌아와도 괜찮아요.</AppText>
        </Card>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 190 },
  topOverlay: { position: "absolute", left: 0, right: 0, top: spacing.sm, paddingHorizontal: layout.screenPadding },
  routeCard: { minHeight: 68, borderRadius: radius.lg, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, ...shadow.card },
  routeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.limeSoft, alignItems: "center", justifyContent: "center" },
  routeCopy: { flex: 1 },
  moreButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 76, minHeight: 250, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, backgroundColor: colors.white, padding: spacing.lg, ...shadow.floating },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginBottom: spacing.md },
  liveRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pause: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.lime },
  pauseActive: { backgroundColor: colors.purpleSoft },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: colors.chip, marginVertical: spacing.md },
  progressFill: { width: "42%", height: 8, backgroundColor: colors.purple, borderRadius: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  safetyRow: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: spacing.xs, padding: spacing.sm, marginTop: spacing.md },
});
