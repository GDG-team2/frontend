import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { ArrowUpRight, Clock3, LockKeyhole, Sparkles, SunMedium } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { WeeklyBars } from "@/components/WeeklyBars";
import { AppText, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

function PreviewInsightsScreen() {
  const { width } = useWindowDimensions();
  const narrow = width < 360;

  return (
    <Page>
      <TopBar title="인사이트" />
      <Card tone="lime" style={styles.goalCard}>
        <View style={styles.goalTop}><View><AppText variant="caption" color={colors.limeInk}>이번 주 목표</AppText><AppText variant="title" color={colors.limeInk}>3 / 4번 외출</AppText></View><View style={styles.goalBadge}><ArrowUpRight size={20} color={colors.limeInk} /></View></View>
        <View style={styles.track}><View style={styles.fill} /></View>
        <AppText variant="caption" color={colors.limeInk}>딱 한 번만 더 나가면 이번 주 목표를 채워요.</AppText>
      </Card>
      <View style={[styles.insightGrid, narrow && styles.insightGridNarrow]}>
        <Card tone="purple" style={styles.insightCard}><Sparkles size={21} color={colors.purpleInk} /><AppText variant="heading" color={colors.purpleInk}>외출 뒤 기분이{`\n`}평균 32% 가벼워요</AppText><AppText variant="caption" color={colors.purpleInk}>최근 기록 12개 기준</AppText></Card>
        <Card tone="lime" style={styles.insightCard}><SunMedium size={21} color={colors.limeInk} /><AppText variant="heading" color={colors.limeInk}>토요일 오후가{`\n`}가장 편했어요</AppText><AppText variant="caption" color={colors.limeInk}>오후 3–6시</AppText></Card>
      </View>
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}><View><AppText variant="heading">요일별 외출 에너지</AppText><AppText variant="caption" color={colors.inkMuted}>완료 후 남긴 기분을 기준으로 봤어요.</AppText></View><Clock3 size={20} color={colors.inkMuted} /></View>
        <WeeklyBars />
      </Card>
      <Card tone="subtle" style={styles.privacy}><LockKeyhole size={19} color={colors.inkMuted} /><AppText variant="caption" color={colors.inkMuted} style={styles.privacyCopy}>인사이트는 나에게만 보여요. 정확한 이동 경로 없이 시간·거리·기분 기록으로 계산해요.</AppText></Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  goalCard: { gap: spacing.sm, marginTop: spacing.lg },
  goalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  track: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: colors.white },
  fill: { width: "75%", height: 8, backgroundColor: colors.ink },
  insightGrid: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  insightGridNarrow: { flexDirection: "column" },
  insightCard: { flex: 1, minHeight: 175, justifyContent: "space-between", padding: spacing.md },
  chartCard: { gap: spacing.xl, marginTop: spacing.sm },
  chartHeader: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.xs },
  privacy: { flexDirection: "row", gap: spacing.xs, alignItems: "center", marginTop: spacing.sm, padding: spacing.md },
  privacyCopy: { flex: 1 },
});

export default function Screen() { return USE_MSW ? <PreviewInsightsScreen /> : <UnavailableFeature title="인사이트" />; }
