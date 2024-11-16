import React from 'react';
import { ClaimData } from '../../../types/claims';
import { formatCurrency } from '../../../utils/formatters';

interface OutlierTableProps {
  claims: ClaimData[];
  onInvestigate: (claim: ClaimData) => void;
}

export const OutlierTable: React.FC<OutlierTableProps> = ({ claims, onInvestigate }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Claim ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Processing Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Complexity Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {claims.map((claim) => (
            <tr key={claim.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {claim.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(claim.value)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {claim.processingTime.toFixed(1)} days
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full"
                      style={{ width: `${(claim.complexity / 5) * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {claim.complexity.toFixed(1)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => onInvestigate(claim)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Investigate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};