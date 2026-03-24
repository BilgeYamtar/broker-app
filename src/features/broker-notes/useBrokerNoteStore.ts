import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Result } from "@/lib/result";
import type { BrokerNote, BrokerNoteFormData } from "./brokerNoteSchemas";
import * as brokerNoteRepository from "./brokerNoteRepository";

interface BrokerNoteState {
  notes: BrokerNote[];
  isLoading: boolean;
  error: string | null;
  draftNote: Partial<BrokerNoteFormData> | null;
}

interface BrokerNoteActions {
  loadNotes: () => Promise<void>;
  loadByVesselId: (vesselId: string) => Promise<void>;
  saveNote: (data: BrokerNoteFormData) => Promise<Result<BrokerNote>>;
  updateNote: (
    id: string,
    data: BrokerNoteFormData
  ) => Promise<Result<BrokerNote>>;
  deleteNote: (id: string) => Promise<Result<void>>;
  updateDraft: (draft: Partial<BrokerNoteFormData>) => void;
  clearDraft: () => void;
}

type BrokerNoteStore = BrokerNoteState & BrokerNoteActions;

export const useBrokerNoteStore = create<BrokerNoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      draftNote: null,

      loadNotes: async () => {
        set({ isLoading: true, error: null });
        const result = await brokerNoteRepository.getAllBrokerNotes();
        if (result.success) {
          set({ notes: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      loadByVesselId: async (vesselId: string) => {
        set({ isLoading: true, error: null });
        const result = await brokerNoteRepository.getByVesselId(vesselId);
        if (result.success) {
          set({ notes: result.data, isLoading: false });
        } else {
          set({ error: result.error, isLoading: false });
        }
      },

      saveNote: async (data: BrokerNoteFormData) => {
        const result = await brokerNoteRepository.createBrokerNote(data);
        if (result.success) {
          set({ notes: [result.data, ...get().notes] });
        }
        return result;
      },

      updateNote: async (id: string, data: BrokerNoteFormData) => {
        const result = await brokerNoteRepository.updateBrokerNote(id, data);
        if (result.success) {
          set({
            notes: get().notes.map((n) =>
              n.id === id ? result.data : n
            ),
          });
        }
        return result;
      },

      deleteNote: async (id: string) => {
        const result = await brokerNoteRepository.deleteBrokerNote(id);
        if (result.success) {
          set({ notes: get().notes.filter((n) => n.id !== id) });
        }
        return result;
      },

      updateDraft: (draft: Partial<BrokerNoteFormData>) => {
        set({ draftNote: { ...get().draftNote, ...draft } });
      },

      clearDraft: () => {
        set({ draftNote: null });
      },
    }),
    {
      name: "broker-note-draft-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ draftNote: state.draftNote }),
    }
  )
);

// Selectors
export function selectRealNotes(state: BrokerNoteState): BrokerNote[] {
  return state.notes.filter((n) => !n.isDemo);
}

export function selectDemoNotes(state: BrokerNoteState): BrokerNote[] {
  return state.notes.filter((n) => n.isDemo);
}

export function selectNotesByVesselId(
  vesselId: string
): (state: BrokerNoteState) => BrokerNote[] {
  return (state) => state.notes.filter((n) => n.vesselId === vesselId);
}
