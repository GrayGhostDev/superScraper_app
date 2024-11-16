import { useState, useCallback } from 'react';
import { PythonScraperBridge } from '../lib/scraper/pythonBridge';
import { useScraperStore } from '../store/scraperStore';
import { notifications } from '../utils/notifications';

export const usePythonScraper = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const updateJobStatus = useScraperStore((state) => state.updateJobStatus);
  const scraper = new PythonScraperBridge();

  const processUrl = useCallback(async (jobId: string, url: string) => {
    setIsProcessing(true);
    updateJobStatus(jobId, 'running');

    try {
      // Fetch the HTML content
      const response = await fetch(url);
      const html = await response.text();

      // Process with Python scraper
      const result = await scraper.processClaim({
        html,
        targetFields: [
          'claim_id',
          'policy_number',
          'incident_date',
          'description',
          'status'
        ]
      });

      // Validate the extracted data
      const validation = await scraper.validateData(result.extracted_data);

      if (validation.is_valid) {
        updateJobStatus(jobId, 'completed', {
          data: [result.extracted_data],
          dataCollected: Object.keys(result.extracted_data).length,
          performance: {
            accuracy: result.data_quality.accuracy,
            confidence: validation.score
          }
        });
        notifications.show('Data extraction completed', 'success');
      } else {
        throw new Error(validation.errors.join(', '));
      }
    } catch (error) {
      updateJobStatus(jobId, 'failed', {
        error: error instanceof Error ? error.message : 'Failed to process data'
      });
      notifications.show('Failed to extract data', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [scraper, updateJobStatus]);

  return {
    processUrl,
    isProcessing
  };
};