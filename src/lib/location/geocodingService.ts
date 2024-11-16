import { notifications } from '../../utils/notifications';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationDetails {
  coordinates: Coordinates;
  address: string;
  placeId?: string;
  formattedAddress?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bbox?: [number, number, number, number];
  type?: string;
}

export class GeocodingService {
  private mapboxToken: string;
  private cache: Map<string, LocationDetails>;

  constructor() {
    this.mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    this.cache = new Map();
  }

  async geocode(address: string): Promise<LocationDetails> {
    try {
      // Check cache first
      const cacheKey = address.toLowerCase().trim();
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
        `access_token=${this.mapboxToken}&` +
        'country=us&' +
        'types=address,place,region&' +
        'limit=1'
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      if (!data.features?.[0]) {
        throw new Error('No results found');
      }

      const feature = data.features[0];
      const context = this.parseContext(feature.context || []);

      const locationDetails: LocationDetails = {
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1]
        },
        address: feature.place_name,
        placeId: feature.id,
        formattedAddress: feature.place_name,
        neighborhood: context.neighborhood,
        city: context.place,
        state: context.region,
        country: context.country,
        postalCode: context.postcode,
        bbox: feature.bbox,
        type: feature.place_type[0]
      };

      // Cache the result
      this.cache.set(cacheKey, locationDetails);

      return locationDetails;
    } catch (error) {
      console.error('Geocoding error:', error);
      notifications.show('Failed to geocode address', 'error');
      throw error;
    }
  }

  async reverseGeocode(coordinates: Coordinates): Promise<LocationDetails> {
    try {
      const cacheKey = `${coordinates.lng},${coordinates.lat}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?` +
        `access_token=${this.mapboxToken}&` +
        'types=address&' +
        'limit=1'
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      if (!data.features?.[0]) {
        throw new Error('No results found');
      }

      const feature = data.features[0];
      const context = this.parseContext(feature.context || []);

      const locationDetails: LocationDetails = {
        coordinates,
        address: feature.place_name,
        placeId: feature.id,
        formattedAddress: feature.place_name,
        neighborhood: context.neighborhood,
        city: context.place,
        state: context.region,
        country: context.country,
        postalCode: context.postcode,
        type: feature.place_type[0]
      };

      // Cache the result
      this.cache.set(cacheKey, locationDetails);

      return locationDetails;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      notifications.show('Failed to reverse geocode coordinates', 'error');
      throw error;
    }
  }

  private parseContext(context: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    context.forEach(item => {
      if (item.id.startsWith('neighborhood')) result.neighborhood = item.text;
      if (item.id.startsWith('place')) result.place = item.text;
      if (item.id.startsWith('region')) result.region = item.text;
      if (item.id.startsWith('postcode')) result.postcode = item.text;
      if (item.id.startsWith('country')) result.country = item.text;
    });
    
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}