import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const days = [
  { label: "월", value: 34 },
  { label: "화", value: 62 },
  { label: "수", value: 18 },
  { label: "목", value: 76 },
  { label: "금", value: 48 },
  { label: "토", value: 88 },
  { label: "일", value: 52 },
];

export function WeeklyBars() {
  return (
    <View style={styles.chart} accessible accessibilityLabel="요일별 외출 에너지 차트, 토요일이 가장 높아요">
      {days.map((day) => (
        <View key={day.label} style={styles.column}>
          <View style={styles.track}><View style={[styles.bar, { height: `${day.value}%` }]} /></View>
          <AppText variant="caption" color={colors.inkMuted}>{day.label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { height: 178, flexDirection: "row", alignItems: "flex-end", gap: spacing.xs },
  column: { flex: 1, alignItems: "center", gap: spacing.xs },
  track: { width: "100%", height: 138, borderRadius: 10, overflow: "hidden", backgroundColor: colors.surfaceSubtle, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 10, backgroundColor: colors.purple },
});
