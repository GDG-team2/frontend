import { useRouter } from "expo-router";
import { LocateFixed, MapPinOff, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, MapPreview, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function GpsErrorScreen() {
  const router = useRouter();
  return (
    <Page actionHeight={130} action={<View style={styles.actions}><Button label="위치 다시 확인" icon={LocateFixed} onPress={() => router.replace("/mission/complete")} /><Button label="직접 도착 처리" variant="secondary" onPress={() => router.replace("/mission/complete")} /></View>}>
      <TopBar title="도착 확인" />
      <MapPreview height={230} />
      <View style={styles.icon}><MapPinOff size={30} color={colors.danger} /></View>
      <View style={styles.header}><AppText variant="title" align="center">도착 위치를 정확히 잡지 못했어요.</AppText><AppText color={colors.inkMuted} align="center">건물이나 골목 안에서는 GPS가 잠시 튈 수 있어요. 기록은 사라지지 않았어요.</AppText></View>
      <Card tone="lime" style={styles.card}><ShieldCheck size={20} color={colors.limeInk} /><View style={styles.cardCopy}><AppText variant="label" color={colors.limeInk}>현재 기록은 안전하게 보관 중</AppText><AppText variant="caption" color={colors.limeInk}>18분 · 0.8km 이동 기록을 그대로 완료할 수 있어요.</AppText></View></Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.xs },
  icon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.dangerSoft, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: spacing.xl },
  header: { gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.sm },
  card: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  cardCopy: { flex: 1, gap: 2 },
});
