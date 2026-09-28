import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import {
  AppText,
  Button,
  Card,
  Chip,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import { useMissionAction, useRecommendation } from "@/services/queries";

export default function CompleteMissionScreen() {
  const router = useRouter();
  const current = useRecommendation();
  const [rating, setRating] = useState(5);
  const complete = useMissionAction(async (mission) => {
    if (mission.status !== "ARRIVED")
      throw new Error("목적지 도착 확인을 먼저 해주세요.");
    return backend.complete(Number(mission.id), { afterSurveyScore: rating });
  });
  if (complete.data)
    return (
      <Page
        action={
          <Button label="홈으로" onPress={() => router.replace("/(tabs)")} />
        }
      >
        <TopBar title="미션 완료" />
        <AppText variant="title">오늘의 산책을 완료했어요.</AppText>
        <Card tone="lime">
          <AppText variant="heading">
            +{complete.data.reward?.earnedPoint ?? 0} P
          </AppText>
          <AppText>
            보유 포인트 {complete.data.reward?.currentTotalPoint ?? 0} P
          </AppText>
          <AppText>{complete.data.streak?.streakNow ?? 0}일 연속 산책</AppText>
          {complete.data.ranking?.isParticipant ? (
            <AppText>
              이번 주 랭킹 점수 {complete.data.ranking.currentWeeklyScore ?? 0}
            </AppText>
          ) : null}
        </Card>
        {complete.data.newBadges?.map((badge) => (
          <Card key={badge.badgeId}>
            <AppText>{badge.badgeName}</AppText>
            <AppText>{badge.description}</AppText>
          </Card>
        ))}
      </Page>
    );
  if (current.isLoading)
    return (
      <Page>
        <StateView type="loading" />
      </Page>
    );
  if (current.isError)
    return (
      <Page>
        <StateView type="error" onRetry={() => current.refetch()} />
      </Page>
    );
  if (!current.data)
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
  if (current.data.status !== "ARRIVED") return <Redirect href="/mission" />;
  return (
    <Page
      action={
        <Button
          label="설문 제출하고 보상 받기"
          loading={complete.isPending}
          onPress={() => complete.mutate()}
        />
      }
    >
      <TopBar title="도착 · 설문" />
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <AppText variant="title">
          {current.data.destination}에 도착했어요.
        </AppText>
        <AppText>이번 산책은 어땠나요?</AppText>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}
        >
          {[1, 2, 3, 4, 5].map((score) => (
            <Chip
              key={score}
              label={`${score}점`}
              selected={rating === score}
              onPress={() => {
                if (!complete.isPending) setRating(score);
              }}
            />
          ))}
        </View>
        <AppText color={colors.inkMuted}>
          설문을 제출하면 미션을 완료하고 보상을 정산해요.
        </AppText>
        {complete.error ? (
          <AppText color={colors.danger}>{complete.error.message}</AppText>
        ) : null}
      </View>
    </Page>
  );
}
