import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useRouter } from "expo-router";
import { BadgePercent, BookOpen, MapPin, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Chip, MapPreview, Metric, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { mockSponsoredMission } from "@/mocks/data";

function PreviewSponsoredMissionScreen() {
  const router = useRouter();
  const mission = mockSponsoredMission;
  return (
    <Page action={<Button label="제휴 미션으로 나가기" onPress={() => router.push("/mission/commit")} />}>
      <TopBar title="제휴 미션" />
      <View style={styles.disclosure}><BadgePercent size={17} color={colors.purpleInk} /><AppText variant="label" color={colors.purpleInk}>제휴 추천</AppText><AppText variant="caption" color={colors.inkMuted}>보상 제공</AppText></View>
      <AppText variant="title">{mission.title}</AppText>
      <AppText color={colors.inkMuted} style={styles.summary}>동네 책방에 들러 오늘 마음에 남는 문장을 하나 찾아보세요. 구매는 필수가 아니에요.</AppText>
      <MapPreview variant="place" height={220} />
      <Card tone="subtle" style={styles.metrics}><Metric value="22분" label="예상 시간" /><View style={styles.divider} /><Metric value="1.1km" label="거리" /><View style={styles.divider} /><Metric value="+280P" label="제휴 보상" accent={colors.purpleStrong} /></Card>
      <Card tone="purple" style={styles.partner}><View style={styles.partnerIcon}><BookOpen size={21} color={colors.purpleInk} /></View><View style={styles.partnerCopy}><AppText variant="label" color={colors.purpleInk}>당인리 책발전소</AppText><AppText variant="caption" color={colors.purpleInk}>서울 마포구 월드컵로14길 · 오후 9시까지</AppText></View></Card>
      <View style={styles.tags}><Chip label="구매 선택" compact /><Chip label="실내" compact /><Chip label="책방" compact /></View>
      <Card tone="lime" style={styles.safety}><ShieldCheck size={19} color={colors.limeInk} /><AppText variant="caption" color={colors.limeInk} style={styles.safetyCopy}>제휴 여부는 추천 점수에 영향을 주지 않으며, 일반 미션으로 바꿀 수 있어요.</AppText></Card>
      <Button label="일반 미션 보기" variant="ghost" icon={MapPin} onPress={() => router.replace("/mission")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  disclosure: { alignSelf: "flex-start", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xxs, backgroundColor: colors.purpleSoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, marginTop: spacing.xl, marginBottom: spacing.sm },
  summary: { marginTop: spacing.xs, marginBottom: spacing.lg },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  divider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: colors.borderStrong },
  partner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, padding: spacing.md },
  partnerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  partnerCopy: { flex: 1, minWidth: 0, gap: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  safety: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm, padding: spacing.md },
  safetyCopy: { flex: 1 },
});

export default function Screen() { return USE_MSW ? <PreviewSponsoredMissionScreen /> : <UnavailableFeature title="제휴 미션" />; }
