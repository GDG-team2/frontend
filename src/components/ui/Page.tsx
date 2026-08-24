import { Children, isValidElement, type PropsWithChildren, type ReactNode } from "react";
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

import { colors, layout, radius, shadow, spacing } from "@/constants/theme";

type ActionMode = "docked" | "floating";

type PageProps = PropsWithChildren<{
  action?: ReactNode;
  actionHeight?: number;
  actionMode?: ActionMode;
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
  actionHeight = layout.bottomActionHeight,
  actionMode = "docked",
  scroll = true,
  padded = true,
  backgroundColor = colors.surface,
  contentStyle,
  testID,
  scrollProps,
}: PageProps) {
  const insets = useSafeAreaInsets();
  const childArray = Children.toArray(children);
  const firstChild = childArray[0];
  const firstChildType = isValidElement(firstChild) ? firstChild.type : null;
  const firstChildIsTopBar =
    typeof firstChildType === "function" &&
    (firstChildType as { displayName?: string }).displayName === "TopBar";
  const contentPaddingBottom = action
    ? actionHeight + insets.bottom + (actionMode === "docked" ? spacing.md : 0)
    : spacing.xxl + insets.bottom;
  const stickyHeaderIndices = scrollProps?.stickyHeaderIndices ?? (firstChildIsTopBar ? [0] : undefined);
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
              stickyHeaderIndices={stickyHeaderIndices}
              scrollIndicatorInsets={scrollProps?.scrollIndicatorInsets ?? { bottom: action ? actionHeight : 0 }}
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
            <View
              style={[
                styles.action,
                actionMode === "floating" ? styles.actionFloating : styles.actionDocked,
                {
                  paddingBottom:
                    actionMode === "floating"
                      ? Math.max(insets.bottom + spacing.xxs, spacing.md)
                      : Math.max(insets.bottom, spacing.sm),
                },
              ]}
            >
              {actionMode === "floating" ? <View style={styles.floatingSurface}>{action}</View> : action}
            </View>
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
    paddingHorizontal: layout.screenPadding,
    zIndex: 10,
  },
  actionDocked: {
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionFloating: {
    paddingTop: spacing.xs,
    backgroundColor: colors.transparent,
  },
  floatingSurface: {
    width: "72%",
    minWidth: 232,
    maxWidth: 280,
    alignSelf: "center",
    borderRadius: radius.round,
    backgroundColor: colors.ink,
    ...shadow.floating,
  },
});
