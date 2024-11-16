import { notifications } from '../../utils/notifications';

class LocationService {
  private static instance: LocationService;
  private mapboxToken: string;

  private constructor() {
    this.mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async geocode(address: string) {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.mapboxToken}&country=us`
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      if (!data.features?.[0]) {
        throw new Error('Location not found');
      }

      const feature = data.features[0];
      return {
        center: feature.center,
        name: feature.text,
        address: feature.place_name,
        bbox: feature.bbox,
        placeType: feature.place_type[0],
        context: this.parseContext(feature.context || [])
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      notifications.show('Failed to geocode address', 'error');
      throw error;
    }
  }

  async reverseGeocode(coordinates: [number, number]) {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${this.mapboxToken}&country=us`
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      if (!data.features?.[0]) {
        throw new Error('Location not found');
      }

      const feature = data.features[0];
      return {
        center: feature.center,
        name: feature.text,
        address: feature.place_name,
        bbox: feature.bbox,
        placeType: feature.place_type[0],
        context: this.parseContext(feature.context || [])
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      notifications.show('Failed to reverse geocode coordinates', 'error');
      throw error;
    }
  }

  private parseContext(context: any[]) {
    const result: Record<string, string> = {};
    context.forEach(item => {
      if (item.id.startsWith('neighborhood')) result.neighborhood = item.text;
      if (item.id.startsWith('district')) result.district = item.text;
      if (item.id.startsWith('place')) result.city = item.text;
      if (item.id.startsWith('region')) result.state = item.text;
      if (item.id.startsWith('country')) result.country = item.text;
      if (item.id.startsWith('postcode')) result.postalCode = item.text;
    });
    return result;
  }
}

export const locationService = LocationService.getInstance();