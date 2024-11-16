import React, { useState } from 'react';
import { Clock, Users, DollarSign, TrendingUp, Calendar, AlertTriangle, Activity, Filter } from 'lucide-react';
import { formatCurrency, formatDuration } from '../../utils/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const KeyMetrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock data - replace with actual data from your backend
  const metrics = {
    activeClaims: 325,
    newLeads: 45,
    avgResponseTime: 3600000, // 1 hour in milliseconds
    avgClaimValue: 85000,
    claimsGrowth: 23,
    leadsGrowth: 15,
    responseTimeImprovement: -12,
    valueGrowth: 8,
    criticalCases: 12,
    pendingReviews: 28
  };

  const timeSeriesData = {
    day: [
      { time: '00:00', claims: 280, value: 75000 },
      { time: '04:00', claims: 290, value: 78000 },
      { time: '08:00', claims: 300, value: 80000 },
      { time: '12:00', claims: 310, value: 82000 },
      { time: '16:00', claims: 320, value: 84000 },
      { time: '20:00', claims: 325, value: 85000 }
    ],
    week: [
      { time: 'Mon', claims: 290, value: 76000 },
      { time: 'Tue', claims: 300, value: 79000 },
      { time: 'Wed', claims: 310, value: 81000 },
      { time: 'Thu', claims: 315, value: 83000 },
      { time: 'Fri', claims: 320, value: 84000 },
      { time: 'Sat', claims: 322, value: 84500 },
      { time: 'Sun', claims: 325, value: 85000 }
    ],
    month: [
      { time: 'Week 1', claims: 280, value: 74000 },
      { time: 'Week 2', claims: 295, value: 78000 },
      { time: 'Week 3', claims: 310, value: 82000 },
      { time: 'Week 4', claims: 325, value: 85000 }
    ]
  };

  const MetricCard = ({ title, value, icon: Icon, trend, alert, onClick }: any) => (
    <div
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
        selectedMetric === title ? 'ring-2 ring-indigo-500' : 'hover:shadow-lg'
      }`}
      onClick={() => onClick(title)}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${alert ? 'text-amber-500' : 'text-gray-500'}`} />
            <p className="text-sm text-gray-600">{title}</p>
          </div>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        {alert && (
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp
          className={`h-4 w-4 ${
            trend > 0 ? 'text-green-500' : 'text-red-500'
          }`}
        />
        <span
          className={`ml-2 text-sm ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend > 0 ? '+' : ''}
          {trend}% vs last {timeRange}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 rounded ${
              timeRange === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Claims"
          value={metrics.activeClaims}
          icon={Clock}
          trend={metrics.claimsGrowth}
          alert={metrics.criticalCases > 10}
          onClick={setSelectedMetric}
        />
        <MetricCard
          title="New Leads"
          value={metrics.newLeads}
          icon={Users}
          trend={metrics.leadsGrowth}
          onClick={setSelectedMetric}
        />
        <MetricCard
          title="Avg. Response Time"
          value={formatDuration(metrics.avgResponseTime)}
          icon={Activity}
          trend={metrics.responseTimeImprovement}
          alert={metrics.avgResponseTime > 7200000}
          onClick={setSelectedMetric}
        />
        <MetricCard
          title="Avg. Claim Value"
          value={formatCurrency(metrics.avgClaimValue)}
          icon={DollarSign}
          trend={metrics.valueGrowth}
          onClick={setSelectedMetric}
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-6">Claims Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="claims"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-6">Value Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData[timeRange]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#818cf8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Required Actions</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select className="text-sm border-gray-300 rounded-md">
              <option>All Priorities</option>
              <option>High Priority</option>
              <option>Medium Priority</option>
              <option>Low Priority</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Critical Cases Review</p>
                <p className="text-sm text-red-700">{metrics.criticalCases} cases need immediate attention</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Review Now
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Pending Reviews</p>
                <p className="text-sm text-amber-700">{metrics.pendingReviews} claims awaiting review</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
              Process
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};