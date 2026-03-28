import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getSubscriptionInfo,
  FREE_LIMITS,
  type SubscriptionInfo,
} from "@/services/subscriptionService";

interface SubscriptionState {
  isPremium: boolean;
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  feasibilityRunsToday: number;
  lastFeasibilityDate: string | null;
  isLoading: boolean;
}

interface SubscriptionActions {
  loadSubscription: () => Promise<void>;
  setSubscription: (info: SubscriptionInfo) => void;
  recordFeasibilityRun: () => void;
  canRunFeasibility: () => boolean;
  canAddVessel: (currentCount: number) => boolean;
  canAddCargo: (currentCount: number) => boolean;
  canUsePdfExport: () => boolean;
  canUseDocuments: () => boolean;
  canUseCharterParty: () => boolean;
  canUsePreVoyage: () => boolean;
  canUseFreightCalc: () => boolean;
  canUseStowage: () => boolean;
  canUseImdg: () => boolean;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

const today = () => new Date().toISOString().split("T")[0];

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      isPremium: false,
      productId: null,
      expirationDate: null,
      willRenew: false,
      feasibilityRunsToday: 0,
      lastFeasibilityDate: null,
      isLoading: false,

      loadSubscription: async () => {
        set({ isLoading: true });
        try {
          const info = await getSubscriptionInfo();
          set({
            isPremium: info.isPremium,
            productId: info.productId,
            expirationDate: info.expirationDate,
            willRenew: info.willRenew,
          });
        } catch {
          // Keep existing state on error
        } finally {
          set({ isLoading: false });
        }
      },

      setSubscription: (info: SubscriptionInfo) => {
        set({
          isPremium: info.isPremium,
          productId: info.productId,
          expirationDate: info.expirationDate,
          willRenew: info.willRenew,
        });
      },

      recordFeasibilityRun: () => {
        const state = get();
        const todayStr = today();

        if (state.lastFeasibilityDate !== todayStr) {
          set({ feasibilityRunsToday: 1, lastFeasibilityDate: todayStr });
        } else {
          set({ feasibilityRunsToday: state.feasibilityRunsToday + 1 });
        }
      },

      canRunFeasibility: () => {
        const state = get();
        if (state.isPremium) return true;
        const todayStr = today();
        if (state.lastFeasibilityDate !== todayStr) return true;
        return state.feasibilityRunsToday < FREE_LIMITS.maxFeasibilityPerDay;
      },

      canAddVessel: (currentCount: number) => {
        if (get().isPremium) return true;
        return currentCount < FREE_LIMITS.maxVessels;
      },

      canAddCargo: (currentCount: number) => {
        if (get().isPremium) return true;
        return currentCount < FREE_LIMITS.maxCargoes;
      },

      canUsePdfExport: () => get().isPremium,
      canUseDocuments: () => get().isPremium,
      canUseCharterParty: () => get().isPremium,
      canUsePreVoyage: () => get().isPremium,
      canUseFreightCalc: () => get().isPremium,
      canUseStowage: () => get().isPremium,
      canUseImdg: () => get().isPremium,
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        productId: state.productId,
        expirationDate: state.expirationDate,
        willRenew: state.willRenew,
        feasibilityRunsToday: state.feasibilityRunsToday,
        lastFeasibilityDate: state.lastFeasibilityDate,
      }),
    }
  )
);
