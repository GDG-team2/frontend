import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { MockScenario } from "@/types/domain";

type AppState = {
  authenticated: boolean;
  onboardingComplete: boolean;
  locationGranted: boolean;
  activeMissionId: string | null;
  qaScenario: MockScenario;
  rankingOptIn: boolean;
  notificationsEnabled: boolean;
  setAuthenticated: (value: boolean) => void;
  completeOnboarding: () => void;
  setLocationGranted: (value: boolean) => void;
  setActiveMissionId: (value: string | null) => void;
  setQaScenario: (value: MockScenario) => void;
  setRankingOptIn: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  authenticated: false,
  onboardingComplete: false,
  locationGranted: false,
  activeMissionId: null as string | null,
  qaScenario: "success" as MockScenario,
  rankingOptIn: false,
  notificationsEnabled: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuthenticated: (authenticated) => set({ authenticated }),
      completeOnboarding: () => set({ onboardingComplete: true, authenticated: true }),
      setLocationGranted: (locationGranted) => set({ locationGranted }),
      setActiveMissionId: (activeMissionId) => set({ activeMissionId }),
      setQaScenario: (qaScenario) => set({ qaScenario }),
      setRankingOptIn: (rankingOptIn) => set({ rankingOptIn }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      reset: () => set(initialState),
    }),
    {
      name: "ohakkom-app-state",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authenticated: state.authenticated,
        onboardingComplete: state.onboardingComplete,
        locationGranted: state.locationGranted,
        qaScenario: state.qaScenario,
        rankingOptIn: state.rankingOptIn,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
