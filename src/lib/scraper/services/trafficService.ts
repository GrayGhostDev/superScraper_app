import { notifications } from '../../../utils/notifications';

class TrafficService {
  private static instance: TrafficService;
  private tomtomToken: string;
  private updateCallbacks: Set<(data: any) => void>;
  private updateInterval: number = 15000; // 15 seconds

  private constructor() {
    this.tomtomToken = import.meta.env.VITE_TOMTOM_TOKEN || '';
    this.updateCallbacks = new Set();
  }

  static getInstance(): TrafficService {
    if (!TrafficService.instance) {
      TrafficService.instance = new TrafficService();
    }
    return TrafficService.instance;
  }

  async getTrafficIncidents(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    try {
      const response = await fetch(
        `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${this.tomtomToken}&bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}`
      );

      if (!response.ok) throw new Error('Failed to fetch traffic data');

      const data = await response.json();
      return this.processIncidents(data.incidents);
    } catch (error) {
      console.error('Traffic service error:', error);
      notifications.show('Failed to fetch traffic data', 'error');
      throw error;
    }
  }

  startRealtimeUpdates(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    const intervalId = setInterval(async () => {
      try {
        const incidents = await this.getTrafficIncidents(bounds);
        this.updateCallbacks.forEach(callback => callback(incidents));
      } catch (error) {
        console.error('Realtime update error:', error);
      }
    }, this.updateInterval);

    return () => {
      clearInterval(intervalId);
    };
  }

  onTrafficUpdate(callback: (data: any) => void) {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private processIncidents(incidents: any[]) {
    return incidents.map(incident => ({
      id: incident.id,
      type: incident.type,
      severity: this.getSeverityLevel(incident.properties.magnitudeOfDelay),
      description: incident.properties.events?.[0]?.description || 'Unknown incident',
      delay: incident.properties.delay,
      location: {
        coordinates: incident.geometry.coordinates,
        description: incident.properties.from
      },
      startTime: new Date(incident.properties.startTime)
    }));
  }

  private getSeverityLevel(magnitude: number): string {
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
  }
}

export const trafficService = TrafficService.getInstance();