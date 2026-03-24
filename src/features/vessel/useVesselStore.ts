import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Result } from "@/lib/result";
import type { Vessel, VesselFormData } from "./vesselSchemas";
import * as vesselRepository from "./vesselRepository";

interface VesselState {
  vessels: Vessel[];
  isLoading: boolean;
  error: string | null;
  draftVessel: Partial<VesselFormData> | null;
}

interface VesselActions {
  loadVessels: () => Promise<void>;
  saveVessel: (data: VesselFormData) => Promise<Result<Vessel>>;
  updateVessel: (id: string, data: VesselFormData) => Promise<Result<Vessel>>;
  deleteVessel: (id: string) => Promise<Result<void>>;
  updateDraft: (draft: Partial<VesselFormData>) => void;
  clearDraft: () => void;
}

type VesselStore = VesselState & VesselActions;

export const useVesselStore = create<VesselStore>()(
  persist(
    (set, get) => ({
      vessels: [],
      isLoading: false,
      error: null,
      draftVessel: null,

      loadVessels: async () => {
        set({ isLoading: true, error: null });
        const result = await vesselRepository.getAllVessels();
        if (result.success) {
          set({ vessels: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      saveVessel: async (data: VesselFormData) => {
        const result = await vesselRepository.createVessel(data);
        if (result.success) {
          set({ vessels: [result.data, ...get().vessels] });
        }
        return result;
      },

      updateVessel: async (id: string, data: VesselFormData) => {
        const result = await vesselRepository.updateVessel(id, data);
        if (result.success) {
          set({
            vessels: get().vessels.map((v) =>
              v.id === id ? result.data : v
            ),
          });
        }
        return result;
      },

      deleteVessel: async (id: string) => {
        const result = await vesselRepository.deleteVessel(id);
        if (result.success) {
          set({ vessels: get().vessels.filter((v) => v.id !== id) });
        }
        return result;
      },

      updateDraft: (draft: Partial<VesselFormData>) => {
        set({ draftVessel: { ...get().draftVessel, ...draft } });
      },

      clearDraft: () => {
        set({ draftVessel: null });
      },
    }),
    {
      name: "vessel-draft-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ draftVessel: state.draftVessel }),
    }
  )
);

// Selectors
export function selectRealVessels(state: VesselState): Vessel[] {
  return state.vessels.filter((v) => !v.isDemo);
}

export function selectDemoVessels(state: VesselState): Vessel[] {
  return state.vessels.filter((v) => v.isDemo);
}

export function selectActiveVessels(state: VesselState): Vessel[] {
  return state.vessels.filter((v) => v.isActive && !v.isDemo);
}
