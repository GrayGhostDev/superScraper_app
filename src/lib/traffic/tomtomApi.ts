import { notifications } from '../../utils/notifications';

export class TomTomTrafficAPI {
  private apiKey: string;
  private baseUrl = 'https://api.tomtom.com/traffic/services/5';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTrafficIncidents(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    try {
      // Format bounding box
      const bbox = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;

      // Create URL with query parameters
      const url = new URL(`${this.baseUrl}/incidentDetails`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('bbox', bbox);
      url.searchParams.append('fields', '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}');
      url.searchParams.append('language', 'en-GB');
      url.searchParams.append('categoryFilter', '1,6,7,8');
      url.searchParams.append('timeValidityFilter', 'present');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.incidents || [];
    } catch (error) {
      console.error('TomTom API Error:', error);
      notifications.show('Failed to fetch traffic data', 'error');
      return [];
    }
  }
}
