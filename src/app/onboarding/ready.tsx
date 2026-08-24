import { useRouter } from "expo-router";
import { Check, MapPinned, ShieldCheck, WandSparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function ReadyScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  function start() {
    completeOnboarding();
    router.replace("/(tabs)");
  }
  return (
    <Page action={<Button label="첫 미션 만나기" icon={WandSparkles} onPress={start} />}>
      <TopBar title="시작 준비" />
      <View style={styles.heroIcon}>
        <Check size={38} strokeWidth={3} color={colors.ink} />
      </View>
      <AppText variant="display" align="center">준비됐어요.{"\n"}오늘은 한 칸만 나가요.</AppText>
      <AppText color={colors.inkMuted} align="center" style={styles.description}>오하꼼이 컨디션과 동네를 보고 하나의 미션만 골라드릴게요.</AppText>
      <View style={styles.cards}>
        <Card tone="lime" style={styles.summaryCard}>
          <MapPinned size={22} color={colors.limeInk} />
          <View style={styles.cardCopy}>
            <AppText variant="label" color={colors.limeInk}>서울 마포구 · 약 20분</AppText>
            <AppText variant="caption" color={colors.limeInk}>조용한 골목과 찾기 미션을 선호해요.</AppText>
          </View>
        </Card>
        <Card tone="purple" style={styles.summaryCard}>
          <ShieldCheck size={22} color={colors.purpleInk} />
          <View style={styles.cardCopy}>
            <AppText variant="label" color={colors.purpleInk}>위치는 필요할 때만</AppText>
            <AppText variant="caption" color={colors.purpleInk}>첫 출발 버튼을 누른 뒤 권한을 여쭤볼게요.</AppText>
          </View>
        </Card>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  heroIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.lime, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: spacing.huge, marginBottom: spacing.xl },
  description: { marginTop: spacing.md, paddingHorizontal: spacing.md },
  cards: { gap: spacing.sm, marginTop: spacing.xxl },
  summaryCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg },
  cardCopy: { flex: 1, gap: 2 },
});
