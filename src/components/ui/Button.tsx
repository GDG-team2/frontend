import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "lime" | "kakao" | "danger" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const palette: Record<ButtonVariant, { background: string; foreground: string; border: string }> = {
  primary: { background: colors.ink, foreground: colors.white, border: colors.ink },
  secondary: { background: colors.surface, foreground: colors.ink, border: colors.borderStrong },
  lime: { background: colors.lime, foreground: colors.ink, border: colors.lime },
  kakao: { background: colors.kakao, foreground: colors.ink, border: colors.kakao },
  danger: { background: colors.dangerSoft, foreground: colors.danger, border: colors.dangerSoft },
  ghost: { background: colors.transparent, foreground: colors.inkMuted, border: colors.transparent },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon: Icon,
  disabled,
  loading,
  style,
  accessibilityHint,
}: ButtonProps) {
  const colorsForVariant = palette[variant];

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled || loading}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colorsForVariant.background,
          borderColor: colorsForVariant.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colorsForVariant.foreground} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon color={colorsForVariant.foreground} size={19} strokeWidth={2.2} /> : null}
          <AppText variant="label" color={colorsForVariant.foreground} style={styles.label}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  label: {
    fontSize: 15,
  },
});
