import { useRouter } from "expo-router";
import { Clock3, Flag, Heart, MapPin, Navigation, Phone, Star } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Chip, ListRow, MapPreview, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function PlaceScreen() {
  const router = useRouter();
  return (
    <Page action={<Button label="이곳으로 미션 시작" icon={Navigation} onPress={() => router.push("/mission/commit")} />}>
      <TopBar title="장소 정보" rightIcon={Heart} onRightPress={() => undefined} />
      <MapPreview variant="place" height={210} />
      <View style={styles.header}>
        <AppText variant="title">망원동 작은 정원</AppText>
        <View style={styles.rating}><Star size={16} color={colors.purple} fill={colors.purple} /><AppText variant="label">4.8</AppText><AppText variant="caption" color={colors.inkMuted}>외출 기록 24개</AppText></View>
        <AppText color={colors.inkMuted}>주택가 사이에 숨은 작은 공개 정원. 벤치가 있고 저녁에도 비교적 조용해요.</AppText>
        <View style={styles.chips}><Chip label="조용한" compact /><Chip label="야외" compact /><Chip label="혼자" compact /></View>
      </View>
      <Card tone="subtle" style={styles.infoList}>
        <ListRow title="서울 마포구 포은로 6길" subtitle="현재 위치에서 780m" icon={MapPin} />
        <ListRow title="상시 개방" subtitle="늦은 밤에는 소음을 조심해 주세요" icon={Clock3} />
        <ListRow title="전화번호 없음" subtitle="공개 공간" icon={Phone} />
      </Card>
      <Card tone="purple" style={styles.tipCard}>
        <AppText variant="label" color={colors.purpleInk}>오하꼼 이용자 팁</AppText>
        <AppText color={colors.purpleInk}>해 질 무렵 빛이 예쁘고, 골목 입구 경사가 조금 있어요.</AppText>
      </Card>
      <Button label="장소 정보 신고" icon={Flag} variant="ghost" onPress={() => router.push("/report")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  rating: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  infoList: { marginTop: spacing.xl, paddingVertical: 0 },
  tipCard: { gap: spacing.xs, marginTop: spacing.sm },
});
