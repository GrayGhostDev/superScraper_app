import { notifications } from '../../utils/notifications';

interface LocationDetails {
  coordinates: [number, number];
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  placeType?: string;
  bbox?: [number, number, number, number];
}

interface EmergencyServices {
  policeStations: {
    count: number;
    nearest: {
      name: string;
      distance: number;
      responseTime: number;
    }[];
  };
  fireStations: {
    count: number;
    nearest: {
      name: string;
      distance: number;
      responseTime: number;
    }[];
  };
  hospitals: {
    count: number;
    nearest: {
      name: string;
      distance: number;
      waitTime: number;
      traumaLevel: number;
    }[];
  };
}

interface DemographicData {
  population: number;
  medianAge: number;
  medianIncome: number;
  crimeRate: number;
  schoolRating: number;
}

export class LocationService {
  private mapboxToken: string;
  
  constructor() {
    this.mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  }

  async getLocationDetails(query: string): Promise<LocationDetails> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.mapboxToken}&country=us`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location details');
      }

      const data = await response.json();
      const feature = data.features[0];

      if (!feature) {
        throw new Error('Location not found');
      }

      const context = this.parseContext(feature.context || []);

      return {
        coordinates: feature.center,
        address: feature.place_name,
        neighborhood: context.neighborhood,
        city: context.place,
        state: context.region,
        postalCode: context.postcode,
        country: context.country,
        placeType: feature.place_type[0],
        bbox: feature.bbox
      };
    } catch (error) {
      console.error('Location lookup error:', error);
      notifications.show('Failed to get location details', 'error');
      throw error;
    }
  }

  async getEmergencyServices(coordinates: [number, number]): Promise<EmergencyServices> {
    try {
      // Implementation would use real emergency services APIs
      const [policeData, fireData, hospitalData] = await Promise.all([
        this.findPoliceStations(coordinates),
        this.findFireStations(coordinates),
        this.findHospitals(coordinates)
      ]);

      return {
        policeStations: policeData,
        fireStations: fireData,
        hospitals: hospitalData
      };
    } catch (error) {
      console.error('Emergency services lookup error:', error);
      notifications.show('Failed to get emergency services data', 'error');
      throw error;
    }
  }

  async getDemographicData(coordinates: [number, number]): Promise<DemographicData> {
    try {
      // Implementation would use real demographic data APIs
      return {
        population: 50000,
        medianAge: 35,
        medianIncome: 65000,
        crimeRate: 320,
        schoolRating: 7.5
      };
    } catch (error) {
      console.error('Demographics lookup error:', error);
      notifications.show('Failed to get demographic data', 'error');
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

  private async findPoliceStations(coordinates: [number, number]) {
    // Mock implementation
    return {
      count: 3,
      nearest: [
        { name: 'Central Police Station', distance: 1.2, responseTime: 5 },
        { name: 'North Precinct', distance: 2.5, responseTime: 7 },
        { name: 'East Division', distance: 3.1, responseTime: 8 }
      ]
    };
  }

  private async findFireStations(coordinates: [number, number]) {
    // Mock implementation
    return {
      count: 2,
      nearest: [
        { name: 'Station 12', distance: 1.8, responseTime: 4 },
        { name: 'Station 7', distance: 2.9, responseTime: 6 }
      ]
    };
  }

  private async findHospitals(coordinates: [number, number]) {
    // Mock implementation
    return {
      count: 3,
      nearest: [
        { name: 'City General', distance: 2.1, waitTime: 15, traumaLevel: 1 },
        { name: 'Memorial Hospital', distance: 3.4, waitTime: 25, traumaLevel: 2 },
        { name: 'Community Medical', distance: 4.2, waitTime: 20, traumaLevel: 2 }
      ]
    };
  }
}