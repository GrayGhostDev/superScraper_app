import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useScraperStore } from '../store/scraperStore';
import { useEnrichmentStore } from '../store/enrichmentStore';
import { EnrichmentSelector } from './EnrichmentSelector';
import { AIAssistantSelector } from './AIAssistantSelector';

export const AddJobForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const addJob = useScraperStore((state) => state.addJob);
  const { selectedProviders, addProvider, removeProvider } = useEnrichmentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      addJob(url.trim());
      setUrl('');
    }
  };

  const handleProviderSelection = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      removeProvider(providerId);
    } else {
      addProvider(providerId);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Scraping Job</h2>
        
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scrape"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5" />
            Add Job
          </button>
        </div>
      </form>

      <AIAssistantSelector />
      
      <EnrichmentSelector
        selectedProviders={selectedProviders}
        onSelectProvider={handleProviderSelection}
      />
    </div>
  );
};