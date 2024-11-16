import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InjurySeverity } from '../../types/claims';
import { formatCurrency } from '../../utils/formatters';

interface InjuryStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  averageResolutionTime: number;
  severityDistribution: Record<InjurySeverity, number>;
  trend: {
    date: string;
    cases: number;
    severity: number;
  }[];
}

export const InjuryTracking: React.FC = () => {
  const [stats, setStats] = useState<InjuryStats>({
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    averageResolutionTime: 0,
    severityDistribution: {
      [InjurySeverity.MINOR]: 0,
      [InjurySeverity.MODERATE]: 0,
      [InjurySeverity.SEVERE]: 0,
      [InjurySeverity.CRITICAL]: 0,
    },
    trend: []
  });

  useEffect(() => {
    // Simulate fetching injury tracking data
    const mockData: InjuryStats = {
      totalCases: 245,
      activeCases: 128,
      resolvedCases: 117,
      averageResolutionTime: 45,
      severityDistribution: {
        [InjurySeverity.MINOR]: 98,
        [InjurySeverity.MODERATE]: 82,
        [InjurySeverity.SEVERE]: 45,
        [InjurySeverity.CRITICAL]: 20,
      },
      trend: generateTrendData()
    };

    setStats(mockData);
  }, []);

  const generateTrendData = () => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return dates.map(date => ({
      date,
      cases: Math.floor(Math.random() * 50) + 100,
      severity: Math.random() * 4
    }));
  };

  const getSeverityColor = (severity: InjurySeverity): string => {
    switch (severity) {
      case InjurySeverity.CRITICAL:
        return 'text-red-600 bg-red-100';
      case InjurySeverity.SEVERE:
        return 'text-orange-600 bg-orange-100';
      case InjurySeverity.MODERATE:
        return 'text-yellow-600 bg-yellow-100';
      case InjurySeverity.MINOR:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Injury Tracking</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Last updated:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Total Cases</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-600">Active Cases</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <p className="text-sm text-gray-600">Resolved Cases</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.resolvedCases}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-gray-600">Avg. Resolution Time</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageResolutionTime} days</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Injury Trend Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cases"
                  stroke="#6366f1"
                  name="Cases"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="severity"
                  stroke="#ef4444"
                  name="Avg. Severity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Severity Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.severityDistribution).map(([severity, count]) => (
              <div
                key={severity}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-full ${getSeverityColor(severity as InjurySeverity)}`}>
                    <span className="text-sm font-medium">
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{count} cases</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${getSeverityColor(severity as InjurySeverity).split(' ')[0].replace('text', 'bg')}`}
                      style={{ width: `${(count / stats.totalCases) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round((count / stats.totalCases) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};