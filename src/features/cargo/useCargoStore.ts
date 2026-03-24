import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Result } from "@/lib/result";
import type { Cargo, CargoFormData } from "./cargoSchemas";
import * as cargoRepository from "./cargoRepository";

interface CargoState {
  cargoes: Cargo[];
  isLoading: boolean;
  error: string | null;
  draftCargo: Partial<CargoFormData> | null;
}

interface CargoActions {
  loadCargoes: () => Promise<void>;
  saveCargo: (data: CargoFormData) => Promise<Result<Cargo>>;
  updateCargo: (id: string, data: CargoFormData) => Promise<Result<Cargo>>;
  deleteCargo: (id: string) => Promise<Result<void>>;
  updateDraft: (draft: Partial<CargoFormData>) => void;
  clearDraft: () => void;
}

type CargoStore = CargoState & CargoActions;

export const useCargoStore = create<CargoStore>()(
  persist(
    (set, get) => ({
      cargoes: [],
      isLoading: false,
      error: null,
      draftCargo: null,

      loadCargoes: async () => {
        set({ isLoading: true, error: null });
        const result = await cargoRepository.getAllCargoes();
        if (result.success) {
          set({ cargoes: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      saveCargo: async (data: CargoFormData) => {
        const result = await cargoRepository.createCargo(data);
        if (result.success) {
          set({ cargoes: [result.data, ...get().cargoes] });
        }
        return result;
      },

      updateCargo: async (id: string, data: CargoFormData) => {
        const result = await cargoRepository.updateCargo(id, data);
        if (result.success) {
          set({
            cargoes: get().cargoes.map((c) =>
              c.id === id ? result.data : c
            ),
          });
        }
        return result;
      },

      deleteCargo: async (id: string) => {
        const result = await cargoRepository.deleteCargo(id);
        if (result.success) {
          set({ cargoes: get().cargoes.filter((c) => c.id !== id) });
        }
        return result;
      },

      updateDraft: (draft: Partial<CargoFormData>) => {
        set({ draftCargo: { ...get().draftCargo, ...draft } });
      },

      clearDraft: () => {
        set({ draftCargo: null });
      },
    }),
    {
      name: "cargo-draft-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ draftCargo: state.draftCargo }),
    }
  )
);

// Selectors
export function selectRealCargoes(state: CargoState): Cargo[] {
  return state.cargoes.filter((c) => !c.isDemo);
}

export function selectDemoCargoes(state: CargoState): Cargo[] {
  return state.cargoes.filter((c) => c.isDemo);
}
