import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/constants/theme";

type ListRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  destructive?: boolean;
};

export function ListRow({ title, subtitle, value, icon: Icon, onPress, destructive }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={title}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {Icon ? <View style={styles.icon}>{<Icon size={19} color={destructive ? colors.danger : colors.ink} />}</View> : null}
      <View style={styles.copy}>
        <AppText variant="label" color={destructive ? colors.danger : colors.ink}>{title}</AppText>
        {subtitle ? <AppText variant="caption" color={colors.inkMuted}>{subtitle}</AppText> : null}
      </View>
      {value ? <AppText variant="caption" color={colors.inkMuted} style={styles.value}>{value}</AppText> : null}
      {onPress ? <ChevronRight size={19} color={colors.inkFaint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 66, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: 0.65 },
  icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 120, gap: 2 },
  value: { maxWidth: 96, flexShrink: 1, textAlign: "right" },
});
