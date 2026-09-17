import { create } from 'zustand';
import type { Antropometri } from '../types/index';
import { antropometriService } from '../services/api';

interface AntropolopoStore {
  measurements: Antropometri[];
  loading: boolean;
  error: string | null;
  fetchHistory: (pasien_id: string) => Promise<void>;
  inputMeasurement: (data: any) => Promise<void>;
  fetchReport: (filters?: Record<string, any>) => Promise<any>;
}

export const useAntropolopoStore = create<AntropolopoStore>((set) => ({
  measurements: [],
  loading: false,
  error: null,

  fetchHistory: async (pasien_id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await antropometriService.history(pasien_id);
      set({ measurements: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  inputMeasurement: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const result = await antropometriService.create(data);
      set((state) => ({
        measurements: [result, ...state.measurements],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchReport: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await antropometriService.report(filters);
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
