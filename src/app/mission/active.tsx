import { Flag, Footprints, MapPin, ShieldAlert } from "lucide-react-native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { MapLink } from "@/components/MapLink";
import { parseKoreaTime } from "@/services/time";
import { backend } from "@/services/backend";
import { getMissionCoordinates } from "@/services/location";
import { useMissionAction, useRecommendation } from "@/services/queries";

export default function ActiveMissionScreen() {
  const router = useRouter();
  const current = useRecommendation();
  const [dwellUntil, setDwellUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const arrive = useMissionAction(async (mission) => {
    if (mission.status !== "ARRIVED") {
      if (mission.status !== "IN_PROGRESS")
        throw new Error("먼저 미션을 출발해 주세요.");
      return backend.arrive(Number(mission.id), await getMissionCoordinates());
    }
    return { status: "ARRIVED", remainingDwellSeconds: 0 };
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
    ? Math.max(0, Math.floor((now - parseKoreaTime(mission.startedAt)) / 1000))
    : null;
  const elapsed =
    seconds == null || !Number.isFinite(seconds)
      ? "—"
      : `${Math.floor(seconds / 60)
          .toString()
          .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  const remaining = dwellUntil
    ? Math.max(0, Math.ceil((dwellUntil - now) / 1000))
    : 0;
  return (
    <Page
      action={
        <Button
          label={
            remaining > 0
              ? `${remaining}초 머무른 뒤 확인해요`
              : dwellUntil
                ? "현재 위치로 도착 다시 확인"
                : "도착했어요"
          }
          disabled={remaining > 0}
          icon={Flag}
          loading={arrive.isPending}
          onPress={() =>
            arrive.mutate(undefined, {
              onSuccess: (result) => {
                if (result.status === "ARRIVED")
                  router.replace("/mission/complete");
                else if (result.status === "IN_PROGRESS") {
                  setNow(Date.now());
                  setDwellUntil(
                    Date.now() + (result.remainingDwellSeconds ?? 30) * 1000,
                  );
                }
              },
              onError: () => setDwellUntil(null),
            })
          }
        />
      }
    >
      <TopBar title="산책 중" />
      <Card tone="purple" style={styles.destination}>
        <View style={styles.destinationHeading}>
          <View style={styles.pin}>
            <MapPin size={23} color={colors.purpleStrong} />
          </View>
          <View style={styles.copy}>
            <AppText variant="caption" color={colors.purpleInk}>
              오늘의 목적지
            </AppText>
            <AppText variant="heading">{mission.destination}</AppText>
          </View>
        </View>
        <AppText variant="caption" color={colors.inkMuted}>
          {mission.address}
        </AppText>
        <MapLink
          name={mission.destination}
          latitude={mission.latitude}
          longitude={mission.longitude}
          placeUrl={mission.placeUrl}
        />
      </Card>
      <View style={styles.timer}>
        <View style={styles.timerInner}>
          <Footprints size={26} color={colors.limeInk} />
          <AppText variant="display" style={styles.elapsed}>
            {elapsed}
          </AppText>
          <AppText variant="caption" color={colors.limeInk}>
            출발 후 경과 시간
          </AppText>
        </View>
      </View>
      <View style={styles.header}>
        <AppText variant="heading" align="center">
          내 속도대로, 한 걸음씩.
        </AppText>
        <AppText color={colors.inkMuted} align="center">
          목적지에 도착하면 아래 버튼을 눌러주세요.{"\n"}목적지 반경 80m 안에서
          30초 머무른 뒤 위치를 다시 확인해요.
        </AppText>
      </View>
      {dwellUntil ? (
        <Card tone="purple" style={styles.error}>
          <AppText accessibilityLiveRegion="polite">
            {remaining > 0
              ? "목적지 근처예요. 주변을 둘러보며 잠시 머물러 주세요."
              : "체류 시간이 지났어요. 아래 버튼으로 현재 위치를 다시 확인해 주세요."}
          </AppText>
        </Card>
      ) : null}
      {arrive.error ? (
        <Card tone="outline" style={styles.error}>
          <AppText accessibilityRole="alert" color={colors.danger}>
            {arrive.error.message}
          </AppText>
        </Card>
      ) : null}
      <Card
        tone="subtle"
        style={styles.safety}
        onPress={
          arrive.isPending ? undefined : () => router.push("/mission/end")
        }
        accessibilityLabel="미션 중단하기"
      >
        <ShieldAlert size={21} color={colors.inkMuted} />
        <View style={styles.copy}>
          <AppText variant="label">불편하면 여기서 쉬어가도 돼요</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            산책 중단하기
          </AppText>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  destination: { gap: spacing.sm, marginTop: spacing.lg },
  destinationHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pin: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  copy: { flex: 1, gap: spacing.xxs },
  timer: {
    width: 208,
    minHeight: 208,
    borderRadius: 104,
    backgroundColor: colors.limeFaint,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  timerInner: {
    width: 176,
    minHeight: 176,
    borderRadius: 88,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  elapsed: { fontVariant: ["tabular-nums"] },
  header: { gap: spacing.xs, marginTop: spacing.lg },
  safety: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  error: { marginTop: spacing.md },
});
