import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, layout, shadow, spacing } from "@/constants/theme";

type PageProps = PropsWithChildren<{
  action?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  scrollProps?: ScrollViewProps;
}>;

export function Page({
  children,
  action,
  scroll = true,
  padded = true,
  backgroundColor = colors.surface,
  contentStyle,
  testID,
  scrollProps,
}: PageProps) {
  const insets = useSafeAreaInsets();
  const contentPaddingBottom = action ? layout.bottomActionHeight + insets.bottom + spacing.lg : spacing.xxl + insets.bottom;
  const sharedContentStyle = [
    styles.content,
    padded && styles.padded,
    { paddingBottom: contentPaddingBottom },
    contentStyle,
  ];

  return (
    <View style={styles.viewport} testID={testID}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor }]}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {scroll ? (
            <ScrollView
              {...scrollProps}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={sharedContentStyle}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={sharedContentStyle}>{children}</View>
          )}
          {action ? (
            <View style={[styles.action, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>{action}</View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.canvas,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: layout.maxWidth,
    overflow: "hidden",
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  action: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadow.floating,
  },
});
