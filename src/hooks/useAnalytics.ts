import { useEffect, useState } from 'react';
import { analyticsService } from '../lib/services/analyticsService';
import { notifications } from '../utils/notifications';

export const useAnalytics = (data: any[]) => {
  const [trends, setTrends] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeData = async () => {
      if (!data.length) return;

      setIsAnalyzing(true);
      setError(null);
      try {
        const initialized = await analyticsService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize analytics service');
        }

        const results = await analyticsService.analyzeTrends(data);
        setTrends(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        setError(message);
        notifications.show(message, 'error');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [data]);

  return {
    trends,
    isAnalyzing,
    error
  };
};