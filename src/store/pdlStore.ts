import { create } from 'zustand';
import { PDLRecord, PDLSearchParams, DEFAULT_SEARCH_PARAMS } from '../types/pdl';
import { pdlService } from '../lib/services/pdlService';
import { notifications } from '../utils/notifications';

interface PDLState {
  data: PDLRecord[];
  searchParams: PDLSearchParams;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  updateSearchParams: (params: Partial<PDLSearchParams>) => void;
  rateLimits?: {
    remaining: {
      minute?: number;
      day?: number;
      month?: number;
    };
    total?: number;
  };
}

export const usePDLStore = create<PDLState>((set, get) => ({
  data: [],
  searchParams: DEFAULT_SEARCH_PARAMS,
  isLoading: false,
  error: null,
  rateLimits: undefined,

  fetchData: async () => {
    const { searchParams } = get();
    set({ isLoading: true, error: null });

    try {
      const results = await pdlService.searchPeople(searchParams);
      
      // Filter results based on minimum match score
      const filteredResults = results.filter(
        record => record.match_score >= searchParams.minMatchScore
      );

      set({ 
        data: filteredResults,
        isLoading: false,
        error: null
      });
      
      if (filteredResults.length === 0) {
        notifications.show('No results found', 'info');
      } else {
        notifications.show(`Found ${filteredResults.length} results`, 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data';
      set({
        error: message,
        isLoading: false,
        data: []
      });
      notifications.show(message, 'error');
    }
  },

  updateSearchParams: (params) => {
    set((state) => ({
      searchParams: { ...state.searchParams, ...params }
    }));
  }
}));