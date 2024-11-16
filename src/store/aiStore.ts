import { create } from 'zustand';
import { AI_PROVIDERS } from '../types/ai';

interface AIState {
  selectedProvider: string | null;
  config: {
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
  setSelectedProvider: (provider: string | null) => void;
  updateConfig: (config: Partial<AIState['config']>) => void;
}

export const useAIStore = create<AIState>((set) => ({
  selectedProvider: null,
  config: {
    temperature: 0.7,
    maxTokens: 2048
  },
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  updateConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  }))
}));