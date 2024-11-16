import { notifications } from '../../../utils/notifications';

export class PeopleDataLabsEnricher {
  private apiKey: string;
  private baseUrl = 'https://api.peopledatalabs.com/v5';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async enrichPerson(params: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/person/enrich`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) throw new Error('Failed to fetch People Data Labs data');

      const data = await response.json();
      return {
        provider: 'peopledatalabs',
        timestamp: new Date(),
        data,
        status: 'success' as const
      };
    } catch (error) {
      notifications.show('Failed to enrich data from People Data Labs', 'error');
      return {
        provider: 'peopledatalabs',
        timestamp: new Date(),
        data: null,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}