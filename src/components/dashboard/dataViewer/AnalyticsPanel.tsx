import React from 'react';
import { Brain, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsPanelProps {
  data: any[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data }) => {
  const { trends, isAnalyzing, error } = useAnalytics(data);

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <span className="text-gray-600">Analyzing data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!trends) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-medium text-gray-700">Data Quality</h3>
          </div>
          <p className="text-2xl font-bold">{(trends.quality.score * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Based on {trends.quality.metrics.length} metrics
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-700">Growth Rate</h3>
          </div>
          <p className="text-2xl font-bold">
            {trends.growth > 0 ? '+' : ''}{(trends.growth * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Compared to previous period
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700">Activity Score</h3>
          </div>
          <p className="text-2xl font-bold">{(trends.activity.score * 100).toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Based on {trends.activity.metrics.length} factors
          </p>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Trend Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Pattern Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trends.patterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-medium text-gray-900">{pattern.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{pattern.description}</p>
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{(pattern.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{ width: `${pattern.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Correlation Analysis</h3>
        <div className="space-y-4">
          {trends.correlations.map((correlation, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {correlation.variables.join(' vs ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      correlation.coefficient > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(correlation.coefficient) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {(correlation.coefficient * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};