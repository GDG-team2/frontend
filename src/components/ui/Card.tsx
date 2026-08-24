import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/constants/theme";

type CardProps = PropsWithChildren<{
  tone?: "default" | "subtle" | "lime" | "purple" | "outline";
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}>;

const tones = {
  default: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
  subtle: { backgroundColor: colors.surfaceSubtle, borderColor: colors.transparent },
  lime: { backgroundColor: colors.limeSoft, borderColor: colors.transparent },
  purple: { backgroundColor: colors.purpleSoft, borderColor: colors.transparent },
  outline: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
};

export function Card({ children, tone = "default", style, onPress, accessibilityLabel }: CardProps) {
  const cardStyle = [styles.card, tones[tone], style];
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
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.94, transform: [{ translateY: 1 }, { scale: 0.992 }] },
});
