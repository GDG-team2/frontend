import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserSettingsUpdateRequest } from "@/types/api";

import type { MockScenario } from "@/types/domain";

type AppState = {
  settings: UserSettingsUpdateRequest;
  saveSettings: (value: UserSettingsUpdateRequest) => void;
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
  settings: {} as UserSettingsUpdateRequest,
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
      saveSettings: (value) =>
        set((state) => ({
          settings: { ...state.settings, ...value },
          rankingOptIn: value.rankingSetting ?? state.rankingOptIn,
          notificationsEnabled: value.allAlarm ?? state.notificationsEnabled,
        })),
      setAuthenticated: (authenticated) => set({ authenticated }),
      completeOnboarding: () =>
        set({ onboardingComplete: true, authenticated: true }),
      setLocationGranted: (locationGranted) => set({ locationGranted }),
      setActiveMissionId: (activeMissionId) => set({ activeMissionId }),
      setQaScenario: (qaScenario) => set({ qaScenario }),
      setRankingOptIn: (rankingOptIn) => set({ rankingOptIn }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      reset: () => set(initialState),
    }),
    {
      name: "ohakkom-app-state",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        onboardingComplete: state.onboardingComplete,
        locationGranted: state.locationGranted,
        qaScenario: state.qaScenario,
        rankingOptIn: state.rankingOptIn,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
