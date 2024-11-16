import React from 'react';
import { ScrapeJob } from '../types/scraper';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDuration } from '../utils/formatters';

interface JobProgressProps {
  job: ScrapeJob;
}

export const JobProgress: React.FC<JobProgressProps> = ({ job }) => {
  const progress = job.dataCollected ? Math.min((job.dataCollected / 100) * 100, 100) : 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-600">Processing...</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {job.performance && (
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span>Processing Time: </span>
            <span className="font-medium">
              {formatDuration(job.performance.processingTime)}
            </span>
          </div>
          <div>
            <span>Memory Usage: </span>
            <span className="font-medium">
              {Math.round(job.performance.memoryUsage / 1024 / 1024)}MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};