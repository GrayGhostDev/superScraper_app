import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CLAIM_TYPES = ['Auto Accident', 'Personal Injury', 'Property Damage', 'Medical', 'Other'];
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ClaimsAnalysis: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const claimTypeData = [
    { name: 'Auto Accident', value: 35 },
    { name: 'Personal Injury', value: 25 },
    { name: 'Property Damage', value: 20 },
    { name: 'Medical', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const trendData = [
    { month: 'Jan', claims: 45, value: 125000 },
    { month: 'Feb', claims: 52, value: 145000 },
    { month: 'Mar', claims: 48, value: 135000 },
    { month: 'Apr', claims: 70, value: 195000 },
    { month: 'May', claims: 65, value: 180000 },
    { month: 'Jun', claims: 85, value: 230000 },
  ];

  const highPriorityClaims = [
    { id: 'CL-2024-001', type: 'Auto Accident', value: 75000, severity: 'High' },
    { id: 'CL-2024-002', type: 'Personal Injury', value: 95000, severity: 'Critical' },
    { id: 'CL-2024-003', type: 'Medical', value: 65000, severity: 'High' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Claims Trend Analysis</h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">
              +23% vs last month
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="claims" fill="#4F46E5" name="Claims" />
              <Bar yAxisId="right" dataKey="value" fill="#10B981" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Claim Type Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={claimTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {claimTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {claimTypeData.map((type, index) => (
            <div key={type.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-gray-600">{type.name}</span>
              </div>
              <span className="text-sm font-medium">{type.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">High Priority Claims</h2>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highPriorityClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(claim.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        claim.severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {claim.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};