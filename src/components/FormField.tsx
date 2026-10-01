import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./ui";
import { colors, font, radius, spacing } from "@/constants/theme";

export function FormField({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.inkFaint}
        style={styles.input}
        {...props}
      />
      {hint ? (
        <AppText variant="caption" color={colors.inkMuted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
});
