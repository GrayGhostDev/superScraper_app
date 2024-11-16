import React from 'react';
import { PDLSearchParams } from '../../../types/pdl';
import { Search } from 'lucide-react';

interface SearchFiltersProps {
  searchParams: PDLSearchParams;
  onUpdateParams: (params: Partial<PDLSearchParams>) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchParams,
  onUpdateParams,
  onSearch,
  isLoading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={searchParams.location || ''}
            onChange={(e) => onUpdateParams({ location: e.target.value })}
            placeholder="Enter location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Industry</label>
          <input
            type="text"
            value={searchParams.industry || ''}
            onChange={(e) => onUpdateParams({ industry: e.target.value })}
            placeholder="Enter industry"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            value={searchParams.company || ''}
            onChange={(e) => onUpdateParams({ company: e.target.value })}
            placeholder="Enter company name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={searchParams.title || ''}
            onChange={(e) => onUpdateParams({ title: e.target.value })}
            placeholder="Enter job title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Match Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={searchParams.minMatchScore}
            onChange={(e) =>
              onUpdateParams({ minMatchScore: parseInt(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Results Limit
          </label>
          <select
            value={searchParams.limit}
            onChange={(e) => onUpdateParams({ limit: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </button>
      </div>
    </form>
  );
};