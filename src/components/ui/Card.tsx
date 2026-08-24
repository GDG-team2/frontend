import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, shadow, spacing } from "@/constants/theme";

type CardProps = PropsWithChildren<{
  tone?: "default" | "subtle" | "lime" | "purple" | "outline";
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}>;

const tones = {
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  subtle: { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceSubtle },
  lime: { backgroundColor: colors.limeSoft, borderColor: colors.limeSoft },
  purple: { backgroundColor: colors.purpleSoft, borderColor: colors.purpleSoft },
  outline: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
};

export function Card({ children, tone = "default", style, onPress, accessibilityLabel }: CardProps) {
  const cardStyle = [styles.card, tones[tone], tone === "default" && shadow.card, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
});
