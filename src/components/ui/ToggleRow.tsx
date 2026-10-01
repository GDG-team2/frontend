import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/constants/theme";

type ToggleRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: LucideIcon;
  disabled?: boolean;
};

export function ToggleRow({
  title,
  description,
  value,
  onValueChange,
  icon: Icon,
  disabled,
}: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value, disabled }}
      aria-checked={value}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {Icon ? (
        <View style={styles.icon}>
          <Icon size={19} color={colors.ink} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <AppText variant="label">{title}</AppText>
        {description ? (
          <AppText variant="caption" color={colors.inkMuted}>
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSubtle,
  },
  copy: { flex: 1, gap: 2 },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: colors.borderStrong,
  },
  trackOn: { backgroundColor: colors.ink },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  thumbOn: { transform: [{ translateX: 20 }] },
});
