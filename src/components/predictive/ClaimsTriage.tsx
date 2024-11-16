import React, { useState } from 'react';
import { AlertTriangle, ArrowUp, ArrowDown, Filter, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface Claim {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  value: number;
  risk: number;
  priority: number;
  status: string;
  submittedAt: Date;
}

export const ClaimsTriage: React.FC = () => {
  const [claims] = useState<Claim[]>(generateMockClaims());
  const [sortField, setSortField] = useState<keyof Claim>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<string>('all');

  const sortClaims = (a: Claim, b: Claim) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    const aString = String(aValue);
    const bString = String(bValue);
    return sortDirection === 'asc' 
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  };

  const filteredClaims = claims
    .filter(claim => filter === 'all' || claim.severity === filter)
    .sort(sortClaims);

  const handleSort = (field: keyof Claim) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Claims Triage</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  Claim ID
                  {sortField === 'id' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {sortField === 'type' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('severity')}
              >
                <div className="flex items-center gap-1">
                  Severity
                  {sortField === 'severity' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-1">
                  Value
                  {sortField === 'value' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('risk')}
              >
                <div className="flex items-center gap-1">
                  Risk Score
                  {sortField === 'risk' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('submittedAt')}
              >
                <div className="flex items-center gap-1">
                  Submitted
                  {sortField === 'submittedAt' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClaims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {claim.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {claim.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(claim.severity)}`}>
                    {claim.severity.charAt(0).toUpperCase() + claim.severity.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(claim.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          claim.risk >= 0.7 ? 'bg-red-500' :
                          claim.risk >= 0.4 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${claim.risk * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {Math.round(claim.risk * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {claim.submittedAt.toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function generateMockClaims(): Claim[] {
  const types = ['Auto Accident', 'Personal Injury', 'Property Damage', 'Medical', 'Liability'];
  const statuses = ['Pending', 'In Review', 'Approved', 'Denied'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `CL-${String(2024000 + i).padStart(6, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    value: Math.floor(Math.random() * 100000) + 5000,
    risk: Math.random(),
    priority: Math.random(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    submittedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  }));
}