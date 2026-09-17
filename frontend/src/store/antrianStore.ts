import { create } from 'zustand';
import type { Kunjungan } from '../types/index';
import { antrianService } from '../services/api';

interface AntrianStore {
  antrian: Kunjungan[];
  loading: boolean;
  error: string | null;
  fetchAntrian: (filters?: Record<string, any>) => Promise<void>;
  updateStatus: (id: string, status: string, prioritas?: boolean) => Promise<void>;
  addAntrian: (item: Kunjungan) => void;
  updateAntrianItem: (id: string, updates: Partial<Kunjungan>) => void;
}

export const useAntrianStore = create<AntrianStore>((set, get) => ({
  antrian: [],
  loading: false,
  error: null,

  fetchAntrian: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await antrianService.list(filters);
      set({ antrian: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateStatus: async (id: string, status: string, prioritas?: boolean) => {
    try {
      await antrianService.updateStatus(id, status, prioritas);
      const { antrian } = get();
      const updated = antrian.map((item) =>
        item.id === id ? { ...item, status_antrian: status as any, prioritas: prioritas ?? item.prioritas } : item
      );
      set({ antrian: updated });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addAntrian: (item: Kunjungan) => {
    const { antrian } = get();
    set({ antrian: [item, ...antrian] });
  },

  updateAntrianItem: (id: string, updates: Partial<Kunjungan>) => {
    const { antrian } = get();
    const updated = antrian.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ antrian: updated });
  },
}));
