import { HospitalWaitTime } from '../../types/claims';
import { notifications } from '../../utils/notifications';
import { MOCK_HOSPITALS } from './mockData';

export class HospitalWaitTimeService {
  private apiKey: string;
  private baseUrl: string;
  private subscribers: Map<string, Set<(data: HospitalWaitTime) => void>>;
  private updateInterval: number;
  private intervals: Map<string, NodeJS.Timeout>;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.subscribers = new Map();
    this.intervals = new Map();
    this.updateInterval = 300000; // 5 minutes
  }

  async getWaitTimes(hospitalIds: string[]): Promise<Record<string, HospitalWaitTime>> {
    try {
      if (!this.apiKey) {
        // Return mock data if no API key is provided
        return hospitalIds.reduce((acc, id) => {
          if (MOCK_HOSPITALS[id]) {
            acc[id] = {
              ...MOCK_HOSPITALS[id],
              lastUpdated: new Date()
            };
          }
          return acc;
        }, {} as Record<string, HospitalWaitTime>);
      }

      const response = await fetch(`${this.baseUrl}/wait-times`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hospitalIds }),
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wait times');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching wait times:', error);
      notifications.show('Failed to fetch wait times', 'error');
      
      // Return mock data as fallback
      return hospitalIds.reduce((acc, id) => {
        if (MOCK_HOSPITALS[id]) {
          acc[id] = {
            ...MOCK_HOSPITALS[id],
            lastUpdated: new Date()
          };
        }
        return acc;
      }, {} as Record<string, HospitalWaitTime>);
    }
  }

  subscribeToUpdates(hospitalId: string, callback: (data: HospitalWaitTime) => void): () => void {
    if (!this.subscribers.has(hospitalId)) {
      this.subscribers.set(hospitalId, new Set());
    }

    const subscribers = this.subscribers.get(hospitalId)!;
    subscribers.add(callback);

    // Start polling for updates
    if (!this.intervals.has(hospitalId)) {
      const interval = setInterval(async () => {
        try {
          const data = await this.getWaitTimes([hospitalId]);
          if (data[hospitalId]) {
            subscribers.forEach(cb => cb(data[hospitalId]));
          }
        } catch (error) {
          console.error('Error polling wait times:', error);
        }
      }, this.updateInterval);

      this.intervals.set(hospitalId, interval);
    }

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        const interval = this.intervals.get(hospitalId);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(hospitalId);
        }
        this.subscribers.delete(hospitalId);
      }
    };
  }

  private simulateWaitTimeUpdate(hospitalId: string): HospitalWaitTime {
    const baseData = MOCK_HOSPITALS[hospitalId];
    if (!baseData) throw new Error('Hospital not found');

    const variation = Math.random() * 10 - 5; // Random variation between -5 and +5 minutes
    
    return {
      ...baseData,
      currentWait: Math.max(0, Math.round(baseData.currentWait + variation)),
      trend: variation > 0 ? 'increasing' : variation < 0 ? 'decreasing' : 'stable',
      lastUpdated: new Date()
    };
  }
}