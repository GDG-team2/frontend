import { View } from "react-native";
import { AppText } from "./ui";
import { colors, spacing } from "@/constants/theme";
import { ApiError } from "@/services/http-client";

export function RequestError({ error }: { error?: Error | null }) {
  if (!error) return null;
  const details =
    error instanceof ApiError && error.code === "INVALID_INPUT"
      ? Object.values(error.details ?? {}).filter(
          (v): v is string => typeof v === "string",
        )
      : [];
  return (
    <View
      accessibilityRole="alert"
      style={{ gap: spacing.xxs, marginVertical: spacing.sm }}
    >
      <AppText color={colors.danger}>{error.message}</AppText>
      {details.map((message, i) => (
        <AppText key={i} variant="caption" color={colors.danger}>
          {message}
        </AppText>
      ))}
    </View>
  );
}
