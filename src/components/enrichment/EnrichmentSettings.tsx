import React from 'react';
import { Settings, Database, Key } from 'lucide-react';
import { ENRICHMENT_PROVIDERS } from '../../types/enrichment';
import { useEnrichmentStore } from '../../store/enrichmentStore';

export const EnrichmentSettings: React.FC = () => {
  const { selectedProviders, configs, updateConfig } = useEnrichmentStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-medium">Enrichment Settings</h2>
      </div>

      <div className="space-y-6">
        {ENRICHMENT_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className={`p-4 rounded-lg border-2 ${
              selectedProviders.includes(provider.id)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {provider.requiresApiKey && (
                  <Key className="h-4 w-4 text-amber-500" />
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider.id)}
                    onChange={(e) => {
                      updateConfig(provider.id, {
                        enabled: e.target.checked
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {selectedProviders.includes(provider.id) && (
              <div className="mt-4 space-y-4">
                {provider.requiresApiKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="password"
                        value={configs[provider.id]?.apiKey || ''}
                        onChange={(e) =>
                          updateConfig(provider.id, {
                            apiKey: e.target.value
                          })
                        }
                        className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter API key"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Key className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rate Limit (requests per minute)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={configs[provider.id]?.rateLimit || 60}
                    onChange={(e) =>
                      updateConfig(provider.id, {
                        rateLimit: parseInt(e.target.value)
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                {provider.id === 'peopledatalabs' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Match Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={configs[provider.id]?.minMatchScore || 0}
                      onChange={(e) =>
                        updateConfig(provider.id, {
                          minMatchScore: parseInt(e.target.value)
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
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