import { Redirect, useRouter } from "expo-router";
import { Award, Check, Flame, Gift, Star, Trophy } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Metric,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import { useMissionAction, useRecommendation } from "@/services/queries";

export default function CompleteMissionScreen() {
  const router = useRouter();
  const current = useRecommendation();
  const { height } = useWindowDimensions();
  const compact = height < 700;
  const [rating, setRating] = useState(5);
  const complete = useMissionAction(async (mission) => {
    if (mission.status !== "ARRIVED")
      throw new Error("목적지 도착 확인을 먼저 해주세요.");
    return backend.complete(Number(mission.id), { afterSurveyScore: rating });
  });
  const result = complete.data;

  if (!result && current.isLoading)
    return (
      <Page>
        <TopBar title="도착 · 기록" />
        <StateView type="loading" />
      </Page>
    );
  if (!result && current.isError)
    return (
      <Page>
        <TopBar title="도착 · 기록" />
        <StateView type="error" onRetry={() => current.refetch()} />
      </Page>
    );
  if (!result && !current.data && complete.isPending)
    return (
      <Page>
        <TopBar title="도착 · 기록" />
        <StateView
          type="loading"
          description="기록과 보상을 저장하고 있어요."
        />
      </Page>
    );
  if (!result && !current.data)
    return (
      <Page>
        <TopBar title="미션 상태" />
        <StateView
          type="empty"
          title="완료할 미션이 없어요"
          description="이미 제출했다면 포인트 내역에서 결과를 확인해 주세요."
          actionLabel="포인트 내역 확인"
          onAction={() => router.replace("/benefits")}
        />
        {complete.error ? (
          <AppText color={colors.danger}>{complete.error.message}</AppText>
        ) : null}
      </Page>
    );
  if (!result && current.data?.status !== "ARRIVED")
    return <Redirect href="/mission" />;

  return (
    <Page
      key={result ? "completed" : "survey"}
      testID="complete-mission-screen"
      action={
        <Button
          label={result ? "홈으로 돌아가기" : "설문 제출하고 보상 받기"}
          loading={complete.isPending}
          onPress={() =>
            result ? router.replace("/(tabs)") : complete.mutate()
          }
        />
      }
    >
      <TopBar title={result ? "미션 완료" : "도착 · 기록"} />
      <View style={[styles.successHalo, compact && styles.successHaloCompact]}>
        <View
          style={[styles.successInner, compact && styles.successInnerCompact]}
        >
          <Check size={compact ? 36 : 44} strokeWidth={3} color={colors.ink} />
        </View>
      </View>
      <View style={styles.header}>
        <AppText variant="display" align="center">
          {result ? "오늘의 한 칸,\n완료했어요." : "목적지에\n잘 도착했어요."}
        </AppText>
        <AppText color={colors.inkMuted} align="center">
          {result
            ? "밖으로 나선 작은 걸음이 쌓였어요.\n오늘도 나를 위해 한 칸 나아갔네요."
            : `${current.data?.destination}까지 무사히 도착했어요. 지금의 기분만 가볍게 남겨주세요.`}
        </AppText>
      </View>
      {result ? (
        <>
          <Card tone="lime" style={styles.rewardCard}>
            <View style={styles.rewardHeading}>
              <View style={styles.rewardIcon}>
                <Gift size={22} color={colors.limeInk} />
              </View>
              <AppText variant="label" color={colors.limeInk}>
                이번 산책으로 받은 보상
              </AppText>
            </View>
            <AppText variant="display" align="center">
              +{result.reward?.earnedPoint ?? 0} P
            </AppText>
            <AppText variant="caption" color={colors.limeInk} align="center">
              보유 포인트{" "}
              {(result.reward?.currentTotalPoint ?? 0).toLocaleString()} P
            </AppText>
          </Card>
          {result.rhythm?.goalJustAchieved ? (
            <AppText
              variant="heading"
              align="center"
              style={{ marginTop: spacing.md }}
            >
              이번 주 목표를 달성했어요!
            </AppText>
          ) : null}
          <View style={styles.statRow}>
            <Card tone="subtle" style={styles.statCard}>
              <Flame size={21} color={colors.purpleStrong} />
              <AppText variant="heading">
                {result.rhythm?.currentWeeks ?? 0}주 연속
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                이번 주 {result.rhythm?.thisWeekCount ?? 0}/
                {result.rhythm?.weeklyGoal ?? 3}회
              </AppText>
            </Card>
            {result.ranking?.isParticipant ? (
              <Card tone="purple" style={styles.statCard}>
                <Trophy size={21} color={colors.purpleInk} />
                <AppText variant="heading" color={colors.purpleInk}>
                  {result.ranking.currentWeeklyScore ?? 0}점
                </AppText>
                <AppText variant="caption" color={colors.purpleInk}>
                  이번 획득 +{result.ranking.earnedScore ?? 0}점 · 주간{" "}
                  {result.ranking.scoredMissionCount ?? 0}/
                  {result.ranking.maxScoredMissions ?? 3}회
                </AppText>
              </Card>
            ) : null}
          </View>
          {result.newBadges?.length ? (
            <View style={styles.badges}>
              <AppText variant="heading">새로운 배지도 얻었어요</AppText>
              {result.newBadges.map((badge) => (
                <Card
                  key={badge.badgeId}
                  tone="outline"
                  style={styles.badgeRow}
                >
                  <View style={styles.badgeIcon}>
                    <Award size={25} color={colors.purpleStrong} />
                  </View>
                  <View style={styles.badgeCopy}>
                    <AppText variant="label">{badge.badgeName}</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {badge.description}
                    </AppText>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Card tone="subtle" style={styles.metrics}>
            <Metric
              value={`+${current.data?.reward ?? 0}P`}
              label="완료 시 예상 보상"
              accent={colors.purpleStrong}
            />
            <View style={styles.metricDivider} />
            <Metric value="도착 확인" label="GPS 인증 완료" />
          </Card>
          <View style={styles.ratingSection}>
            <AppText variant="heading" align="center">
              이번 외출은 어땠나요?
            </AppText>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((score) => (
                <Pressable
                  key={score}
                  accessibilityRole="button"
                  accessibilityLabel={`${score}점`}
                  accessibilityState={{
                    selected: rating === score,
                    disabled: complete.isPending,
                  }}
                  disabled={complete.isPending}
                  onPress={() => setRating(score)}
                  style={({ pressed }) => [
                    styles.starButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Star
                    size={31}
                    color={
                      score <= rating ? colors.purple : colors.borderStrong
                    }
                    fill={score <= rating ? colors.purple : colors.transparent}
                  />
                </Pressable>
              ))}
            </View>
            <AppText variant="caption" color={colors.inkMuted} align="center">
              {rating >= 4
                ? "나오기 잘한 것 같아요"
                : "오늘의 느낌을 솔직하게 남겨주세요"}
            </AppText>
          </View>
          <Card tone="purple" style={styles.surveyNote}>
            <Gift size={20} color={colors.purpleInk} />
            <AppText
              variant="caption"
              color={colors.purpleInk}
              style={styles.badgeCopy}
            >
              설문을 제출하면 미션이 완료되고 보상이 지급돼요.
            </AppText>
          </Card>
        </>
      )}
      {complete.error ? (
        <AppText
          accessibilityRole="alert"
          color={colors.danger}
          style={styles.error}
        >
          {complete.error.message}
        </AppText>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  successHalo: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: colors.limeFaint,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  successHaloCompact: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginTop: spacing.sm,
  },
  successInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  successInnerCompact: { width: 72, height: 72, borderRadius: 36 },
  header: { gap: spacing.xs, marginTop: spacing.md },
  rewardCard: { marginTop: spacing.xl, gap: spacing.xs },
  rewardHeading: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 140,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  badges: { gap: spacing.sm, marginTop: spacing.xl },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCopy: { flex: 1, gap: spacing.xxs },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    backgroundColor: colors.borderStrong,
  },
  ratingSection: { gap: spacing.sm, marginTop: spacing.xl },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  starButton: {
    width: 44,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.65 },
  surveyNote: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  error: { marginTop: spacing.md },
});
