import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  disclaimerAcknowledged: boolean;
}

interface SettingsActions {
  acknowledgeDisclaimer: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      disclaimerAcknowledged: false,

      acknowledgeDisclaimer: () => {
        set({ disclaimerAcknowledged: true });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
