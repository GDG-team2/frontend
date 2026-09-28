import { useRouter } from "expo-router";
import {
  Award,
  ChevronRight,
  MapPin,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react-native";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Button, Card, Page, StateView } from "@/components/ui";
import { colors, layout, radius, spacing } from "@/constants/theme";
import { USE_MSW } from "@/constants/api";
import { useMe, useRecommendation } from "@/services/queries";

export default function HomeScreen() {
  const router = useRouter();
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();
  const compactViewport = viewportHeight < 640;
  const narrowViewport = viewportWidth < 360;
  const current = useRecommendation();
  const me = useMe();

  if (me.isLoading)
    return (
      <Page>
        <StateView
          type="loading"
          description="오늘의 한 칸을 준비하고 있어요."
        />
      </Page>
    );
  if (me.isError)
    return (
      <Page>
        <StateView
          type="error"
          description="내 정보를 불러오지 못했어요."
          onRetry={() => me.refetch()}
        />
      </Page>
    );

  const user = me.data;
  if (!user)
    return (
      <Page>
        <StateView
          type="empty"
          title="프로필을 찾지 못했어요"
          description="QA 상태를 초기화한 뒤 다시 확인해 주세요."
        />
      </Page>
    );

  const mission = current.data;

  return (
    <Page
      testID="home-screen"
      actionMode="floating"
      actionHeight={96}
      action={
        <Button
          label={mission ? "현재 미션 이어하기" : "오늘 미션 받기"}
          icon={Sparkles}
          style={styles.floatingButton}
          onPress={() => router.push("/mission")}
        />
      }
    >
      <View style={[styles.topBar, compactViewport && styles.topBarCompact]}>
        <View style={styles.greeting}>
          <AppText variant="caption" color={colors.inkMuted}>
            오늘도 반가워요
          </AppText>
          <AppText
            variant="heading"
            numberOfLines={1}
            accessibilityLabel={`안녕하세요, ${user.nickname}님`}
          >
            {user.nickname}님
          </AppText>
        </View>
        <View style={styles.topActions}>
          {USE_MSW ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="QA 시나리오"
              onPress={() => router.push("/qa")}
              style={styles.iconButton}
            >
              <SlidersHorizontal size={20} color={colors.ink} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="설정"
            onPress={() => router.push("/settings")}
            style={styles.iconButton}
          >
            <Settings size={21} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <Card
        tone="lime"
        style={[styles.heroCard, compactViewport && styles.heroCardCompact]}
      >
        <View
          style={[styles.heroTop, compactViewport && styles.heroTopCompact]}
        >
          <View
            style={[styles.heroIcon, compactViewport && styles.heroIconCompact]}
          >
            <Sparkles size={20} color={colors.limeInk} />
          </View>
          <View
            style={[
              styles.heroBadge,
              compactViewport && styles.heroBadgeCompact,
            ]}
          >
            <View style={styles.heroBadgeDot} />
            <AppText variant="caption" color={colors.limeInk}>
              {user.streak}일 연속 산책
            </AppText>
          </View>
        </View>
        <AppText variant="title">
          결정할 힘이 없어도,{"\n"}나갈 수 있게.
        </AppText>
        <AppText
          color={colors.limeInk}
          style={compactViewport && styles.heroBodyCompact}
        >
          현재 위치에서 가까운 산책 목적지를 하나만 제안해요.
        </AppText>
        <View
          style={[
            styles.progressPanel,
            compactViewport && styles.progressPanelCompact,
          ]}
        >
          <View style={styles.progressCopy}>
            <AppText variant="caption" color={colors.limeInk}>
              차곡차곡 쌓인 나의 한 칸
            </AppText>
            <AppText variant="label" color={colors.limeInk}>
              총 {user.totalOutings}번 완료
            </AppText>
          </View>
          <View style={styles.district}>
            <MapPin size={14} color={colors.limeInk} />
            <AppText
              variant="caption"
              color={colors.limeInk}
              style={styles.districtCopy}
            >
              {user.district}
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="heading">
            {mission ? "이어서 한 걸음 더" : "오늘도 가볍게 나가볼까요?"}
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {mission
              ? "진행하던 미션을 여기서 이어갈 수 있어요."
              : "먼저 목적지를 보고, 출발은 천천히 결정해요."}
          </AppText>
        </View>
        {current.isError ? (
          <StateView
            type="error"
            title="현재 미션을 확인하지 못했어요"
            onRetry={() => current.refetch()}
          />
        ) : (
          <Card
            onPress={() => router.push("/mission")}
            accessibilityLabel={
              mission ? "현재 미션 이어하기" : "가까운 산책 미션 찾아보기"
            }
            style={styles.promptCard}
          >
            <View style={styles.promptIcon}>
              <MapPin size={21} color={colors.purpleStrong} />
            </View>
            <View style={styles.promptCopy}>
              <AppText variant="label">
                {mission?.destination ?? "내 주변 산책 미션 찾기"}
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {mission?.status === "ARRIVED"
                  ? "도착 확인 완료 · 설문을 남겨주세요"
                  : mission?.status === "IN_PROGRESS"
                    ? "지금 산책 중이에요"
                    : mission
                      ? "출발을 기다리는 미션이에요"
                      : "오늘의 목적지를 하나만 추천해드려요"}
              </AppText>
            </View>
            <View style={styles.promptArrow}>
              <ChevronRight size={18} color={colors.inkMuted} />
            </View>
          </Card>
        )}
      </View>

      <View
        style={[styles.insightRow, narrowViewport && styles.insightRowNarrow]}
      >
        <Card
          tone="purple"
          onPress={() => router.push("/ranking")}
          accessibilityLabel="우리 동네 주간 랭킹 보기"
          style={styles.smallCard}
        >
          <View style={styles.smallCardTop}>
            <View style={[styles.smallIcon, styles.purpleIcon]}>
              <Trophy size={17} color={colors.purpleInk} />
            </View>
            <AppText variant="caption" color={colors.purpleInk}>
              우리 동네
            </AppText>
          </View>
          <AppText variant="heading" color={colors.purpleInk}>
            주간 랭킹{`\n`}둘러보기
          </AppText>
        </Card>
        <Card
          tone="subtle"
          onPress={() => router.push("/benefits")}
          accessibilityLabel="혜택 지갑 보기"
          style={styles.smallCard}
        >
          <View style={styles.smallCardTop}>
            <View style={styles.smallIcon}>
              <WalletCards size={17} color={colors.inkMuted} />
            </View>
            <AppText variant="caption" color={colors.inkMuted}>
              쌓인 포인트
            </AppText>
          </View>
          <AppText variant="heading">{user.points.toLocaleString()} P</AppText>
        </Card>
      </View>
      <Card
        tone="outline"
        onPress={() => router.push("/badges")}
        accessibilityLabel="배지와 업적 보기"
        style={styles.badgeLink}
      >
        <View style={styles.smallIcon}>
          <Award size={20} color={colors.ink} />
        </View>
        <View style={styles.promptCopy}>
          <AppText variant="label">한 칸씩 모으는 배지</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            산책으로 얻은 작은 성취를 확인해요.
          </AppText>
        </View>
        <ChevronRight size={18} color={colors.inkMuted} />
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  greeting: { flex: 1, minWidth: 0, marginRight: spacing.xs },
  district: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  districtCopy: { flex: 1 },
  badgeLink: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  topBar: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  topBarCompact: { marginBottom: spacing.sm },
  topActions: { flexDirection: "row", gap: spacing.xxs },
  iconButton: {
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    right: 10,
    top: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.purpleStrong,
    borderWidth: 1.5,
    borderColor: colors.surfaceRaised,
  },
  heroCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xxl,
    backgroundColor: colors.lime,
    borderColor: colors.transparent,
  },
  heroCardCompact: { paddingVertical: spacing.md, gap: spacing.xs },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  heroTopCompact: { marginBottom: 0 },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconCompact: { width: 36, height: 36, borderRadius: 18 },
  heroBadge: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  heroBadgeCompact: { minHeight: 28 },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.limeInk,
  },
  progressPanel: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.36)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(65,72,44,0.13)",
    marginTop: spacing.sm,
  },
  progressPanelCompact: { paddingVertical: spacing.xs, marginTop: 0 },
  heroBodyCompact: { fontSize: 14, lineHeight: 20 },
  progressCopy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(65,72,44,0.14)",
  },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: colors.limeInk },
  section: { gap: spacing.md, marginTop: spacing.xxl },
  sectionHeading: { gap: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  promptIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  promptCopy: { flex: 1, gap: 2 },
  promptArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  insightRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  insightRowNarrow: { flexDirection: "column" },
  smallCard: {
    flex: 1,
    minHeight: 138,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  smallCardTop: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  smallIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  purpleIcon: { backgroundColor: "rgba(255,255,255,0.46)" },
  floatingButton: { borderRadius: radius.round },
});
