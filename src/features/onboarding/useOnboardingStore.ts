import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingState {
  hasSeeded: boolean;
  hasCompletedOnboarding: boolean;
}

interface OnboardingActions {
  markSeeded: () => void;
  completeOnboarding: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasSeeded: false,
      hasCompletedOnboarding: false,

      markSeeded: () => {
        set({ hasSeeded: true });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
