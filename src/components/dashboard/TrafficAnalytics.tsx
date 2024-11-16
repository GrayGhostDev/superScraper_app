import React, { useEffect, useState } from 'react';
import { Car, AlertTriangle, Search, MapPin, Info } from 'lucide-react';
import { TomTomTrafficAPI } from '../../lib/traffic/tomtomApi';
import { useTrafficStore } from '../../store/trafficStore';
import { notifications } from '../../utils/notifications';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Incident {
  id: string;
  properties: {
    magnitudeOfDelay: number;
    events: Array<{
      description: string;
      code: number;
    }>;
    from: string;
    to: string;
    startTime: string;
    delay: number;
  };
}

interface IncidentGroup {
  count: number;
  incidents: Incident[];
}

const defaultBounds: LocationBounds = {
  north: 42.4534,
  south: 42.2574,
  east: -82.9105,
  west: -83.2458
};

// Initialize TomTom API with error handling
const initializeTomTomAPI = () => {
  const apiKey = import.meta.env.VITE_TOMTOM_TOKEN;
  if (!apiKey) {
    notifications.show('TomTom API key is missing', 'error');
    return null;
  }
  try {
    return new TomTomTrafficAPI(apiKey);
  } catch (error) {
    notifications.show('Failed to initialize TomTom API', 'error');
    return null;
  }
};

const tomtomApi = initializeTomTomAPI();

export const TrafficAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bounds, setBounds] = useState<LocationBounds>(defaultBounds);
  const [customLocation, setCustomLocation] = useState('');
  const [hoveredIncidentGroup, setHoveredIncidentGroup] = useState<string | null>(null);
  const [incidentGroups, setIncidentGroups] = useState<Record<string, IncidentGroup>>({
    severe: { count: 0, incidents: [] },
    major: { count: 0, incidents: [] },
    moderate: { count: 0, incidents: [] },
    minor: { count: 0, incidents: [] }
  });
  const { trafficData, updateTrafficData } = useTrafficStore();

  const fetchTrafficData = async (searchBounds: LocationBounds) => {
    if (!tomtomApi) {
      setIsLoading(false);
      return;
    }

    try {
      const incidents = await tomtomApi.getTrafficIncidents(searchBounds);
      
      // Group incidents by severity
      const groups = {
        severe: { count: 0, incidents: [] },
        major: { count: 0, incidents: [] },
        moderate: { count: 0, incidents: [] },
        minor: { count: 0, incidents: [] }
      };

      incidents.forEach((incident: Incident) => {
        if (incident.properties.magnitudeOfDelay === 4) {
          groups.severe.incidents.push(incident);
          groups.severe.count++;
        } else if (incident.properties.magnitudeOfDelay === 3) {
          groups.major.incidents.push(incident);
          groups.major.count++;
        } else if (incident.properties.magnitudeOfDelay === 2) {
          groups.moderate.incidents.push(incident);
          groups.moderate.count++;
        } else if (incident.properties.magnitudeOfDelay === 1) {
          groups.minor.incidents.push(incident);
          groups.minor.count++;
        }
      });

      setIncidentGroups(groups);
      
      const processedData = {
        incidents: incidents.length,
        lastUpdated: new Date(),
        severity: {
          minor: groups.minor.count,
          moderate: groups.moderate.count,
          major: groups.major.count,
          severe: groups.severe.count
        }
      };

      updateTrafficData(processedData);
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      notifications.show('Failed to fetch traffic data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData(bounds);
    const interval = setInterval(() => fetchTrafficData(bounds), 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [bounds]);

  const handleLocationSearch = async () => {
    if (!customLocation.trim()) return;

    try {
      setIsLoading(true);
      // Use TomTom Geocoding API to get coordinates
      const response = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(customLocation)}.json?key=${import.meta.env.VITE_TOMTOM_TOKEN}`
      );
      
      if (!response.ok) throw new Error('Failed to geocode location');
      
      const data = await response.json();
      if (data.results && data.results[0]) {
        const { boundingBox } = data.results[0];
        
        // Create a bounding box around the location
        const newBounds = {
          north: boundingBox.northEast.lat,
          south: boundingBox.southWest.lat,
          east: boundingBox.northEast.lon,
          west: boundingBox.southWest.lon
        };
        
        setBounds(newBounds);
        await fetchTrafficData(newBounds);
        notifications.show('Location updated successfully', 'success');
      } else {
        notifications.show('Location not found', 'error');
      }
    } catch (error) {
      notifications.show('Failed to search location', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderIncidentDetails = (group: IncidentGroup) => {
    if (!group.incidents.length) return null;

    return (
      <div className="absolute z-10 bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
        <h4 className="font-medium text-gray-900 mb-2">Incident Details</h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {group.incidents.map((incident, index) => (
            <div key={incident.id} className="border-b border-gray-200 pb-2 last:border-0">
              <p className="text-sm font-medium text-gray-900">
                {incident.properties.events[0]?.description || 'Unknown Incident'}
              </p>
              <div className="mt-1 text-xs text-gray-500 space-y-1">
                <p>From: {incident.properties.from}</p>
                <p>To: {incident.properties.to}</p>
                <p>Started: {new Date(incident.properties.startTime).toLocaleString()}</p>
                <p>Delay: {Math.round(incident.properties.delay / 60)} minutes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Location Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Location Search</h3>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="Enter city, address, or coordinates"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
          />
          <button
            onClick={handleLocationSearch}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          Current bounds: {bounds.north.toFixed(4)}°N, {bounds.south.toFixed(4)}°S, {bounds.east.toFixed(4)}°E, {bounds.west.toFixed(4)}°W
        </div>
      </div>

      {/* Traffic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onMouseEnter={() => setHoveredIncidentGroup('severe')}
            onMouseLeave={() => setHoveredIncidentGroup(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Severe Incidents</p>
                <p className="text-2xl font-bold text-red-600">{trafficData.severity.severe}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            {hoveredIncidentGroup === 'severe' && renderIncidentDetails(incidentGroups.severe)}
          </div>
        </div>

        <div className="relative">
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onMouseEnter={() => setHoveredIncidentGroup('major')}
            onMouseLeave={() => setHoveredIncidentGroup(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Major Incidents</p>
                <p className="text-2xl font-bold text-orange-600">{trafficData.severity.major}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            {hoveredIncidentGroup === 'major' && renderIncidentDetails(incidentGroups.major)}
          </div>
        </div>

        <div className="relative">
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onMouseEnter={() => setHoveredIncidentGroup('moderate')}
            onMouseLeave={() => setHoveredIncidentGroup(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moderate/Minor</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {trafficData.severity.moderate + trafficData.severity.minor}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            {hoveredIncidentGroup === 'moderate' && renderIncidentDetails({
              count: incidentGroups.moderate.count + incidentGroups.minor.count,
              incidents: [...incidentGroups.moderate.incidents, ...incidentGroups.minor.incidents]
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold">{trafficData.incidents}</p>
            </div>
            <Car className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Severity Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Severity Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { name: 'Severe', value: trafficData.severity.severe },
                { name: 'Major', value: trafficData.severity.major },
                { name: 'Moderate', value: trafficData.severity.moderate },
                { name: 'Minor', value: trafficData.severity.minor }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};