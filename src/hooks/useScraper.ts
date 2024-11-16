import { useState, useCallback } from 'react';
import { useScraperStore } from '../store/scraperStore';
import { WebScraper } from '../lib/scraper';
import { notifications } from '../utils/notifications';

export const useScraper = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { config, updateJobStatus } = useScraperStore();
  const scraper = new WebScraper(config);

  const scrapeUrl = useCallback(async (jobId: string, url: string) => {
    setIsProcessing(true);
    updateJobStatus(jobId, 'running');

    try {
      const startTime = Date.now();
      const results = await scraper.scrape(url);

      const endTime = Date.now();
      updateJobStatus(jobId, 'completed', {
        data: results,
        dataCollected: results.length,
        performance: {
          requestTime: endTime - startTime,
          processingTime: endTime - startTime,
          memoryUsage: performance.memory?.usedJSHeapSize || 0,
        },
      });

      notifications.show('Scraping completed successfully', 'success');
    } catch (error) {
      updateJobStatus(jobId, 'failed', {
        error: error instanceof Error ? error.message : 'Scraping failed',
      });
      notifications.show('Failed to scrape URL', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [scraper, updateJobStatus]);

  return {
    scrapeUrl,
    isProcessing,
  };
};