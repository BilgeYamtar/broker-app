import { create } from "zustand";
import type { Result } from "@/lib/result";
import type { FeasibilityResult } from "./feasibilitySchemas";
import * as feasibilityRepository from "./feasibilityRepository";

interface FeasibilityState {
  results: FeasibilityResult[];
  isLoading: boolean;
  error: string | null;
}

interface FeasibilityActions {
  loadResults: () => Promise<void>;
  loadByVesselId: (vesselId: string) => Promise<void>;
  loadByCargoId: (cargoId: string) => Promise<void>;
  saveResult: (
    data: Omit<FeasibilityResult, "id" | "createdAt">
  ) => Promise<Result<FeasibilityResult>>;
}

type FeasibilityStore = FeasibilityState & FeasibilityActions;

export const useFeasibilityStore = create<FeasibilityStore>()((set, get) => ({
  results: [],
  isLoading: false,
  error: null,

  loadResults: async () => {
    set({ isLoading: true, error: null });
    const result = await feasibilityRepository.getAll();
    if (result.success) {
      set({ results: result.data, isLoading: false });
    } else {
      set({ error: result.error, isLoading: false });
    }
  },

  loadByVesselId: async (vesselId: string) => {
    set({ isLoading: true, error: null });
    const result = await feasibilityRepository.getByVesselId(vesselId);
    if (result.success) {
      set({ results: result.data, isLoading: false });
    } else {
      set({ error: result.error, isLoading: false });
    }
  },

  loadByCargoId: async (cargoId: string) => {
    set({ isLoading: true, error: null });
    const result = await feasibilityRepository.getByCargoId(cargoId);
    if (result.success) {
      set({ results: result.data, isLoading: false });
    } else {
      set({ error: result.error, isLoading: false });
    }
  },

  saveResult: async (data) => {
    const result = await feasibilityRepository.create(data);
    if (result.success) {
      set({ results: [result.data, ...get().results] });
    }
    return result;
  },
}));

// Selectors
export function selectRealResults(
  state: FeasibilityState
): FeasibilityResult[] {
  return state.results.filter((r) => !r.isDemo);
}

export function selectDemoResults(
  state: FeasibilityState
): FeasibilityResult[] {
  return state.results.filter((r) => r.isDemo);
}
