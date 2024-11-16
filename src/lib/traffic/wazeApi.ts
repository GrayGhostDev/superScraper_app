import { notifications } from '../../utils/notifications';

export class WazeTrafficAPI {
  private apiKey: string;
  private baseUrl = 'https://www.waze.com/live-map/api';

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
      const response = await fetch(
        `${this.baseUrl}/traffic-data?bounds=${bounds.north},${bounds.south},${bounds.east},${bounds.west}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch Waze data');

      return await response.json();
    } catch (error) {
      notifications.show('Failed to fetch Waze traffic data', 'error');
      throw error;
    }
  }
}