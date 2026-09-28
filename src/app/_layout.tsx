import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans-kr";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { startMocking } from "@/mocks/start";
import { getAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

function SessionGuard() {
  const authenticated = useAppStore((state) => state.authenticated);
  const router = useRouter();
  const segments = useSegments();
  const navigation = useRootNavigationState();
  useEffect(() => {
    if (!navigation?.key) return;
    if (!authenticated) {
      queryClient.clear();
      if (segments.length) router.replace("/");
    }
  }, [authenticated, navigation?.key, router, segments]);
  return null;
}

export default function RootLayout() {
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
        console.error("[Startup] Could not restore the session or start QA.", error);
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
        <QueryClientProvider client={queryClient}>
          <SessionGuard />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
          <StatusBar style="dark" />
        </QueryClientProvider>
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
