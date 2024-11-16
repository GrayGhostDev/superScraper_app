import React from 'react';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrafficIncident {
  id: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  delay?: number;
  startTime: Date;
}

interface TrafficMetricsProps {
  incidents: TrafficIncident[];
  lastUpdated: Date;
}

export const TrafficMetrics: React.FC<TrafficMetricsProps> = ({ incidents, lastUpdated }) => {
  const severeCases = incidents.filter(i => i.severity === 'severe').length;
  const majorCases = incidents.filter(i => i.severity === 'major').length;
  const moderateCases = incidents.filter(i => i.severity === 'moderate').length;
  const minorCases = incidents.filter(i => i.severity === 'minor').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative">
        <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Severe Incidents</p>
              <p className="text-2xl font-bold text-red-600">{severeCases}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Updated {formatDistanceToNow(lastUpdated)} ago
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Major Incidents</p>
              <p className="text-2xl font-bold text-orange-600">{majorCases}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Updated {formatDistanceToNow(lastUpdated)} ago
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Moderate/Minor</p>
              <p className="text-2xl font-bold text-yellow-600">
                {moderateCases + minorCases}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Updated {formatDistanceToNow(lastUpdated)} ago
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Incidents</p>
            <p className="text-2xl font-bold">{incidents.length}</p>
          </div>
          <Activity className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Updated {formatDistanceToNow(lastUpdated)} ago
        </div>
      </div>
    </div>
  );
};