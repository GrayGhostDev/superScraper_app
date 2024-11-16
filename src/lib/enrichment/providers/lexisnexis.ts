import { notifications } from '../../../utils/notifications';

export class LexisNexisEnricher {
  private apiKey: string;
  private baseUrl = 'https://api.lexisnexis.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async performRiskAssessment(params: {
    name: string;
    dateOfBirth?: string;
    ssn?: string;
    address?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/risk/assessment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) throw new Error('Failed to fetch LexisNexis data');

      const data = await response.json();
      return {
        provider: 'lexisnexis',
        timestamp: new Date(),
        data,
        status: 'success' as const
      };
    } catch (error) {
      notifications.show('Failed to enrich data from LexisNexis', 'error');
      return {
        provider: 'lexisnexis',
        timestamp: new Date(),
        data: null,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}