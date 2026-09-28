import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, View } from "react-native";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import { getMissionCoordinates } from "@/services/location";
import { useMissionAction, useRecommendation } from "@/services/queries";

export default function ActiveMissionScreen() {
  const router = useRouter();
  const current = useRecommendation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const arrive = useMissionAction(async (mission) => {
    if (mission.status !== "ARRIVED") {
      if (mission.status !== "IN_PROGRESS")
        throw new Error("먼저 미션을 출발해 주세요.");
      await backend.arrive(Number(mission.id), await getMissionCoordinates());
    }
  });
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
  const mission = current.data;
  if (!mission || mission.status === "READY")
    return <Redirect href="/mission" />;
  if (mission.status === "ARRIVED")
    return <Redirect href="/mission/complete" />;
  const seconds = mission.startedAt
    ? Math.max(0, Math.floor((now - Date.parse(mission.startedAt)) / 1000))
    : null;
  const elapsed =
    seconds == null || !Number.isFinite(seconds)
      ? "—"
      : `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
  return (
    <Page
      action={
        <Button
          label="도착했어요"
          loading={arrive.isPending}
          onPress={() =>
            arrive.mutate(undefined, {
              onSuccess: () => router.replace("/mission/complete"),
            })
          }
        />
      }
    >
      <TopBar title="산책 중" />
      <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
        <AppText variant="title">{mission.destination}</AppText>
        <AppText>{mission.address}</AppText>
        <Card tone="lime">
          <AppText variant="heading">{elapsed}</AppText>
          <AppText>출발 후 경과 시간</AppText>
        </Card>
        <Button
          label="지도에서 목적지 보기"
          variant="secondary"
          onPress={() =>
            void Linking.openURL(
              `https://map.kakao.com/link/map/${encodeURIComponent(mission.destination)},${mission.latitude},${mission.longitude}`,
            )
          }
        />
        <AppText color={colors.inkMuted}>
          목적지에 도착한 뒤 눌러주세요. 현재 GPS 위치로 도착 여부를 확인해요.
        </AppText>
        {arrive.error ? (
          <AppText color={colors.danger}>{arrive.error.message}</AppText>
        ) : null}
        <Button
          label="미션 중단하기"
          variant="secondary"
          disabled={arrive.isPending}
          onPress={() => router.push("/mission/end")}
        />
      </View>
    </Page>
  );
}
