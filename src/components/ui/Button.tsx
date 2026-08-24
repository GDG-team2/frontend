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

const palette: Record<ButtonVariant, { background: string; foreground: string; border: string; iconBackground: string }> = {
  primary: { background: colors.ink, foreground: colors.white, border: colors.ink, iconBackground: "rgba(255,255,255,0.12)" },
  secondary: { background: colors.surfaceRaised, foreground: colors.ink, border: colors.border, iconBackground: colors.surfaceSubtle },
  lime: { background: colors.lime, foreground: colors.ink, border: colors.lime, iconBackground: "rgba(255,255,255,0.38)" },
  kakao: { background: colors.kakao, foreground: colors.ink, border: colors.kakao, iconBackground: "rgba(255,255,255,0.36)" },
  danger: { background: colors.dangerSoft, foreground: colors.danger, border: colors.dangerSoft, iconBackground: "rgba(255,255,255,0.44)" },
  ghost: { background: colors.transparent, foreground: colors.inkMuted, border: colors.transparent, iconBackground: colors.surfaceSubtle },
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
          opacity: disabled ? 0.45 : pressed ? 0.94 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }, { scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colorsForVariant.foreground} />
      ) : (
        <View style={styles.content}>
          {Icon ? (
            <View style={[styles.iconBadge, { backgroundColor: colorsForVariant.iconBackground }]}>
              <Icon color={colorsForVariant.foreground} size={17} strokeWidth={2.25} />
            </View>
          ) : null}
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
    minHeight: 56,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, lineHeight: 20 },
});
