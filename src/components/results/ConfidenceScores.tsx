import React from 'react';
import { Shield } from 'lucide-react';

interface ConfidenceScoresProps {
  scores: Record<string, number>;
}

export const ConfidenceScores: React.FC<ConfidenceScoresProps> = ({ scores }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Confidence Scores</h3>
      <div className="space-y-3">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1">
                <Shield className={`h-4 w-4 ${
                  value > 0.8 ? 'text-green-500' :
                  value > 0.6 ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {Math.round(value * 100)}%
                </span>
              </div>
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
          </div>
        ))}
      </div>
    </div>
  );
};