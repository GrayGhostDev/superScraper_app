import React from 'react';
import { PDLRecord } from '../../../types/pdl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Brain, TrendingUp, Activity } from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';

interface DataVisualizationsProps {
  data: PDLRecord[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DataVisualizations: React.FC<DataVisualizationsProps> = ({ data }) => {
  const { trends, isAnalyzing } = useAnalytics(data);

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

  const industryData = data.reduce((acc: Record<string, number>, record) => {
    if (record.industry) {
      acc[record.industry] = (acc[record.industry] || 0) + 1;
    }
    return acc;
  }, {});

  const locationData = data.reduce((acc: Record<string, number>, record) => {
    if (record.location_name) {
      acc[record.location_name] = (acc[record.location_name] || 0) + 1;
    }
    return acc;
  }, {});

  const matchScoreDistribution = data.reduce((acc: Record<string, number>, record) => {
    const scoreRange = Math.floor(record.match_score / 20) * 20;
    const rangeKey = `${scoreRange}-${scoreRange + 19}`;
    acc[rangeKey] = (acc[rangeKey] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Industry Distribution */}
      <div>
        <h3 className="text-lg font-medium mb-4">Industry Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(industryData).map(([name, value]) => ({
                  name,
                  value
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {Object.entries(industryData).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Distribution */}
      <div>
        <h3 className="text-lg font-medium mb-4">Location Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(locationData)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Match Score Distribution */}
      <div>
        <h3 className="text-lg font-medium mb-4">Match Score Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={Object.entries(matchScoreDistribution).map(([range, count]) => ({
                range,
                count
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Analysis */}
      {trends && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium">Trends Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trends.insights.map((insight, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                  {insight.type === 'pattern' && <Activity className="h-4 w-4 text-green-500" />}
                  <span className="text-sm font-medium text-gray-900">{insight.title}</span>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
                {insight.value && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-indigo-600">{insight.value}</span>
                    {insight.change && (
                      <span className={`ml-2 ${insight.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Temporal Analysis */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Temporal Analysis</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.temporal.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};