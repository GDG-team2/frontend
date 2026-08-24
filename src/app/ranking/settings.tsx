import { useRouter } from "expo-router";
import { Eye, MapPin, ShieldCheck, UserRound } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, ToggleRow, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function RankingSettingsScreen() {
  const router = useRouter();
  const optIn = useAppStore((state) => state.rankingOptIn);
  const setOptIn = useAppStore((state) => state.setRankingOptIn);
  return (
    <Page action={<Button label="저장" onPress={() => router.back()} />}>
      <TopBar title="랭킹 참여 설정" />
      <View style={styles.header}><AppText variant="title">보여줄 정보는 직접 골라요.</AppText><AppText color={colors.inkMuted}>참여하지 않아도 모든 미션과 기록 기능을 사용할 수 있어요.</AppText></View>
      <Card tone="purple" style={styles.toggleCard}><ToggleRow title="주간 랭킹 참여" description="매주 월요일 기록이 새로 시작돼요" value={optIn} onValueChange={setOptIn} icon={Eye} /></Card>
      <Card tone="subtle" style={styles.list}>
        <View style={styles.previewHeader}><ShieldCheck size={20} color={colors.success} /><AppText variant="label">공개되는 정보</AppText></View>
        <View style={styles.previewRow}><UserRound size={19} color={colors.inkMuted} /><View><AppText variant="label">닉네임</AppText><AppText variant="caption" color={colors.inkMuted}>선우</AppText></View></View>
        <View style={styles.previewRow}><MapPin size={19} color={colors.inkMuted} /><View><AppText variant="label">동네 범위</AppText><AppText variant="caption" color={colors.inkMuted}>마포구까지만</AppText></View></View>
      </Card>
      <AppText variant="caption" color={colors.inkMuted} style={styles.note}>정확한 주소, 경로, 방문 장소, 기분, 미션 내용은 공개하거나 순위 계산에 사용하지 않아요.</AppText>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  toggleCard: { marginTop: spacing.xl, paddingVertical: 0 },
  list: { gap: spacing.md, marginTop: spacing.sm },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  previewRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  note: { marginTop: spacing.md },
});
