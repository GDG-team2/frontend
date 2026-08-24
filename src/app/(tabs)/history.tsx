import { useRouter } from "expo-router";
import { ArrowUpRight, ChevronRight, MapPin } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Card, Page, StateView } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useHistory } from "@/services/queries";

export default function HistoryScreen() {
  const router = useRouter();
  const history = useHistory();

  if (history.isLoading) return <Page><StateView type="loading" description="외출 기록을 모으고 있어요." /></Page>;
  if (history.isError) return <Page><StateView type="error" description="기록을 불러오지 못했어요." onRetry={() => history.refetch()} /></Page>;
  if (!history.data?.length) return <Page><StateView type="empty" title="첫 외출을 기다리고 있어요" description="작은 미션 하나를 완료하면 여기에 기록돼요." actionLabel="미션 받기" onAction={() => router.push("/mission")} /></Page>;

  return (
    <Page testID="history-screen">
      <View style={styles.header}>
        <AppText variant="title">외출 기록</AppText>
        <AppText color={colors.inkMuted}>얼마나 멀리보다, 나갔다는 사실을 기록해요.</AppText>
      </View>
      <Card tone="purple" style={styles.summary}>
        <View>
          <AppText variant="caption" color={colors.purpleInk}>8월의 변화</AppText>
          <AppText variant="title" color={colors.purpleInk}>7번의 외출</AppText>
        </View>
        <View style={styles.changeBadge}>
          <ArrowUpRight size={17} color={colors.success} />
          <AppText variant="caption" color={colors.success}>지난달보다 2번 더</AppText>
        </View>
      </Card>
      <View style={styles.list}>
        {history.data.map((record) => (
          <Card key={record.id} onPress={() => router.push(`/history/${record.id}`)} accessibilityLabel={`${record.title} 기록 보기`} style={styles.recordCard}>
            <View style={styles.dateBox}>
              <AppText variant="caption" color={colors.inkMuted}>{new Date(record.date).toLocaleDateString("ko-KR", { month: "short" })}</AppText>
              <AppText variant="heading">{new Date(record.date).getDate()}</AppText>
            </View>
            <View style={styles.recordCopy}>
              <AppText variant="label">{record.title}</AppText>
              <View style={styles.metaRow}>
                <MapPin size={13} color={colors.inkFaint} />
                <AppText variant="caption" color={colors.inkMuted}>{record.place} · {record.durationMin}분</AppText>
              </View>
            </View>
            <ChevronRight size={20} color={colors.inkFaint} />
          </Card>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xxs, paddingTop: spacing.md, paddingBottom: spacing.xl },
  summary: { gap: spacing.md, marginBottom: spacing.xl },
  changeBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.successSoft },
  list: { gap: spacing.sm },
  recordCard: { padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dateBox: { width: 48, height: 54, borderRadius: 12, backgroundColor: colors.limeSoft, alignItems: "center", justifyContent: "center" },
  recordCopy: { flex: 1, gap: 5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
});
