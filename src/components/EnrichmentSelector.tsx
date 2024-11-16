import React from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { ENRICHMENT_PROVIDERS } from '../types/enrichment';

interface EnrichmentSelectorProps {
  selectedProviders: string[];
  onSelectProvider: (providerId: string) => void;
}

export const EnrichmentSelector: React.FC<EnrichmentSelectorProps> = ({
  selectedProviders,
  onSelectProvider,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">Data Enrichment</h2>
      </div>

      <div className="space-y-4">
        {ENRICHMENT_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              id={provider.id}
              checked={selectedProviders.includes(provider.id)}
              onChange={() => onSelectProvider(provider.id)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label
                htmlFor={provider.id}
                className="block text-sm font-medium text-gray-900"
              >
                {provider.name}
              </label>
              <p className="text-sm text-gray-500">{provider.description}</p>
              {provider.requiresApiKey && !selectedProviders.includes(provider.id) && (
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Requires API key configuration
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedProviders.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected providers will be used to enrich scraped data with additional
            information.
          </p>
        </div>
      )}
    </div>
  );
};