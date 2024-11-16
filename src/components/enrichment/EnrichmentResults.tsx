import React from 'react';
import { Database, Check, AlertTriangle, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnrichmentResultsProps {
  results: any[];
  onExport: () => void;
}

export const EnrichmentResults: React.FC<EnrichmentResultsProps> = ({
  results,
  onExport
}) => {
  const successCount = results.filter(r => !r.error).length;
  const failureCount = results.filter(r => r.error).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-medium">Enrichment Results</h2>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Records</span>
            <span className="text-2xl font-bold">{results.length}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Successful</span>
            <span className="text-2xl font-bold text-green-600">{successCount}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Failed</span>
            <span className="text-2xl font-bold text-red-600">{failureCount}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.error
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.error ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                <span className="font-medium">Record #{index + 1}</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(result.enrichment?.enrichedAt || new Date(), {
                  addSuffix: true
                })}
              </span>
            </div>

            {result.error ? (
              <p className="text-sm text-red-600">{result.error}</p>
            ) : (
              <div className="space-y-2">
                {result.enrichment?.claimant && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Claimant Information
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Age: {result.enrichment.claimant.age}</p>
                      <p>Location: {result.enrichment.claimant.location}</p>
                      <p>
                        Employment:{' '}
                        {result.enrichment.claimant.employment_history?.length || 0}{' '}
                        records
                      </p>
                    </div>
                  </div>
                )}

                {result.enrichment?.location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Location Details
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Type: {result.enrichment.location.placeType}</p>
                      <p>
                        Coordinates:{' '}
                        {result.enrichment.location.center.join(', ')}
                      </p>
                      {result.enrichment.location.context?.city && (
                        <p>
                          City:{' '}
                          {result.enrichment.location.context.city}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {result.enrichment?.traffic && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Traffic Information
                    </h4>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>
                        Incidents:{' '}
                        {result.enrichment.traffic.length} in the area
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};