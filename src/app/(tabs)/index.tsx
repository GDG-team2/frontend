import { useRouter } from "expo-router";
import { Bell, ChevronRight, MessageSquareText, SlidersHorizontal, Sparkles, TrendingUp, WalletCards } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Button, Card, Chip, Page, StateView } from "@/components/ui";
import { colors, layout, radius, spacing } from "@/constants/theme";
import { useMe } from "@/services/queries";
import type { Mood } from "@/types/domain";

const moods: Mood[] = ["지침", "답답함", "심심함", "가벼움"];

export default function HomeScreen() {
  const router = useRouter();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const compactViewport = viewportHeight < 640;
  const narrowViewport = viewportWidth < 360;
  const [mood, setMood] = useState<Mood>("답답함");
  const me = useMe();

  if (me.isLoading) return <Page><StateView type="loading" description="오늘의 한 칸을 준비하고 있어요." /></Page>;
  if (me.isError) return <Page><StateView type="error" description="내 정보를 불러오지 못했어요." onRetry={() => me.refetch()} /></Page>;

  const user = me.data;
  if (!user) return <Page><StateView type="empty" title="프로필을 찾지 못했어요" description="QA 상태를 초기화한 뒤 다시 확인해 주세요." /></Page>;

  const weeklyRemaining = Math.max(user.weeklyGoal - user.weeklyDone, 0);

  return (
    <Page
      testID="home-screen"
      actionMode="floating"
      actionHeight={96}
      action={<Button label="오늘 미션 받기" icon={Sparkles} style={styles.floatingButton} onPress={() => router.push({ pathname: "/mission", params: { mood } })} />}
    >
      <View style={[styles.topBar, compactViewport && styles.topBarCompact]}>
        <View>
          <AppText variant="caption" color={colors.inkMuted}>오늘도 한 칸만</AppText>
          <AppText variant="heading">안녕하세요, {user.nickname}님</AppText>
        </View>
        <View style={styles.topActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="QA 시나리오" onPress={() => router.push("/qa")} style={styles.iconButton}>
            <SlidersHorizontal size={20} color={colors.ink} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="알림" onPress={() => router.push("/notifications")} style={styles.iconButton}>
            <Bell size={21} color={colors.ink} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
      </View>

      <Card tone="lime" style={[styles.heroCard, compactViewport && styles.heroCardCompact]}>
        <View style={[styles.heroTop, compactViewport && styles.heroTopCompact]}>
          <View style={[styles.heroIcon, compactViewport && styles.heroIconCompact]}><Sparkles size={20} color={colors.limeInk} /></View>
          <View style={[styles.heroBadge, compactViewport && styles.heroBadgeCompact]}>
            <View style={styles.heroBadgeDot} />
            <AppText variant="caption" color={colors.limeInk}>이번 주 {user.weeklyDone}/{user.weeklyGoal}</AppText>
          </View>
        </View>
        <AppText variant="title">결정할 힘이 없어도,{"\n"}나갈 수 있게.</AppText>
        <AppText color={colors.limeInk} style={compactViewport && styles.heroBodyCompact}>컨디션에 맞는 가까운 목적지와 할 일을 하나만 제안해요.</AppText>
        <View style={[styles.progressPanel, compactViewport && styles.progressPanelCompact]}>
          <View style={styles.progressCopy}>
            <AppText variant="caption" color={colors.limeInk}>주간 외출 흐름</AppText>
            <AppText variant="label" color={colors.limeInk}>
              {weeklyRemaining > 0 ? `${weeklyRemaining}번만 더` : "이번 주 목표 완료"}
            </AppText>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min((user.weeklyDone / user.weeklyGoal) * 100, 100)}%` }]} />
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="heading">지금 기분은 어떤가요?</AppText>
          <AppText variant="caption" color={colors.inkMuted}>추천 강도를 맞춰요</AppText>
        </View>
        <View style={styles.chips}>
          {moods.map((item) => <Chip key={item} label={item} selected={mood === item} onPress={() => setMood(item)} />)}
        </View>
      </View>

      <Card onPress={() => router.push("/mission/conditions")} accessibilityLabel="원하는 미션 직접 말하기" style={styles.promptCard}>
        <View style={styles.promptIcon}><MessageSquareText size={21} color={colors.purpleStrong} /></View>
        <View style={styles.promptCopy}>
          <AppText variant="label">원하는 게 있다면 말해도 좋아요</AppText>
          <AppText variant="caption" color={colors.inkMuted}>“조용한 데서 20분만 걷고 싶어”</AppText>
        </View>
        <View style={styles.promptArrow}><ChevronRight size={18} color={colors.inkMuted} /></View>
      </Card>

      <View style={[styles.insightRow, narrowViewport && styles.insightRowNarrow]}>
        <Card tone="purple" onPress={() => router.push("/insights")} accessibilityLabel="인사이트 보기" style={styles.smallCard}>
          <View style={styles.smallCardTop}>
            <View style={[styles.smallIcon, styles.purpleIcon]}><TrendingUp size={17} color={colors.purpleInk} /></View>
            <AppText variant="caption" color={colors.purpleInk}>나의 변화</AppText>
          </View>
          <AppText variant="heading" color={colors.purpleInk}>외출 뒤 기분{`\n`}+32%</AppText>
        </Card>
        <Card tone="subtle" onPress={() => router.push("/benefits")} accessibilityLabel="혜택 지갑 보기" style={styles.smallCard}>
          <View style={styles.smallCardTop}>
            <View style={styles.smallIcon}><WalletCards size={17} color={colors.inkMuted} /></View>
            <AppText variant="caption" color={colors.inkMuted}>쌓인 포인트</AppText>
          </View>
          <AppText variant="heading">{user.points.toLocaleString()} P</AppText>
        </Card>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  topBar: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  topBarCompact: { marginBottom: spacing.sm },
  topActions: { flexDirection: "row", gap: spacing.xxs },
  iconButton: { width: layout.minTouch, height: layout.minTouch, borderRadius: 22, backgroundColor: colors.surfaceRaised, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 10, top: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.purpleStrong, borderWidth: 1.5, borderColor: colors.surfaceRaised },
  heroCard: { paddingVertical: spacing.xl, paddingHorizontal: spacing.lg, gap: spacing.sm, borderRadius: radius.xxl, backgroundColor: colors.lime, borderColor: colors.transparent },
  heroCardCompact: { paddingVertical: spacing.md, gap: spacing.xs },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  heroTopCompact: { marginBottom: 0 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.58)", alignItems: "center", justifyContent: "center" },
  heroIconCompact: { width: 36, height: 36, borderRadius: 18 },
  heroBadge: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: spacing.sm, borderRadius: radius.round, backgroundColor: "rgba(255,255,255,0.42)" },
  heroBadgeCompact: { minHeight: 28 },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.limeInk },
  progressPanel: { gap: spacing.xs, padding: spacing.sm, borderRadius: radius.lg, backgroundColor: "rgba(255,255,255,0.36)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(65,72,44,0.13)", marginTop: spacing.sm },
  progressPanelCompact: { paddingVertical: spacing.xs, marginTop: 0 },
  heroBodyCompact: { fontSize: 14, lineHeight: 20 },
  progressCopy: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden", backgroundColor: "rgba(65,72,44,0.14)" },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: colors.limeInk },
  section: { gap: spacing.md, marginTop: spacing.xxl },
  sectionHeading: { gap: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  promptCard: { marginTop: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  promptIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center" },
  promptCopy: { flex: 1, gap: 2 },
  promptArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center" },
  insightRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  insightRowNarrow: { flexDirection: "column" },
  smallCard: { flex: 1, minHeight: 138, justifyContent: "space-between", padding: spacing.md },
  smallCardTop: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  smallIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" },
  purpleIcon: { backgroundColor: "rgba(255,255,255,0.46)" },
  floatingButton: { borderRadius: radius.round },
});
