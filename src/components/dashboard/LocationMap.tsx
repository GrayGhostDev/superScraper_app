import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapService } from '../../lib/traffic/mapService';
import { notifications } from '../../utils/notifications';

interface LocationMapProps {
  onLocationSelect: (location: any) => void;
  onIncidentsUpdate?: (incidents: any[]) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelect,
  onIncidentsUpdate,
  initialCenter = [-83.0458, 42.3314], // Detroit coordinates
  initialZoom = 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapService = useRef<MapService | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: initialZoom
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for a location',
      countries: 'us'
    });

    geocoder.on('result', (e) => {
      const location = {
        center: e.result.center,
        name: e.result.text,
        address: e.result.place_name,
        bbox: e.result.bbox,
        context: parseContext(e.result.context || [])
      };
      setSelectedLocation(location);
      onLocationSelect(location);
      startRealTimeUpdates(location);
    });

    map.current.addControl(geocoder);

    // Initialize map service
    mapService.current = new MapService(
      mapContainer.current.id,
      initialCenter,
      initialZoom
    );

    // Add incident layer
    map.current.on('load', () => {
      initializeIncidentLayer();
    });

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      clearMarkers();
      map.current?.remove();
      if (mapService.current) {
        mapService.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && initialCenter) {
      map.current.setCenter(initialCenter);
      if (selectedLocation) {
        startRealTimeUpdates(selectedLocation);
      }
    }
  }, [initialCenter]);

  const initializeIncidentLayer = () => {
    if (!map.current) return;

    map.current.addSource('incidents', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.current.addLayer({
      id: 'incident-points',
      type: 'circle',
      source: 'incidents',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 6,
          15, 12
        ],
        'circle-color': [
          'match',
          ['get', 'severity'],
          'severe', '#ef4444',
          'major', '#f97316',
          'moderate', '#eab308',
          'minor', '#22c55e',
          '#6b7280'
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add hover effect
    map.current.on('mouseenter', 'incident-points', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'incident-points', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    // Add click handler for incidents
    map.current.on('click', 'incident-points', (e) => {
      if (!e.features?.[0]) return;

      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const properties = e.features[0].properties;

      // Ensure popup appears above the point
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: 'custom-popup'
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-3">
            <h3 class="font-medium text-gray-900">${properties.description}</h3>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <p class="flex items-center gap-1">
                <span class="font-medium">Severity:</span>
                <span class="${getSeverityColor(properties.severity)}">${properties.severity}</span>
              </p>
              <p>Delay: ${Math.round(properties.delay / 60)} minutes</p>
              ${properties.from ? `<p>Location: ${properties.from}</p>` : ''}
              ${properties.startTime ? `<p>Started: ${new Date(properties.startTime).toLocaleTimeString()}</p>` : ''}
            </div>
          </div>
        `)
        .addTo(map.current);
    });
  };

  const startRealTimeUpdates = (location: any) => {
    if (updateInterval.current) {
      clearInterval(updateInterval.current);
    }

    const updateIncidents = () => updateTrafficData(location);
    
    // Initial update
    updateIncidents();

    // Set up interval for real-time updates (every 15 seconds)
    updateInterval.current = setInterval(updateIncidents, 15000);
  };

  const updateTrafficData = async (location: any) => {
    if (!location.bbox || !map.current) return;

    try {
      const bounds = {
        north: location.bbox[3],
        south: location.bbox[1],
        east: location.bbox[2],
        west: location.bbox[0]
      };

      const response = await fetch(
        `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${import.meta.env.VITE_TOMTOM_TOKEN}&bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
      );

      if (!response.ok) throw new Error('Failed to fetch traffic data');

      const data = await response.json();
      const incidents = data.incidents.map((incident: any) => ({
        type: 'Feature',
        geometry: incident.geometry,
        properties: {
          id: incident.id,
          severity: getSeverityLevel(incident.properties.magnitudeOfDelay),
          description: incident.properties.events[0]?.description || 'Unknown incident',
          delay: incident.properties.delay,
          from: incident.properties.from,
          startTime: incident.properties.startTime
        }
      }));

      const source = map.current.getSource('incidents') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: incidents
        });
      }

      if (onIncidentsUpdate) {
        onIncidentsUpdate(data.incidents);
      }

      // Update markers
      updateIncidentMarkers(incidents);

    } catch (error) {
      console.error('Failed to update traffic data:', error);
      notifications.show('Failed to fetch traffic data', 'error');
    }
  };

  const updateIncidentMarkers = (incidents: any[]) => {
    clearMarkers();

    incidents.forEach(incident => {
      if (!map.current) return;

      const el = document.createElement('div');
      el.className = 'incident-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.backgroundColor = getSeverityBackgroundColor(incident.properties.severity);
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(incident.geometry.coordinates)
        .addTo(map.current);

      markers.current.push(marker);
    });
  };

  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  };

  const parseContext = (context: any[]) => {
    const result: any = {};
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

  const getSeverityLevel = (magnitude: number): string => {
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

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'severe':
        return 'text-red-600 font-semibold';
      case 'major':
        return 'text-orange-600 font-semibold';
      case 'moderate':
        return 'text-yellow-600 font-semibold';
      case 'minor':
        return 'text-green-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBackgroundColor = (severity: string): string => {
    switch (severity) {
      case 'severe':
        return '#ef4444';
      case 'major':
        return '#f97316';
      case 'moderate':
        return '#eab308';
      case 'minor':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg"
      id="location-map"
    />
  );
};