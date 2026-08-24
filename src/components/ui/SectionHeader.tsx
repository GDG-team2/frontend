import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/constants/theme";

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="heading">{title}</AppText>
      {description ? <AppText color={colors.inkMuted}>{description}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.xxs } });
