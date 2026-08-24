import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, MapPin, Star } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, MapPreview, Metric, Page, StateView, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useHistoryDetail } from "@/services/queries";

export default function HistoryDetailScreen() {
  const { id = "record-01" } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const query = useHistoryDetail(id);
  if (query.isLoading) return <Page><TopBar title="외출 기록 상세" /><StateView type="loading" /></Page>;
  if (query.isError || !query.data) return <Page><TopBar title="외출 기록 상세" /><StateView type="error" onRetry={() => query.refetch()} /></Page>;
  const record = query.data;
  return (
    <Page>
      <TopBar title="외출 기록 상세" />
      <MapPreview variant="history" height={220} />
      <View style={styles.header}>
        <AppText variant="caption" color={colors.inkMuted}>{new Date(record.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</AppText>
        <AppText variant="title">{record.title}</AppText>
        <View style={styles.place}><MapPin size={15} color={colors.inkFaint} /><AppText color={colors.inkMuted}>{record.place}</AppText></View>
      </View>
      <Card tone="subtle" style={styles.metrics}>
        <Metric value={`${record.durationMin}분`} label="시간" />
        <View style={styles.divider} />
        <Metric value={`${record.distanceKm}km`} label="거리" />
        <View style={styles.divider} />
        <Metric value={`${record.rating}/5`} label="만족도" accent={colors.purpleStrong} />
      </Card>
      <Card tone="purple" style={styles.moodCard}>
        <View><AppText variant="caption" color={colors.purpleInk}>나가기 전</AppText><AppText variant="heading" color={colors.purpleInk}>{record.moodBefore}</AppText></View>
        <ArrowRight size={24} color={colors.purpleInk} />
        <View><AppText variant="caption" color={colors.purpleInk}>돌아온 뒤</AppText><AppText variant="heading" color={colors.purpleInk}>{record.moodAfter}</AppText></View>
      </Card>
      <Card tone="lime" style={styles.noteCard}>
        <Star size={20} color={colors.limeInk} />
        <View style={styles.noteCopy}><AppText variant="label" color={colors.limeInk}>이날의 메모</AppText><AppText color={colors.limeInk}>바람이 선선했고 나오길 잘했다는 생각이 들었다.</AppText></View>
      </Card>
      <Button label="이 장소 다시 보기" variant="secondary" onPress={() => router.push("/place")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, marginTop: spacing.xl },
  place: { flexDirection: "row", alignItems: "center", gap: 4 },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: spacing.xl, paddingHorizontal: spacing.xs },
  divider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: colors.borderStrong },
  moodCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: spacing.sm },
  noteCard: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm },
  noteCopy: { flex: 1, gap: 4 },
});
