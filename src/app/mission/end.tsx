import { useRouter } from "expo-router";
import { Home, RotateCcw, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function EndMissionScreen() {
  const router = useRouter();
  return (
    <Page>
      <TopBar title="미션 종료" />
      <View style={styles.icon}><ShieldCheck size={38} color={colors.success} /></View>
      <View style={styles.header}>
        <AppText variant="title" align="center">여기서 멈춰도 충분해요.</AppText>
        <AppText color={colors.inkMuted} align="center">7분 동안 350m를 걸었어요. 중간 기록도 오늘의 외출로 남길 수 있어요.</AppText>
      </View>
      <Card tone="lime" style={styles.card}>
        <AppText variant="heading" color={colors.limeInk}>오늘 이미 해낸 것</AppText>
        <AppText color={colors.limeInk}>집 밖으로 나왔고 · 새로운 골목을 걸었고 · 스스로 멈출 시점을 골랐어요.</AppText>
      </Card>
      <View style={styles.actions}>
        <Button label="잠깐 쉬고 계속" icon={RotateCcw} onPress={() => router.back()} />
        <Button label="여기까지 기록하고 홈으로" icon={Home} variant="secondary" onPress={() => router.replace("/(tabs)")} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  icon: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.successSoft, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: spacing.huge },
  header: { gap: spacing.sm, marginTop: spacing.xl, paddingHorizontal: spacing.sm },
  card: { gap: spacing.xs, marginTop: spacing.xxl },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
