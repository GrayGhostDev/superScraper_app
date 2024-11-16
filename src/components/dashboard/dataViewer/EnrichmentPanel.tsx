import React, { useState } from 'react';
import { Database, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { enrichmentService } from '../../../lib/services/enrichmentService';
import { notifications } from '../../../utils/notifications';

interface EnrichmentPanelProps {
  data: any[];
  onDataEnriched: (enrichedData: any[]) => void;
}

export const EnrichmentPanel: React.FC<EnrichmentPanelProps> = ({
  data,
  onDataEnriched
}) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);

  const handleEnrichData = async () => {
    setIsEnriching(true);
    setEnrichmentProgress(0);

    try {
      const totalItems = data.length;
      const enrichedResults = [];

      for (let i = 0; i < totalItems; i++) {
        const enrichedData = await enrichmentService.enrichClaimData(data[i]);
        enrichedResults.push({
          ...data[i],
          enrichment: enrichedData
        });

        setEnrichmentProgress(((i + 1) / totalItems) * 100);
      }

      onDataEnriched(enrichedResults);
      notifications.show('Data enrichment completed', 'success');
    } catch (error) {
      notifications.show('Failed to enrich data', 'error');
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium">Data Enrichment</h3>
        </div>
        <button
          onClick={handleEnrichData}
          disabled={isEnriching}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isEnriching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Enriching...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Enrich Data
            </>
          )}
        </button>
      </div>

      {isEnriching && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Enrichment Progress</span>
            <span>{Math.round(enrichmentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${enrichmentProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Record #{index + 1}
              </span>
              {item.enrichment ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="space-y-1">
              {item.enrichment ? (
                <>
                  <p className="text-xs text-gray-500">
                    Enriched with {Object.keys(item.enrichment).length} data points
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600">
                      Last updated:{' '}
                      {new Date(item.enrichment.enrichedAt).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">Pending enrichment</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};