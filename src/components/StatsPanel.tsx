import React from 'react';
import { BarChart3, Clock, Activity } from 'lucide-react';
import { useScraperStore } from '../store/scraperStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../utils/formatters';

export const StatsPanel: React.FC = () => {
  const stats = useScraperStore((state) => state.getStats());
  const jobs = useScraperStore((state) => state.jobs);

  // Prepare data for charts
  const statusData = [
    { name: 'Completed', value: stats.completedJobs },
    { name: 'Failed', value: stats.failedJobs },
    { name: 'Pending', value: stats.totalJobs - stats.completedJobs - stats.failedJobs },
  ];

  const performanceData = jobs
    .filter((job) => job.status === 'completed' && job.startTime && job.endTime)
    .map((job) => ({
      url: new URL(job.url).hostname,
      time: job.endTime!.getTime() - job.startTime!.getTime(),
      items: job.dataCollected || 0,
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Analytics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalJobs > 0
              ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
              : 0}
            %
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Avg. Time</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatDuration(stats.averageJobTime)}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Job Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {performanceData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Performance by Domain</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="url" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatDuration(value)}
                    labelFormatter={(label: string) => `Domain: ${label}`}
                  />
                  <Bar
                    dataKey="time"
                    fill="#818cf8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Data Quality</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Structured Data</span>
            <span className="font-medium">
              {jobs.filter((job) => job.data?.[0]?.schema).length} pages
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">With Metadata</span>
            <span className="font-medium">
              {jobs.filter((job) => job.data?.[0]?.metadata).length} pages
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average Links/Page</span>
            <span className="font-medium">
              {Math.round(
                jobs.reduce(
                  (acc, job) => acc + (job.data?.[0]?.links?.length || 0),
                  0
                ) / (jobs.length || 1)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};