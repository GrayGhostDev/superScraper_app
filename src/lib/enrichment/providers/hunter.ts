import { notifications } from '../../../utils/notifications';

export class HunterEnricher {
  private apiKey: string;
  private baseUrl = 'https://api.hunter.io/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async findEmailsByDomain(domain: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/domain-search?domain=${domain}&api_key=${this.apiKey}`
      );

      if (!response.ok) throw new Error('Failed to fetch Hunter.io data');

      const data = await response.json();
      return {
        provider: 'hunter',
        timestamp: new Date(),
        data,
        status: 'success' as const
      };
    } catch (error) {
      notifications.show('Failed to enrich data from Hunter.io', 'error');
      return {
        provider: 'hunter',
        timestamp: new Date(),
        data: null,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}