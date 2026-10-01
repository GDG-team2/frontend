import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans-kr";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { createAppQueryClient } from "@/services/query-client";
import { colors } from "@/constants/theme";
import { startMocking } from "@/mocks/start";
import { getAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function SessionQueries({ children }: { children: ReactNode }) {
  const [client] = useState(createAppQueryClient);
  useEffect(() => () => client.clear(), [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  const authenticated = useAppStore((state) => state.authenticated);
  const [mocksReady, setMocksReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    Promise.all([
      startMocking(),
      (async () => {
        await useAppStore.persist.rehydrate();
        const token = await getAccessToken();
        useAppStore.getState().setAuthenticated(Boolean(token));
      })(),
    ])
      .catch((error: unknown) => {
        useAppStore.getState().setAuthenticated(false);
        console.error(
          "[Startup] Could not restore the session or start QA.",
          error,
        );
      })
      .finally(() => setMocksReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && mocksReady)
      SplashScreen.hideAsync().catch(() => undefined);
  }, [fontError, fontsLoaded, mocksReady]);

  if ((!fontsLoaded && !fontError) || !mocksReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.purple} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SessionQueries key={authenticated ? "signed-in" : "signed-out"}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: colors.canvas },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Protected guard={authenticated}>
              <Stack.Screen name="badges" />
              <Stack.Screen name="benefits" />
              <Stack.Screen name="history/[id]" />
              <Stack.Screen name="insights" />
              <Stack.Screen name="mission/active" />
              <Stack.Screen name="mission/commit" />
              <Stack.Screen name="mission/complete" />
              <Stack.Screen name="mission/conditions" />
              <Stack.Screen name="mission/details" />
              <Stack.Screen name="mission/end" />
              <Stack.Screen name="mission/gps-error" />
              <Stack.Screen name="mission/permission" />
              <Stack.Screen name="mission/sponsored" />
              <Stack.Screen name="my-missions" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="onboarding/preferences" />
              <Stack.Screen name="onboarding/profile" />
              <Stack.Screen name="onboarding/ready" />
              <Stack.Screen name="onboarding/terms" />
              <Stack.Screen name="place" />
              <Stack.Screen name="profile/edit" />
              <Stack.Screen name="qa" />
              <Stack.Screen name="ranking/settings" />
              <Stack.Screen name="ranking" />
              <Stack.Screen name="report" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/privacy" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="mission/index" />
              <Stack.Screen name="mission/schedule" />
              <Stack.Screen name="settings/index" />
            </Stack.Protected>
          </Stack>
          <StatusBar style="dark" />
        </SessionQueries>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
