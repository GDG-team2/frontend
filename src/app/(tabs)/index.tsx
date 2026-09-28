import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText, Button, Card, Page, StateView } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { USE_MSW } from "@/constants/api";
import { useMe, useRecommendation } from "@/services/queries";
export default function HomeScreen() {
  const router = useRouter();
  const me = useMe();
  const current = useRecommendation();
  if (me.isLoading)
    return (
      <Page>
        <StateView type="loading" />
      </Page>
    );
  if (me.isError)
    return (
      <Page>
        <StateView
          type="error"
          description={me.error.message}
          onRetry={() => me.refetch()}
        />
      </Page>
    );
  if (!me.data)
    return (
      <Page>
        <StateView type="empty" />
      </Page>
    );
  const user = me.data;
  const mission = current.data;
  return (
    <Page
      testID="home-screen"
      actionMode="floating"
      action={
        <Button
          label={mission ? "현재 미션 이어하기" : "오늘 미션 받기"}
          onPress={() => router.push("/mission")}
        />
      }
    >
      <View style={styles.header}>
        <AppText variant="heading">안녕하세요, {user.nickname}님</AppText>
        <AppText>{user.district}</AppText>
      </View>
      <Card tone="lime" style={styles.card}>
        <AppText variant="title">
          결정할 힘이 없어도,{"\n"}나갈 수 있게.
        </AppText>
        <AppText>현재 위치에서 가까운 산책 목적지를 하나만 제안해요.</AppText>
        <AppText variant="heading">
          {user.streak}일 연속 · 총 {user.totalOutings}번 완료
        </AppText>
      </Card>
      {current.isError ? (
        <StateView
          type="error"
          title="현재 미션을 확인하지 못했어요"
          onRetry={() => current.refetch()}
        />
      ) : mission ? (
        <Card
          tone="purple"
          style={styles.card}
          onPress={() => router.push("/mission")}
        >
          <AppText variant="heading">{mission.destination}</AppText>
          <AppText>
            {mission.status === "ARRIVED"
              ? "도착 확인 완료 · 설문을 남겨주세요"
              : mission.status === "IN_PROGRESS"
                ? "진행 중인 산책"
                : "출발을 기다리는 미션"}
          </AppText>
        </Card>
      ) : null}
      <Card style={styles.card} onPress={() => router.push("/benefits")}>
        <AppText>보유 포인트</AppText>
        <AppText variant="title">{user.points.toLocaleString()} P</AppText>
      </Card>
      <View style={styles.card}>
        <Button
          label="배지와 업적"
          variant="secondary"
          onPress={() => router.push("/badges")}
        />
        <Button
          label="우리 동네 랭킹"
          variant="secondary"
          onPress={() => router.push("/ranking")}
        />
        {USE_MSW ? (
          <Button
            label="QA 시나리오"
            variant="secondary"
            onPress={() => router.push("/qa")}
          />
        ) : null}
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginVertical: spacing.lg },
  card: { gap: spacing.md, marginBottom: spacing.md },
});
