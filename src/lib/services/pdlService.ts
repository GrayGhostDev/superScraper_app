import { PDLSearchParams, PDLRecord } from '../../types/pdl';
import { notifications } from '../../utils/notifications';
import PDLJS from 'peopledatalabs';

class PDLService {
  private client: any;
  private static instance: PDLService;

  private constructor() {
    const apiKey = import.meta.env.VITE_PDL_API_KEY;
    if (!apiKey) {
      console.error('PDL API key is missing');
      notifications.show('PDL API key is missing', 'error');
    }
    this.client = new PDLJS(apiKey);
  }

  static getInstance(): PDLService {
    if (!PDLService.instance) {
      PDLService.instance = new PDLService();
    }
    return PDLService.instance;
  }

  async searchPeople(params: PDLSearchParams): Promise<PDLRecord[]> {
    try {
      // Debugging: Log the client object
      console.log('PDL Client:', this.client);
      console.log('PDL Client Person:', this.client.person);

      // Build search parameters
      const searchParams = {
        query: this.buildSearchQuery(params),
        size: params.limit,
        pretty: true,
        dataset: 'all'
      };

      // Use the correct search method
      const response = await this.client.person.search.elastic(searchParams);

      if (!response?.data) {
        throw new Error('Invalid response from PDL API');
      }

      return response.data
        .filter((record: any) => this.calculateMatchScore(record, params) >= params.minMatchScore)
        .map((record: any) => ({
          id: record.id || crypto.randomUUID(),
          full_name: `${record.first_name || ''} ${record.last_name || ''}`.trim(),
          first_name: record.first_name,
          last_name: record.last_name,
          job_title: record.job_title,
          company: record.company,
          industry: record.industry,
          location_name: record.location_name,
          match_score: this.calculateMatchScore(record, params),
          matched_on: this.getMatchedFields(record, params),
          data: record
        }));
    } catch (error) {
      console.error('PDL search error:', error);
      notifications.show('Failed to search PDL data', 'error');
      throw error;
    }
  }

  private buildSearchQuery(params: PDLSearchParams): string {
    const conditions: string[] = [];

    if (params.location) {
      conditions.push(`location:"${params.location}"`);
    }
    if (params.industry) {
      conditions.push(`industry:"${params.industry}"`);
    }
    if (params.company) {
      conditions.push(`company:"${params.company}"`);
    }
    if (params.title) {
      conditions.push(`title:"${params.title}"`);
    }

    return conditions.join(' AND ') || '*';
  }

  private calculateMatchScore(record: any, params: PDLSearchParams): number {
    let score = 0;
    let totalFields = 0;

    if (params.location && record.location_name) {
      totalFields++;
      if (record.location_name.toLowerCase().includes(params.location.toLowerCase())) {
        score++;
      }
    }

    if (params.industry && record.industry) {
      totalFields++;
      if (record.industry.toLowerCase().includes(params.industry.toLowerCase())) {
        score++;
      }
    }

    if (params.company && record.company) {
      totalFields++;
      if (record.company.toLowerCase().includes(params.company.toLowerCase())) {
        score++;
      }
    }

    if (params.title && record.job_title) {
      totalFields++;
      if (record.job_title.toLowerCase().includes(params.title.toLowerCase())) {
        score++;
      }
    }

    return totalFields > 0 ? (score / totalFields) * 100 : 100;
  }

  private getMatchedFields(record: any, params: PDLSearchParams): string[] {
    const matched: string[] = [];

    if (params.location && record.location_name?.toLowerCase().includes(params.location.toLowerCase())) {
      matched.push('location');
    }
    if (params.industry && record.industry?.toLowerCase().includes(params.industry.toLowerCase())) {
      matched.push('industry');
    }
    if (params.company && record.company?.toLowerCase().includes(params.company.toLowerCase())) {
      matched.push('company');
    }
    if (params.title && record.job_title?.toLowerCase().includes(params.title.toLowerCase())) {
      matched.push('job_title');
    }

    return matched;
  }

  async enrichPerson(params: {
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
  }) {
    try {
      const response = await this.client.person.enrich({
        first_name: params.first_name,
        last_name: params.last_name,
        company: params.company,
        email: params.email,
        min_likelihood: 6
      });

      return response.data;
    } catch (error) {
      console.error('PDL enrich error:', error);
      notifications.show('Failed to enrich person data', 'error');
      throw error;
    }
  }
}

export const pdlService = PDLService.getInstance();