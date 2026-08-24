import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const values = [0, 1, 0, 2, 0, 1, 3, 0, 0, 2, 1, 0, 0, 3, 2, 0, 1, 2, 0, 0, 3, 1, 0, 2, 3, 0, 1, 0];
const fills = [colors.chip, colors.limeFaint, colors.lime, colors.limeIcon];

export function Heatmap() {
  return (
    <View style={styles.wrap} accessible accessibilityLabel="최근 4주 외출 활동, 총 12일">
      <View style={styles.grid}>{values.map((value, index) => <View key={index} style={[styles.cell, { backgroundColor: fills[value] }]} />)}</View>
      <View style={styles.legend}>
        <AppText variant="caption" color={colors.inkMuted}>적게</AppText>
        {fills.map((fill) => <View key={fill} style={[styles.legendCell, { backgroundColor: fill }]} />)}
        <AppText variant="caption" color={colors.inkMuted}>자주</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: { width: 28, height: 28, borderRadius: 6 },
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});
