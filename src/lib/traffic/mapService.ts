import mapboxgl from 'mapbox-gl';
import { TomTomTrafficAPI } from './tomtomApi';
import { notifications } from '../../utils/notifications';

export class MapService {
  private map: mapboxgl.Map;
  private trafficApi: TomTomTrafficAPI;
  private markers: mapboxgl.Marker[] = [];
  private incidentLayer?: mapboxgl.GeoJSONSource;

  constructor(containerId: string, center: [number, number], zoom: number) {
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    }

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });

    this.trafficApi = new TomTomTrafficAPI(import.meta.env.VITE_TOMTOM_TOKEN);

    // Add navigation control
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initialize incident layer
    this.map.on('load', () => {
      this.initializeIncidentLayer();
    });
  }

  private initializeIncidentLayer() {
    // Add source for incidents
    this.map.addSource('incidents', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add layer for incident points
    this.map.addLayer({
      id: 'incident-points',
      type: 'circle',
      source: 'incidents',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'severity'],
          'severe', '#ef4444',
          'major', '#f97316',
          'moderate', '#eab308',
          'minor', '#22c55e',
          '#6b7280' // default color
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add hover effect
    this.map.on('mouseenter', 'incident-points', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'incident-points', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // Add click handler for incidents
    this.map.on('click', 'incident-points', (e) => {
      if (!e.features?.[0]) return;

      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const properties = e.features[0].properties;

      // Create popup content
      const description = `
        <div class="p-2">
          <h3 class="font-medium text-gray-900">${properties.description}</h3>
          <p class="text-sm text-gray-600 mt-1">Severity: ${properties.severity}</p>
          <p class="text-sm text-gray-600">Delay: ${Math.round(properties.delay / 60)} minutes</p>
          ${properties.from ? `<p class="text-sm text-gray-600">From: ${properties.from}</p>` : ''}
          ${properties.to ? `<p class="text-sm text-gray-600">To: ${properties.to}</p>` : ''}
        </div>
      `;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.map);
    });
  }

  async updateTrafficData(incidents: any[]) {
    try {
      if (!incidents || !Array.isArray(incidents)) {
        console.error('Invalid incidents data:', incidents);
        return;
      }

      // Convert incidents to GeoJSON features
      const features = incidents.map(incident => {
        // Ensure incident has valid geometry
        if (!incident.geometry?.coordinates) {
          console.warn('Invalid incident geometry:', incident);
          return null;
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: incident.geometry.coordinates
          },
          properties: {
            id: incident.properties.id,
            severity: this.getSeverityLevel(incident.properties.magnitudeOfDelay),
            description: incident.properties.events?.[0]?.description || 'Unknown incident',
            delay: incident.properties.delay || 0,
            from: incident.properties.from,
            to: incident.properties.to
          }
        };
      }).filter(Boolean); // Remove null features

      // Update the incidents source
      const source = this.map.getSource('incidents') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: features
        });
      }
    } catch (error) {
      console.error('Error updating traffic data:', error);
      notifications.show('Failed to update traffic data on map', 'error');
    }
  }

  private getSeverityLevel(magnitudeOfDelay: number): string {
    switch (magnitudeOfDelay) {
      case 4:
        return 'severe';
      case 3:
        return 'major';
      case 2:
        return 'moderate';
      case 1:
        return 'minor';
      default:
        return 'unknown';
    }
  }

  setCenter(center: [number, number]) {
    this.map.setCenter(center);
  }

  setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  setBounds(bounds: mapboxgl.LngLatBoundsLike) {
    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }

  cleanup() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.map.remove();
  }
}