import { useRouter } from "expo-router";
import { Crosshair, MapPin, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { requestMissionLocation } from "@/services/location";
import { useAppStore } from "@/store/app-store";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);
  const setLocationGranted = useAppStore((state) => state.setLocationGranted);

  async function request() {
    setLoading(true);
    const result = await requestMissionLocation();
    setLoading(false);
    if (!result.granted) return setDenied(true);
    setLocationGranted(true);
    router.replace("/mission/active");
  }

  function qaBypass() {
    setLocationGranted(true);
    router.replace("/mission/active");
  }

  return (
    <Page actionHeight={130} action={<View style={styles.actions}><Button label="현재 위치 허용하기" icon={Crosshair} loading={loading} onPress={request} /><Button label="QA 위치로 계속" variant="secondary" onPress={qaBypass} /></View>}>
      <TopBar title="위치 권한" />
      <View style={styles.icon}><MapPin size={40} color={colors.purpleStrong} /></View>
      <View style={styles.header}>
        <AppText variant="title" align="center">출발하는 동안만 위치가 필요해요.</AppText>
        <AppText color={colors.inkMuted} align="center">목적지까지 남은 거리와 도착 여부를 안내하는 데 사용해요.</AppText>
      </View>
      <Card tone="purple" style={styles.card}>
        <ShieldCheck size={22} color={colors.purpleInk} />
        <View style={styles.cardCopy}>
          <AppText variant="label" color={colors.purpleInk}>경로 원본은 서버에 영구 저장하지 않아요</AppText>
          <AppText color={colors.purpleInk}>완료 뒤에는 거리·시간·방문 장소만 기록하고, 설정에서 삭제할 수 있어요.</AppText>
        </View>
      </Card>
      {denied ? (
        <Card tone="outline" style={styles.deniedCard}>
          <AppText variant="label" color={colors.danger}>권한이 꺼져 있어요</AppText>
          <AppText color={colors.inkMuted}>기기 설정에서 허용하거나 QA 위치로 흐름을 확인해 주세요.</AppText>
        </Card>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.xs },
  icon: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.purpleSoft, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: spacing.huge },
  header: { gap: spacing.sm, marginTop: spacing.xl, paddingHorizontal: spacing.sm },
  card: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xxl },
  cardCopy: { flex: 1, gap: spacing.xxs },
  deniedCard: { gap: spacing.xxs, marginTop: spacing.sm, borderColor: colors.danger },
});
