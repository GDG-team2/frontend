import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useRouter } from "expo-router";
import { Bookmark, ChevronRight, MapPinned, Navigation } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Card, MapPreview, Metric, Page } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const places = [
  { title: "망원동 작은 정원", meta: "2번 방문 · 마지막 8월 23일" },
  { title: "연남동 산책길", meta: "1번 방문 · 마지막 8월 20일" },
];

function PreviewPersonalMapScreen() {
  const router = useRouter();
  return (
    <Page testID="map-screen">
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color={colors.inkMuted}>내가 걸어 만든</AppText>
          <AppText variant="title">내 지도</AppText>
        </View>
        <View style={styles.icon}><MapPinned size={22} color={colors.purpleStrong} /></View>
      </View>
      <MapPreview variant="place" height={300} />
      <Card tone="subtle" style={styles.metrics}>
        <Metric value="28" label="총 외출" />
        <View style={styles.metricDivider} />
        <Metric value="14.2km" label="걸은 거리" accent={colors.purpleStrong} />
        <View style={styles.metricDivider} />
        <Metric value="12" label="저장 장소" />
      </Card>
      <View style={styles.sectionTitle}>
        <AppText variant="heading">최근 다녀온 곳</AppText>
        <AppText variant="caption" color={colors.inkMuted}>장소를 누르면 기록을 볼 수 있어요</AppText>
      </View>
      <View style={styles.list}>
        {places.map((place, index) => (
          <Card key={place.title} tone="outline" onPress={() => router.push(index === 0 ? "/place" : "/history/record-02")} accessibilityLabel={`${place.title} 보기`} style={styles.placeCard}>
            <View style={styles.placeIcon}>{index === 0 ? <Bookmark size={19} color={colors.limeInk} /> : <Navigation size={19} color={colors.purpleInk} />}</View>
            <View style={styles.placeCopy}>
              <AppText variant="label">{place.title}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>{place.meta}</AppText>
            </View>
            <ChevronRight size={20} color={colors.inkFaint} />
          </Card>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center" },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: colors.borderStrong },
  sectionTitle: { gap: 2, marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  placeCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  placeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.limeSoft, alignItems: "center", justifyContent: "center" },
  placeCopy: { flex: 1, gap: 2 },
});

export default function Screen() { return USE_MSW ? <PreviewPersonalMapScreen /> : <UnavailableFeature title="내 지도" />; }
