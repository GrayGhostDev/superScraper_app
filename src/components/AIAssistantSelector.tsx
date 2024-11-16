import React, { useState } from 'react';
import { Brain, Key, AlertCircle, Check, Settings, Loader2 } from 'lucide-react';
import { AI_PROVIDERS } from '../types/ai';
import { useAIStore } from '../store/aiStore';
import { notifications } from '../utils/notifications';

export const AIAssistantSelector: React.FC = () => {
  const { selectedProvider, setSelectedProvider, config, updateConfig } = useAIStore();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleProviderSelect = async (providerId: string) => {
    if (providerId === selectedProvider) {
      setSelectedProvider(null);
      updateConfig({ apiKey: undefined });
      return;
    }

    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return;

    setIsConfiguring(true);

    try {
      if (provider.requiresApiKey) {
        const apiKey = prompt(`Please enter your ${provider.name} API key:`);
        if (!apiKey) {
          notifications.show('API key is required', 'error');
          return;
        }

        setIsValidating(true);
        const isValid = await validateApiKey(provider.id, apiKey);
        setIsValidating(false);

        if (!isValid) {
          notifications.show('Invalid API key', 'error');
          return;
        }

        updateConfig({ apiKey });
      }

      setSelectedProvider(providerId);
      updateConfig({
        temperature: 0.7,
        maxTokens: getDefaultMaxTokens(providerId),
        model: provider.defaultModel
      });

      notifications.show(`${provider.name} AI assistant enabled`, 'success');
    } catch (error) {
      notifications.show('Failed to configure AI provider', 'error');
    } finally {
      setIsConfiguring(false);
    }
  };

  const validateApiKey = async (providerId: string, apiKey: string): Promise<boolean> => {
    // Implement actual API key validation logic here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
    return true;
  };

  const getDefaultMaxTokens = (providerId: string): number => {
    switch (providerId) {
      case 'openai':
        return 4096;
      case 'gemini':
        return 8192;
      case 'claude':
        return 100000;
      default:
        return 2048;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">AI Parsing Assistant</h2>
        </div>
        {isConfiguring && (
          <div className="flex items-center gap-2 text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isValidating ? 'Validating...' : 'Configuring...'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AI_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedProvider === provider.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
              onClick={() => handleProviderSelect(provider.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium">{provider.name}</span>
                </div>
                {selectedProvider === provider.id && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{provider.description}</p>
              {provider.requiresApiKey && (
                <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                  <Key className="h-3 w-3" />
                  Requires API Key
                </div>
              )}
              {provider.defaultModel && (
                <div className="mt-2 text-xs text-gray-500">
                  Default Model: {provider.defaultModel}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedProvider && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Configuration</h3>
              <Settings className="h-4 w-4 text-gray-500" />
            </div>
            
            {AI_PROVIDERS.find(p => p.id === selectedProvider)?.requiresApiKey && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                    placeholder="Enter your API key"
                  />
                  <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Processing Temperature
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={(config.temperature || 0.7) * 100}
                onChange={(e) => updateConfig({ temperature: Number(e.target.value) / 100 })}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Precise</span>
                <span>{Math.round((config.temperature || 0.7) * 100)}%</span>
                <span>Creative</span>
              </div>
            </div>

            {selectedProvider !== 'ollama' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={config.maxTokens || ''}
                  onChange={(e) => updateConfig({ maxTokens: Number(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Maximum tokens to process"
                  min={1}
                  max={100000}
                />
              </div>
            )}
          </div>
        )}

        {selectedProvider && (
          <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-indigo-900">
                AI assistance will help extract structured data from your scraped content,
                improving accuracy and consistency of the results.
              </p>
              <p className="text-xs text-indigo-700">
                Using {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} for processing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};