import { Award, Footprints, Leaf, MapPinned, Sparkles, Sunrise } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const badges = [
  { title: "첫 한 칸", description: "첫 미션 완료", icon: Footprints, earned: true, tone: colors.lime },
  { title: "동네 탐험가", description: "새 장소 10곳", icon: MapPinned, earned: true, tone: colors.purpleSoft },
  { title: "아침 공기", description: "오전 외출 5번", icon: Sunrise, earned: false, tone: colors.surfaceSubtle },
  { title: "초록 수집가", description: "자연 미션 8번", icon: Leaf, earned: false, tone: colors.surfaceSubtle },
  { title: "연속 네 걸음", description: "4일 연속 외출", icon: Sparkles, earned: true, tone: colors.limeSoft },
  { title: "나만의 길", description: "누적 20km", icon: Award, earned: false, tone: colors.surfaceSubtle },
];

export default function BadgesScreen() {
  const { width } = useWindowDimensions();
  const narrow = width < 360;

  return (
    <Page>
      <TopBar title="배지와 업적" />
      <Card tone="lime" style={styles.summary}><Award size={29} color={colors.limeInk} /><View style={styles.summaryCopy}><AppText variant="title" color={colors.limeInk}>12개 중 5개</AppText><AppText color={colors.limeInk}>서두르지 않아도 하나씩 쌓여요.</AppText></View></Card>
      <View style={styles.grid}>
        {badges.map(({ title, description, icon: Icon, earned, tone }) => (
          <Card key={title} tone="outline" style={[styles.badgeCard, narrow && styles.badgeCardNarrow, !earned && styles.locked]}>
            <View style={[styles.badgeIcon, { backgroundColor: tone }]}><Icon size={26} color={earned ? colors.ink : colors.inkFaint} /></View>
            <AppText variant="label" align="center" color={earned ? colors.ink : colors.inkMuted}>{title}</AppText>
            <AppText variant="caption" align="center" color={colors.inkFaint}>{description}</AppText>
          </Card>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.lg },
  summaryCopy: { flex: 1, minWidth: 0, gap: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xl },
  badgeCard: { width: "48%", minHeight: 168, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.md },
  badgeCardNarrow: { width: "100%", minHeight: 148 },
  badgeIcon: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  locked: { opacity: 0.62 },
});
