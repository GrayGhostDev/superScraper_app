import React from 'react';
import { Download } from 'lucide-react';
import { useScraperStore } from '../store/scraperStore';
import { exportToCSV, exportToJSON, downloadData } from '../lib/exporters';

interface ExportButtonProps {
  format: 'csv' | 'json';
}

export const ExportButton: React.FC<ExportButtonProps> = ({ format }) => {
  const jobs = useScraperStore((state) => state.jobs);
  
  const handleExport = () => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const allData = completedJobs.flatMap(job => job.data || []);
    
    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = format === 'csv' ? exportToCSV(allData) : exportToJSON(allData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadData(exportData, `scraper-data-${timestamp}.${format}`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      <Download className="h-4 w-4" />
      Export {format.toUpperCase()}
    </button>
  );
};