import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, Trash2, BarChart2 } from 'lucide-react';
import { useScraperStore } from '../store/scraperStore';
import { useScraper } from '../hooks/useScraper';
import { formatDistanceToNow } from 'date-fns';
import { ExportButton } from './ExportButton';
import { ScrapeResults } from './ScrapeResults';
import { JobProgress } from './JobProgress';

export const JobList: React.FC = () => {
  const { jobs, removeJob, clearCompletedJobs } = useScraperStore();
  const { scrapeUrl, isProcessing } = useScraper();
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleStartScraping = async (jobId: string, url: string) => {
    if (!isProcessing) {
      await scrapeUrl(jobId, url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Scraping Jobs</h2>
        <div className="flex gap-2">
          <ExportButton format="csv" />
          <ExportButton format="json" />
          <button
            onClick={clearCompletedJobs}
            className="px-3 py-2 text-gray-700 hover:text-gray-900"
          >
            Clear Completed
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(job.status)}
                <div>
                  <p className="font-medium">{job.url}</p>
                  <p className="text-sm text-gray-500">
                    Started {job.startTime && formatDistanceToNow(job.startTime)} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {job.dataCollected && (
                  <span className="text-sm text-gray-600">
                    {job.dataCollected} items collected
                  </span>
                )}
                {job.status === 'pending' && !isProcessing && (
                  <button
                    onClick={() => handleStartScraping(job.id, job.url)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => removeJob(job.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {job.status === 'running' && (
              <JobProgress job={job} />
            )}

            {job.error && (
              <p className="mt-2 text-sm text-red-600">{job.error}</p>
            )}

            {job.status === 'completed' && job.data && (
              <ScrapeResults
                data={job.data}
                isExpanded={expandedJobs.has(job.id)}
                onToggle={() => toggleJobExpansion(job.id)}
              />
            )}
          </div>
        ))}
        
        {jobs.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No scraping jobs yet. Add a new URL to start scraping.
          </p>
        )}
      </div>
    </div>
  );
};