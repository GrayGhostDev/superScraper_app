import { useEffect, useState } from 'react';
import { pdlService } from '../lib/services/pdlService';
import { PDLRecord, PDLSearchParams } from '../types/pdl';
import { notifications } from '../utils/notifications';

export const usePDLData = (initialParams?: Partial<PDLSearchParams>) => {
  const [data, setData] = useState<PDLRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<PDLSearchParams>({
    minMatchScore: 0,
    limit: 10,
    ...initialParams
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await pdlService.searchPeople(searchParams);
      setData(results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      notifications.show(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const updateSearchParams = (newParams: Partial<PDLSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  return {
    data,
    isLoading,
    error,
    searchParams,
    updateSearchParams,
    refreshData: fetchData
  };
};