import { Crosshair, MapPin, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import { requestMissionLocation } from "@/services/location";
import { useMissionAction } from "@/services/queries";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const start = useMissionAction(async (mission) => {
    if (mission.status === "ARRIVED") return "/mission/complete" as const;
    if (!(await requestMissionLocation()).granted)
      throw new Error("기기 설정에서 위치 권한을 허용해 주세요.");
    if (mission.status === "READY") await backend.start(Number(mission.id));
    return "/mission/active" as const;
  });
  return (
    <Page
      action={
        <Button
          label="위치 허용하고 출발하기"
          icon={Crosshair}
          loading={start.isPending}
          onPress={() =>
            start.mutate(undefined, {
              onSuccess: (path) => router.replace(path),
            })
          }
        />
      }
    >
      <TopBar title="출발 확인" />
      <View style={styles.icon}>
        <MapPin size={40} color={colors.purpleStrong} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          가볍게 나설 준비,{"\n"}이제 출발해 볼까요?
        </AppText>
        <AppText color={colors.inkMuted} align="center">
          목적지에 도착했는지 확인할 수 있도록{"\n"}기기의 위치 권한을 허용해
          주세요.
        </AppText>
      </View>
      <Card tone="purple" style={styles.card}>
        <ShieldCheck size={22} color={colors.purpleInk} />
        <View style={styles.copy}>
          <AppText variant="label" color={colors.purpleInk}>
            도착은 GPS로 확인해요
          </AppText>
          <AppText color={colors.purpleInk}>
            목적지에 도착해 버튼을 누르면 현재 위치로 도착 여부를 확인해요.
          </AppText>
        </View>
      </Card>
      {start.error ? (
        <AppText color={colors.danger}>{start.error.message}</AppText>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.purpleSoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.huge,
  },
  header: { gap: spacing.sm, marginTop: spacing.xl },
  card: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xxl },
  copy: { flex: 1, gap: spacing.xs },
});
