import { Tabs } from "expo-router";
import { Clock3, Home, Map, UserRound, type LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { colors, font, layout, radius, spacing } from "@/constants/theme";

const tabs: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: "홈", icon: Home },
  map: { label: "내 지도", icon: Map },
  history: { label: "기록", icon: Clock3 },
  profile: { label: "마이", icon: UserRound },
};

type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.tabBar,
        {
          height: 72 + insets.bottom,
          paddingBottom: spacing.xs + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = tabs[route.name];
        if (!config) return null;

        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const Icon = config.icon;

        function onPress() {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        function onLongPress() {
          navigation.emit({ type: "tabLongPress", target: route.key });
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
            accessibilityState={{ selected: focused }}
            aria-selected={focused}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tabButton,
              focused && styles.tabButtonSelected,
              pressed && styles.tabButtonPressed,
            ]}
          >
            <View style={styles.iconShell}>
              <Icon color={focused ? colors.ink : colors.inkFaint} size={20} strokeWidth={focused ? 2.4 : 2} />
            </View>
            <AppText
              numberOfLines={1}
              color={focused ? colors.ink : colors.inkFaint}
              style={[styles.tabLabel, focused && styles.tabLabelSelected]}
            >
              {config.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      detachInactiveScreens
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.canvas },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="map" options={{ title: "내 지도" }} />
      <Tabs.Screen name="history" options={{ title: "기록" }} />
      <Tabs.Screen name="profile" options={{ title: "마이" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "stretch",
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xxs,
    backgroundColor: colors.surfaceRaised,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    overflow: "visible",
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    marginHorizontal: spacing.xxs,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.transparent,
    overflow: "visible",
  },
  tabButtonSelected: { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
  tabButtonPressed: { backgroundColor: colors.chip },
  iconShell: {
    width: 28,
    height: 24,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    width: "100%",
    minHeight: 16,
    flexShrink: 0,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
  },
  tabLabelSelected: { fontFamily: font.medium },
});
