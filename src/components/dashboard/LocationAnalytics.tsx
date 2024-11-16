import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Map, Search } from 'lucide-react';
import { LocationMap } from './LocationMap';
import { TrafficAnalytics } from './TrafficAnalytics';
import { HospitalWaitTimes } from './HospitalWaitTimes';
import { TrafficMetrics } from './TrafficMetrics';
import { notifications } from '../../utils/notifications';
import { useTrafficStore } from '../../store/trafficStore';

interface LocationData {
  center: [number, number];
  name: string;
  address: string;
  bbox?: [number, number, number, number];
  placeType?: string;
  context?: {
    neighborhood?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

interface TrafficIncident {
  id: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  delay?: number;
  startTime: Date;
  location: {
    coordinates: [number, number];
    description?: string;
  };
}

export const LocationAnalytics: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const { updateTrafficData } = useTrafficStore();

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [updateInterval]);

  const startRealTimeUpdates = (location: LocationData) => {
    // Clear existing interval if any
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    // Function to fetch and update incidents
    const updateIncidents = async () => {
      if (!location.bbox) return;

      try {
        const bounds = {
          north: location.bbox[3],
          south: location.bbox[1],
          east: location.bbox[2],
          west: location.bbox[0]
        };

        // Fetch incidents from your traffic service
        const response = await fetch(
          `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${import.meta.env.VITE_TOMTOM_TOKEN}&bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
        );

        if (!response.ok) throw new Error('Failed to fetch traffic data');

        const data = await response.json();
        const newIncidents = data.incidents.map((incident: any) => ({
          id: incident.id,
          severity: getSeverityLevel(incident.properties.magnitudeOfDelay),
          description: incident.properties.events[0]?.description || 'Unknown incident',
          delay: incident.properties.delay,
          startTime: new Date(incident.properties.startTime),
          location: {
            coordinates: incident.geometry.coordinates,
            description: incident.properties.from
          }
        }));

        setIncidents(newIncidents);
        setLastUpdated(new Date());

        // Update traffic store
        updateTrafficData({
          incidents: newIncidents.length,
          lastUpdated: new Date(),
          severity: {
            minor: newIncidents.filter(i => i.severity === 'minor').length,
            moderate: newIncidents.filter(i => i.severity === 'moderate').length,
            major: newIncidents.filter(i => i.severity === 'major').length,
            severe: newIncidents.filter(i => i.severity === 'severe').length
          }
        });

      } catch (error) {
        console.error('Failed to update incidents:', error);
      }
    };

    // Initial update
    updateIncidents();

    // Set up interval for real-time updates (every 30 seconds)
    const interval = setInterval(updateIncidents, 30000);
    setUpdateInterval(interval);
  };

  const handleLocationSelect = (locationData: LocationData) => {
    setSelectedLocation(locationData);
    setCustomLocation(locationData.address);
    startRealTimeUpdates(locationData);
    notifications.show(`Location updated to ${locationData.name}`, 'success');
  };

  const handleSearch = async () => {
    if (!customLocation.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(customLocation)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=US`
      );

      if (!response.ok) throw new Error('Failed to geocode location');

      const data = await response.json();
      if (data.features?.[0]) {
        const feature = data.features[0];
        const locationData = {
          center: feature.center,
          name: feature.text,
          address: feature.place_name,
          bbox: feature.bbox,
          context: parseContext(feature.context || [])
        };
        handleLocationSelect(locationData);
      } else {
        notifications.show('Location not found', 'error');
      }
    } catch (error) {
      notifications.show('Failed to search location', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const parseContext = (context: any[]): LocationData['context'] => {
    const result: LocationData['context'] = {};
    context.forEach(item => {
      if (item.id.startsWith('neighborhood')) result.neighborhood = item.text;
      if (item.id.startsWith('district')) result.district = item.text;
      if (item.id.startsWith('place')) result.city = item.text;
      if (item.id.startsWith('region')) result.state = item.text;
      if (item.id.startsWith('country')) result.country = item.text;
      if (item.id.startsWith('postcode')) result.postalCode = item.text;
    });
    return result;
  };

  const getSeverityLevel = (magnitude: number): TrafficIncident['severity'] => {
    switch (magnitude) {
      case 4:
        return 'severe';
      case 3:
        return 'major';
      case 2:
        return 'moderate';
      default:
        return 'minor';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter an address or location"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Traffic Metrics */}
      <TrafficMetrics incidents={incidents} lastUpdated={lastUpdated} />

      {/* Map Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Location Overview</h2>
          </div>
          {selectedLocation && (
            <div className="text-sm text-gray-500">
              {selectedLocation.name}
              {selectedLocation.context?.city && `, ${selectedLocation.context.city}`}
              {selectedLocation.context?.state && `, ${selectedLocation.context.state}`}
            </div>
          )}
        </div>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <LocationMap 
            onLocationSelect={handleLocationSelect}
            onIncidentsUpdate={setIncidents}
            initialCenter={selectedLocation?.center}
            initialZoom={12}
          />
        </div>
      </div>

      {/* Traffic Analytics */}
      <TrafficAnalytics location={selectedLocation} incidents={incidents} />

      {/* Hospital Wait Times */}
      <HospitalWaitTimes location={selectedLocation} />

      {/* Emergency Services */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Emergency Services</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <h3 className="font-medium">Police Stations</h3>
            </div>
            <p className="text-sm text-gray-600">
              {selectedLocation ? '5 stations within 5 miles radius' : 'Select a location to view nearby stations'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Fire Stations</h3>
            </div>
            <p className="text-sm text-gray-600">
              {selectedLocation ? '3 stations within 5 miles radius' : 'Select a location to view nearby stations'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Emergency Response Units</h3>
            </div>
            <p className="text-sm text-gray-600">
              {selectedLocation ? '8 units currently active in the area' : 'Select a location to view active units'}
            </p>
          </div>
        </div>

        {selectedLocation && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Emergency Response Protocol</h4>
                <p className="mt-1 text-sm text-amber-700">
                  Average response time in this area is 8 minutes. For immediate assistance,
                  call 911 or use the emergency contact feature in the application.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};