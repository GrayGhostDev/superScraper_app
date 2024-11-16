import React, { useState } from 'react';
import { Database, Download, RefreshCw, Activity, Brain } from 'lucide-react';
import { PDLDataGrid } from './dataViewer/PDLDataGrid';
import { DataVisualizations } from './dataViewer/DataVisualizations';
import { SearchFilters } from './dataViewer/SearchFilters';
import { AnalyticsPanel } from './dataViewer/AnalyticsPanel';
import { EnrichmentPanel } from './dataViewer/EnrichmentPanel';
import { RealTimeUpdates } from './dataViewer/RealTimeUpdates';
import { usePDLStore } from '../../store/pdlStore';
import { notifications } from '../../utils/notifications';

type ViewMode = 'grid' | 'visualizations' | 'analytics' | 'enrichment' | 'realtime';

export const DataViewer: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('grid');
  const { fetchData, data, searchParams, updateSearchParams, isLoading } = usePDLStore();

  const handleSearch = async () => {
    try {
      await fetchData();
    } catch (error) {
      notifications.show('Failed to fetch data', 'error');
    }
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdl-data-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifications.show('Data exported successfully', 'success');
  };

  const handleDataEnriched = (enrichedData: any[]) => {
    notifications.show(`Enriched ${enrichedData.length} records`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Data Viewer</h2>
          </div>
          <div className="flex items-center gap-2">
            {['grid', 'visualizations', 'analytics', 'enrichment', 'realtime'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as ViewMode)}
                className={`px-4 py-2 rounded-md ${
                  activeView === view
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <SearchFilters
          searchParams={searchParams}
          onUpdateParams={updateSearchParams}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        <div className="flex justify-end gap-2 mt-4 mb-6">
          <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {activeView === 'grid' && (
          <PDLDataGrid data={data} isLoading={isLoading} />
        )}

        {activeView === 'visualizations' && (
          <DataVisualizations data={data} />
        )}

        {activeView === 'analytics' && (
          <AnalyticsPanel data={data} />
        )}

        {activeView === 'enrichment' && (
          <EnrichmentPanel
            data={data}
            onDataEnriched={handleDataEnriched}
          />
        )}

        {activeView === 'realtime' && (
          <RealTimeUpdates />
        )}
      </div>
    </div>
  );
};