import React from 'react';
import { Settings } from 'lucide-react';
import { useScraperStore } from '../store/scraperStore';

export const ConfigPanel: React.FC = () => {
  const { config, updateConfig } = useScraperStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Configuration</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Concurrent Requests
          </label>
          <input
            type="number"
            value={config.concurrent}
            onChange={(e) => updateConfig({ concurrent: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rate Limit (requests/second)
          </label>
          <input
            type="number"
            value={config.rateLimit}
            onChange={(e) => updateConfig({ rateLimit: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Timeout (ms)
          </label>
          <input
            type="number"
            value={config.timeout}
            onChange={(e) => updateConfig({ timeout: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="1000"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Retries
          </label>
          <input
            type="number"
            value={config.retries}
            onChange={(e) => updateConfig({ retries: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="0"
            max="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Crawl Depth
          </label>
          <input
            type="number"
            value={config.depth}
            onChange={(e) => updateConfig({ depth: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="1"
            max="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Content Size (bytes)
          </label>
          <input
            type="number"
            value={config.maxSize}
            onChange={(e) => updateConfig({ maxSize: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            min="0"
            step="1000000"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="followLinks"
              checked={config.followLinks}
              onChange={(e) => updateConfig({ followLinks: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="followLinks" className="text-sm font-medium text-gray-700">
              Follow Links
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="respectRobotsTxt"
              checked={config.respectRobotsTxt}
              onChange={(e) => updateConfig({ respectRobotsTxt: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="respectRobotsTxt" className="text-sm font-medium text-gray-700">
              Respect robots.txt
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="validateSSL"
              checked={config.validateSSL}
              onChange={(e) => updateConfig({ validateSSL: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="validateSSL" className="text-sm font-medium text-gray-700">
              Validate SSL Certificates
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="extractMetadata"
              checked={config.extractMetadata}
              onChange={(e) => updateConfig({ extractMetadata: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="extractMetadata" className="text-sm font-medium text-gray-700">
              Extract Metadata
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="parseScripts"
              checked={config.parseScripts}
              onChange={(e) => updateConfig({ parseScripts: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="parseScripts" className="text-sm font-medium text-gray-700">
              Parse Structured Data
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User Agent
          </label>
          <input
            type="text"
            value={config.userAgent}
            onChange={(e) => updateConfig({ userAgent: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Allowed Domains (comma-separated)
          </label>
          <input
            type="text"
            value={config.allowedDomains?.join(', ') || ''}
            onChange={(e) => updateConfig({ 
              allowedDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="example.com, another-domain.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Exclude Patterns (comma-separated)
          </label>
          <input
            type="text"
            value={config.excludePatterns?.join(', ') || ''}
            onChange={(e) => updateConfig({ 
              excludePatterns: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="\\.pdf$, /login/, /admin/"
          />
        </div>
      </div>
    </div>
  );
};