import { notifications } from '../../../utils/notifications';

export class LinkedInEnricher {
  private apiKey: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async enrichCompanyData(companyName: string) {
    try {
      const response = await fetch(`${this.baseUrl}/companies?q=${encodeURIComponent(companyName)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch LinkedIn data');

      const data = await response.json();
      return {
        provider: 'linkedin',
        timestamp: new Date(),
        data,
        status: 'success' as const
      };
    } catch (error) {
      notifications.show('Failed to enrich data from LinkedIn', 'error');
      return {
        provider: 'linkedin',
        timestamp: new Date(),
        data: null,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}