import React from 'react';
import { Brain, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { AIResultsChart } from './AIResultsChart';
import { ConfidenceScores } from './ConfidenceScores';
import { EntityHighlighter } from './EntityHighlighter';

interface AIResultsViewerProps {
  data: any;
  isLoading: boolean;
  error?: string;
}

export const AIResultsViewer: React.FC<AIResultsViewerProps> = ({
  data,
  isLoading,
  error
}) => {
  const { selectedProvider } = useAIStore();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
          <h2 className="text-lg font-semibold">Processing Results</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600 mb-2">Analyzing data with AI models...</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Processing Error</h2>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const {
    entities,
    summary,
    confidence,
    analysis,
    recommendations,
    dataQuality
  } = data;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">AI Analysis Results</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Processed by</span>
          <span className="font-medium text-indigo-600">
            {selectedProvider?.charAt(0).toUpperCase() + selectedProvider?.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Key Findings</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">{summary}</p>
          </div>
          
          {/* Entity Highlighting */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Extracted Entities
            </h3>
            <EntityHighlighter entities={entities} />
          </div>
        </div>

        {/* Charts & Metrics */}
        <div className="space-y-6">
          <AIResultsChart data={analysis} />
          <ConfidenceScores scores={confidence} />
        </div>
      </div>

      {/* Data Quality Indicators */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(dataQuality).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <CheckCircle2 
                className={`h-5 w-5 ${
                  value > 0.8 ? 'text-green-500' : 
                  value > 0.6 ? 'text-yellow-500' : 
                  'text-red-500'
                }`} 
              />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  value > 0.8 ? 'bg-green-500' : 
                  value > 0.6 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {Math.round(value * 100)}% confidence
            </span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            AI Recommendations
          </h3>
          <div className="bg-indigo-50 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <span className="text-sm text-indigo-900">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};