import React from 'react';
import { Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMetrics } from '../hooks/useMetrics';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const DataVisualizations: React.FC = () => {
  const metrics = useMetrics();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Data Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.successRate)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-600">Data Quality Score</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.dataQuality.score)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <p className="text-sm text-gray-600">Total Data Points</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.totalDataCollected.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Data Collection Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="url"
                    tickFormatter={(value) => new URL(value).hostname}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => new URL(label).hostname}
                  />
                  <Line
                    type="monotone"
                    dataKey="items"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Processing Time Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="url"
                    tickFormatter={(value) => new URL(value).hostname}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${(value / 1000).toFixed(2)}s`}
                    labelFormatter={(label) => new URL(label).hostname}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Data Quality Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Metadata Coverage</span>
                    <span className="text-sm font-medium">
                      {metrics.dataQuality.withMetadata} pages
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(metrics.dataQuality.withMetadata / metrics.totalDataCollected) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Structured Data</span>
                    <span className="text-sm font-medium">
                      {metrics.dataQuality.withSchema} pages
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(metrics.dataQuality.withSchema / metrics.totalDataCollected) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Links per Page</span>
                    <span className="text-sm font-medium">
                      {Math.round(metrics.dataQuality.avgLinksPerPage)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Average Processing Time</span>
                    <span className="text-sm font-medium">
                      {(metrics.averageJobTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((metrics.averageJobTime / 10000) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(metrics.successRate)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${metrics.successRate}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};