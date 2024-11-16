import { create } from 'zustand';
import { EnrichmentConfig } from '../types/enrichment';

interface EnrichmentState {
  selectedProviders: string[];
  configs: Record<string, EnrichmentConfig>;
  addProvider: (providerId: string) => void;
  removeProvider: (providerId: string) => void;
  updateConfig: (providerId: string, config: Partial<EnrichmentConfig>) => void;
}

export const useEnrichmentStore = create<EnrichmentState>((set) => ({
  selectedProviders: [],
  configs: {},
  addProvider: (providerId) =>
    set((state) => ({
      selectedProviders: [...state.selectedProviders, providerId],
      configs: {
        ...state.configs,
        [providerId]: { enabled: true }
      }
    })),
  removeProvider: (providerId) =>
    set((state) => ({
      selectedProviders: state.selectedProviders.filter(id => id !== providerId),
      configs: {
        ...state.configs,
        [providerId]: { ...state.configs[providerId], enabled: false }
      }
    })),
  updateConfig: (providerId, config) =>
    set((state) => ({
      configs: {
        ...state.configs,
        [providerId]: {
          ...state.configs[providerId],
          ...config
        }
      }
    }))
}));