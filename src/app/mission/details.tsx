import { useRouter } from "expo-router";
import { Clock3, MapPin, ShieldCheck, Sparkles, WalletCards } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Button, Card, MapPreview, Page, StateView, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useRecommendation } from "@/services/queries";

const details = [
  { icon: Clock3, title: "18분", label: "예상 소요 시간" },
  { icon: MapPin, title: "780m", label: "현재 위치에서" },
  { icon: WalletCards, title: "+120P", label: "완료 보상" },
];

export default function MissionDetailsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const mission = useRecommendation();
  if (mission.isLoading) return <Page><TopBar title="미션 상세" /><StateView type="loading" /></Page>;
  if (!mission.data) return <Page><TopBar title="미션 상세" /><StateView type="empty" /></Page>;
  return (
    <Page action={<Button label="이 미션으로 나가기" onPress={() => router.push("/mission/commit")} />}>
      <TopBar title="미션 상세" />
      <MapPreview height={210} />
      <View style={styles.header}>
        <AppText variant="caption" color={colors.purpleInk}>오늘의 추천</AppText>
        <AppText variant="title">{mission.data.title}</AppText>
        <AppText color={colors.inkMuted}>{mission.data.summary}</AppText>
      </View>
      <View style={[styles.details, narrow && styles.detailsNarrow]}>
        {details.map(({ icon: Icon, title, label }) => (
          <Card key={label} tone="subtle" style={[styles.detailCard, narrow && styles.detailCardNarrow]}>
            <Icon size={20} color={colors.ink} />
            <AppText variant="heading">{title}</AppText>
            <AppText variant="caption" color={colors.inkMuted}>{label}</AppText>
          </Card>
        ))}
      </View>
      <Card tone="purple" style={styles.infoCard}>
        <Sparkles size={21} color={colors.purpleInk} />
        <View style={styles.infoCopy}>
          <AppText variant="label" color={colors.purpleInk}>미션 팁</AppText>
          <AppText color={colors.purpleInk}>초록색은 간판, 식물, 소품 무엇이든 괜찮아요. 인증 사진도 필수가 아니에요.</AppText>
        </View>
      </Card>
      <Card tone="lime" style={styles.infoCard}>
        <ShieldCheck size={21} color={colors.limeInk} />
        <View style={styles.infoCopy}>
          <AppText variant="label" color={colors.limeInk}>안전 우선</AppText>
          <AppText color={colors.limeInk}>불편한 길이면 언제든 경로를 바꾸거나 종료해도 기록에 불이익이 없어요.</AppText>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  details: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xl },
  detailsNarrow: { flexDirection: "column" },
  detailCard: { flex: 1, minHeight: 124, padding: spacing.sm, gap: 5 },
  detailCardNarrow: { flex: 0, minHeight: 104 },
  infoCard: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, marginTop: spacing.sm },
  infoCopy: { flex: 1, minWidth: 0, gap: spacing.xxs },
});
