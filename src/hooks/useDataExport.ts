import { useCallback } from 'react';
import { useScraperStore } from '../store/scraperStore';
import { exportToCSV, exportToJSON, downloadData } from '../lib/exporters';
import { notifications } from '../utils/notifications';

export const useDataExport = () => {
  const jobs = useScraperStore((state) => state.jobs);

  const exportData = useCallback((format: 'csv' | 'json') => {
    try {
      const completedJobs = jobs.filter(job => job.status === 'completed');
      const allData = completedJobs.flatMap(job => job.data || []);
      
      if (allData.length === 0) {
        notifications.show('No data to export', 'error');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `scraper-data-${timestamp}.${format}`;
      const data = format === 'csv' ? exportToCSV(allData) : exportToJSON(allData);
      
      downloadData(data, filename);
      notifications.show(`Data exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      notifications.show('Failed to export data', 'error');
    }
  }, [jobs]);

  return { exportData };
};