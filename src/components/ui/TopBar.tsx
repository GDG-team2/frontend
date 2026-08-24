import { useRouter } from "expo-router";
import { ArrowLeft, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, layout, spacing } from "@/constants/theme";

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  rightIcon?: LucideIcon;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function TopBar({ title, showBack = true, rightIcon: RightIcon, rightLabel, onRightPress }: TopBarProps) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={8} onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft color={colors.ink} size={23} />
          </Pressable>
        ) : null}
      </View>
      <AppText variant="label" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <View style={[styles.side, styles.right]}>
        {onRightPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? title ?? "메뉴"}
            hitSlop={8}
            onPress={onRightPress}
            style={styles.iconButton}
          >
            {RightIcon ? <RightIcon color={colors.ink} size={21} /> : <AppText variant="label">{rightLabel}</AppText>}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 56,
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 72, alignItems: "flex-start" },
  right: { alignItems: "flex-end" },
  iconButton: { minWidth: layout.minTouch, minHeight: layout.minTouch, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" },
});
