import { CalendarClock, Check, Clock3, MoreHorizontal } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Button, Card, Chip, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const missions = [
  { title: "망원 골목에서 초록색 찾기", date: "오늘 오후 6:30", status: "예정" },
  { title: "한강에서 둥근 돌 찾기", date: "8월 23일 · 31분", status: "완료" },
  { title: "노란 간판 세 개 사진 찍기", date: "8월 17일 · 17분", status: "완료" },
];

export default function MyMissionsScreen() {
  return (
    <Page>
      <TopBar title="내 미션" rightIcon={CalendarClock} onRightPress={() => undefined} />
      <Card tone="lime" style={styles.next}><View style={styles.nextTop}><Chip label="다음 미션" compact selected /><Pressable accessibilityRole="button" accessibilityLabel="미션 메뉴" style={styles.more}><MoreHorizontal size={20} color={colors.ink} /></Pressable></View><AppText variant="title">{missions[0].title}</AppText><View style={styles.meta}><Clock3 size={16} color={colors.limeInk} /><AppText color={colors.limeInk}>{missions[0].date}</AppText></View><Button label="미션 자세히" variant="secondary" onPress={() => undefined} /></Card>
      <View style={styles.header}><AppText variant="heading">지난 미션</AppText><AppText variant="caption" color={colors.inkMuted}>완료한 한 칸들이에요.</AppText></View>
      <View style={styles.list}>{missions.slice(1).map((mission) => <Card key={mission.title} tone="outline" style={styles.row}><View style={styles.check}><Check size={17} color={colors.success} /></View><View style={styles.copy}><AppText variant="label">{mission.title}</AppText><AppText variant="caption" color={colors.inkMuted}>{mission.date}</AppText></View><Chip label={mission.status} compact /></Card>)}</View>
    </Page>
  );
}

const styles = StyleSheet.create({
  next: { gap: spacing.sm, marginTop: spacing.lg },
  nextTop: { flexDirection: "row", justifyContent: "space-between" },
  more: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginTop: -8 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  header: { gap: 2, marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  check: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 2 },
});
