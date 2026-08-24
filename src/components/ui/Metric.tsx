import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/constants/theme";

export function Metric({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="heading" color={accent ?? colors.ink}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.inkMuted}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, alignItems: "center", gap: spacing.xxs },
});
