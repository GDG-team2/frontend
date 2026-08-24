import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Bookmark, Check, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Button, Card, Metric, Page, TopBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { apiPost } from "@/services/api";
import { useAppStore } from "@/store/app-store";

export default function CompleteMissionScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const setActiveMissionId = useAppStore((state) => state.setActiveMissionId);
  const complete = useMutation({
    mutationFn: () => apiPost("/missions/mission-01/complete", { rating }),
    onSuccess: () => {
      setActiveMissionId(null);
      router.replace("/(tabs)/history");
    },
  });

  return (
    <Page action={<Button label="외출 기록 완료" loading={complete.isPending} onPress={() => complete.mutate()} />}>
      <TopBar title="도착 · 기록" />
      <View style={styles.successHalo}>
        <View style={styles.successInner}><Check size={44} strokeWidth={3} color={colors.ink} /></View>
      </View>
      <View style={styles.header}>
        <AppText variant="display" align="center">오늘의 한 칸,{"\n"}완료했어요.</AppText>
        <AppText color={colors.inkMuted} align="center">작은 정원까지 무사히 도착했어요. 지금의 기분만 가볍게 남겨주세요.</AppText>
      </View>
      <Card tone="subtle" style={styles.metrics}>
        <Metric value="18분" label="걸린 시간" />
        <View style={styles.metricDivider} />
        <Metric value="0.8km" label="걸은 거리" />
        <View style={styles.metricDivider} />
        <Metric value="+120P" label="받은 보상" accent={colors.purpleStrong} />
      </Card>
      <View style={styles.ratingSection}>
        <AppText variant="heading" align="center">이번 외출은 어땠나요?</AppText>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value}점`} accessibilityState={{ selected: rating === value }} onPress={() => setRating(value)} style={styles.starButton}>
              <Star size={31} color={value <= rating ? colors.purple : colors.borderStrong} fill={value <= rating ? colors.purple : colors.transparent} />
            </Pressable>
          ))}
        </View>
        <AppText variant="caption" color={colors.inkMuted} align="center">{rating >= 4 ? "나오기 잘한 것 같아요" : "다음엔 더 편한 미션으로 골라볼게요"}</AppText>
      </View>
      <Card tone="lime" style={styles.saveCard}>
        <View style={styles.saveIcon}><Bookmark size={19} color={colors.limeInk} /></View>
        <View style={styles.saveCopy}><AppText variant="label" color={colors.limeInk}>망원동 작은 정원을 내 지도에 저장</AppText><AppText variant="caption" color={colors.limeInk}>다음에 다시 갈 수 있게 표시해둘게요.</AppText></View>
      </Card>
      {complete.isError ? <AppText variant="caption" color={colors.danger} align="center">기록을 저장하지 못했어요. 다시 눌러주세요.</AppText> : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  successHalo: { width: 170, height: 170, borderRadius: 85, backgroundColor: colors.limeFaint, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: spacing.lg },
  successInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.lime, alignItems: "center", justifyContent: "center" },
  header: { gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.sm },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg, paddingHorizontal: spacing.xs },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: colors.borderStrong },
  ratingSection: { gap: spacing.sm, marginTop: spacing.lg },
  stars: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  starButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  saveCard: { marginTop: spacing.xl, flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  saveIcon: { width: 40, height: 40, borderRadius: radius.round, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  saveCopy: { flex: 1, gap: 2 },
});
