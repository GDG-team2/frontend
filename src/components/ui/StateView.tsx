import { AlertCircle, Inbox, RotateCcw } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { colors, spacing } from "@/constants/theme";

type StateViewProps = {
  type: "loading" | "error" | "empty";
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ type, title, description, onRetry, actionLabel, onAction }: StateViewProps) {
  const Icon = type === "error" ? AlertCircle : Inbox;
  const defaultTitle = type === "loading" ? "준비하고 있어요" : type === "error" ? "잠시 연결이 고르지 않아요" : "아직 기록이 없어요";
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {type === "loading" ? (
        <ActivityIndicator size="large" color={colors.purple} />
      ) : (
        <View style={styles.iconWrap}>
          <Icon color={type === "error" ? colors.danger : colors.inkMuted} size={27} />
        </View>
      )}
      <AppText variant="heading" align="center">
        {title ?? defaultTitle}
      </AppText>
      {description ? (
        <AppText color={colors.inkMuted} align="center">
          {description}
        </AppText>
      ) : null}
      {onRetry ? <Button label="다시 시도" variant="secondary" icon={RotateCcw} onPress={onRetry} style={styles.button} /> : null}
      {onAction && actionLabel ? <Button label={actionLabel} variant="primary" onPress={onAction} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 360, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.xl },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSubtle },
  button: { marginTop: spacing.xs, maxWidth: 220 },
});
