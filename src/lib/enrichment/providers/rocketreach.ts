import { notifications } from '../../../utils/notifications';

export class RocketReachEnricher {
  private apiKey: string;
  private baseUrl = 'https://api.rocketreach.co/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async lookupPerson(name: string, company?: string) {
    try {
      const params = new URLSearchParams({
        name,
        ...(company && { current_employer: company })
      });

      const response = await fetch(`${this.baseUrl}/lookupProfile?${params}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch RocketReach data');

      const data = await response.json();
      return {
        provider: 'rocketreach',
        timestamp: new Date(),
        data,
        status: 'success' as const
      };
    } catch (error) {
      notifications.show('Failed to enrich data from RocketReach', 'error');
      return {
        provider: 'rocketreach',
        timestamp: new Date(),
        data: null,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}