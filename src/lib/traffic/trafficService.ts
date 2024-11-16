import { TomTomTrafficAPI } from './tomtomApi';
import { WazeTrafficAPI } from './wazeApi';
import { RadioStreamListener } from './radioStream';
import { RadioTransmissionParser } from './radioParser';
import { notifications } from '../../utils/notifications';

interface TrafficIncident {
  id: string;
  type: string;
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  location: {
    coordinates: [number, number];
    description?: string;
  };
  startTime: Date;
  description: string;
  delay?: number;
  affectedRoads?: string[];
}

interface TrafficConditions {
  congestionLevel: number;
  averageSpeed: number;
  incidents: TrafficIncident[];
  lastUpdated: Date;
}

export class TrafficService {
  private tomtomApi: TomTomTrafficAPI;
  private wazeApi: WazeTrafficAPI;
  private radioListener: RadioStreamListener;
  private radioParser: RadioTransmissionParser;
  private updateInterval: number = 300000; // 5 minutes
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.tomtomApi = new TomTomTrafficAPI(import.meta.env.VITE_TOMTOM_TOKEN);
    this.wazeApi = new WazeTrafficAPI(import.meta.env.VITE_WAZE_API_KEY);
    this.radioParser = new RadioTransmissionParser(
      'openai',
      import.meta.env.VITE_OPENAI_API_KEY
    );
    this.radioListener = new RadioStreamListener(
      ['accident', 'incident', 'collision', 'traffic'],
      this.handleRadioTransmission.bind(this)
    );
  }

  async startMonitoring(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<void> {
    try {
      // Initial fetch
      await this.fetchTrafficData(bounds);

      // Set up periodic updates
      this.intervalId = setInterval(
        () => this.fetchTrafficData(bounds),
        this.updateInterval
      );

      // Start listening to emergency radio
      this.radioListener.connect('wss://emergency-radio-stream.example.com');

      notifications.show('Traffic monitoring started', 'success');
    } catch (error) {
      console.error('Failed to start traffic monitoring:', error);
      notifications.show('Failed to start traffic monitoring', 'error');
    }
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.radioListener.disconnect();
  }

  private async fetchTrafficData(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<TrafficConditions> {
    try {
      // Fetch data from multiple sources in parallel
      const [tomtomData, wazeData] = await Promise.all([
        this.tomtomApi.getTrafficIncidents(bounds),
        this.wazeApi.getTrafficIncidents(bounds)
      ]);

      // Merge and normalize incidents
      const incidents = [
        ...this.normalizeTomTomIncidents(tomtomData),
        ...this.normalizeWazeIncidents(wazeData)
      ];

      // Calculate aggregate metrics
      const conditions: TrafficConditions = {
        congestionLevel: this.calculateCongestionLevel(incidents),
        averageSpeed: this.calculateAverageSpeed(incidents),
        incidents: this.deduplicateIncidents(incidents),
        lastUpdated: new Date()
      };

      return conditions;
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      throw error;
    }
  }

  private async handleRadioTransmission(transmission: any): Promise<void> {
    try {
      const parsedData = await this.radioParser.parseTransmission(transmission.text);
      if (parsedData.incidentType) {
        notifications.show(`New incident reported: ${parsedData.description}`, 'info');
        // Handle the new incident data
      }
    } catch (error) {
      console.error('Failed to parse radio transmission:', error);
    }
  }

  private normalizeTomTomIncidents(incidents: any[]): TrafficIncident[] {
    return incidents.map(incident => ({
      id: incident.id,
      type: incident.type,
      severity: this.mapSeverity(incident.magnitudeOfDelay),
      location: {
        coordinates: incident.geometry.coordinates,
        description: incident.properties.from
      },
      startTime: new Date(incident.startTime),
      description: incident.description,
      delay: incident.delay,
      affectedRoads: incident.properties.roadNumbers
    }));
  }

  private normalizeWazeIncidents(incidents: any[]): TrafficIncident[] {
    return incidents.map(incident => ({
      id: incident.uuid,
      type: incident.type,
      severity: this.mapSeverity(incident.severity),
      location: {
        coordinates: [incident.location.x, incident.location.y],
        description: incident.street
      },
      startTime: new Date(incident.startTime),
      description: incident.description,
      delay: incident.delay
    }));
  }

  private mapSeverity(value: number): TrafficIncident['severity'] {
    if (value >= 4) return 'severe';
    if (value >= 3) return 'major';
    if (value >= 2) return 'moderate';
    return 'minor';
  }

  private calculateCongestionLevel(incidents: TrafficIncident[]): number {
    const weights = { severe: 1, major: 0.7, moderate: 0.4, minor: 0.2 };
    const total = incidents.reduce((sum, incident) => 
      sum + (weights[incident.severity] || 0), 0
    );
    return Math.min(Math.round((total / incidents.length) * 100), 100) || 0;
  }

  private calculateAverageSpeed(incidents: TrafficIncident[]): number {
    // Implementation would depend on available speed data
    return 35; // Mock value
  }

  private deduplicateIncidents(incidents: TrafficIncident[]): TrafficIncident[] {
    const seen = new Set<string>();
    return incidents.filter(incident => {
      const key = `${incident.location.coordinates.join(',')}:${incident.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}