import axios from 'axios';
import PDLJS from 'peopledatalabs';
import { 
  PDLSearchParams, 
  PDLRecord, 
  PDLResponse, 
  PDLResponseHeaders,
  PDLErrorResponse,
  PDLEnrichmentParams,
  PDLCompanyParams
} from '../../types/pdl';
import { notifications } from '../../utils/notifications';

class PDLService {
  private static instance: PDLService;
  private readonly client: any;
  private rateLimits: PDLResponseHeaders | null = null;
  private readonly MAX_RESPONSE_SIZE = 1024 * 1024; // 1MB

  private constructor() {
    const apiKey = import.meta.env.VITE_PDL_API_KEY;
    if (!apiKey) {
      console.error('PDL API key is missing');
      notifications.show('PDL API key is missing', 'error');
    }
    this.client = new PDLJS({ apiKey });
  }

  static getInstance(): PDLService {
    if (!PDLService.instance) {
      PDLService.instance = new PDLService();
    }
    return PDLService.instance;
  }

  private updateRateLimits(headers: PDLResponseHeaders) {
    this.rateLimits = headers;
    
    if (headers['x-totallimit-remaining'] === 0) {
      notifications.show('API credit limit reached', 'error');
    } else if (headers['x-totallimit-remaining'] < 100) {
      notifications.show(`Low on API credits: ${headers['x-totallimit-remaining']} remaining`, 'warning');
    }

    if (headers['x-ratelimit-remaining'].minute === 0) {
      const resetTime = new Date(headers['x-ratelimit-reset']);
      notifications.show(`Rate limit reached. Resets at ${resetTime.toLocaleTimeString()}`, 'warning');
    }
  }

  private handleError(error: any): never {
    const pdlError = error.response?.data as PDLErrorResponse;
    
    if (pdlError?.error) {
      switch (pdlError.status) {
        case 400:
          notifications.show('Invalid request parameters', 'error');
          throw new Error('Invalid request parameters');
        
        case 401:
          notifications.show('Invalid API key', 'error');
          throw new Error('Invalid API key');
        
        case 402:
          notifications.show('API credit limit exceeded', 'error');
          throw new Error('API credit limit exceeded');
        
        case 404:
          // Not technically an error, just no results found
          return [] as any;
        
        case 405:
          notifications.show('Invalid request method', 'error');
          throw new Error('Invalid request method');
        
        case 429:
          const resetTime = new Date(error.response.headers['x-ratelimit-reset']);
          notifications.show(`Rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`, 'error');
          throw new Error('Rate limit exceeded');
        
        default:
          if (pdlError.status >= 500) {
            notifications.show('PDL API service error', 'error');
            throw new Error('PDL API service error');
          }
          notifications.show(pdlError.error.message, 'error');
          throw new Error(pdlError.error.message);
      }
    }

    // Generic error handling
    notifications.show('Failed to process request', 'error');
    throw error;
  }

  getRateLimits() {
    return this.rateLimits;
  }

  private buildSearchQuery(params: PDLSearchParams): string {
    const conditions = ['location_country = \'united states\''];

    if (params.location) {
      conditions.push(`location_region ILIKE '%${params.location}%'`);
    }

    if (params.industry) {
      conditions.push(`industry ILIKE '%${params.industry}%'`);
    }

    if (params.company) {
      conditions.push(`job_company_name ILIKE '%${params.company}%'`);
    }

    if (params.title) {
      conditions.push(`job_title ILIKE '%${params.title}%'`);
    }

    return `SELECT * FROM person WHERE ${conditions.join(' AND ')}`;
  }

  async searchPeople(params: PDLSearchParams): Promise<PDLRecord[]> {
    try {
      const searchParams = {
        sql: this.buildSearchQuery(params),
        size: params.limit || 50,
        dataset: "all",
        pretty: true
      };

      const response = await this.client.person.search.sql(searchParams);

      if (!response?.data) {
        return [];
      }

      this.updateRateLimits(response.headers);

      return response.data.map((record: any) => ({
        id: record.id || crypto.randomUUID(),
        full_name: `${record.first_name || ''} ${record.last_name || ''}`.trim(),
        first_name: record.first_name,
        last_name: record.last_name,
        job_title: record.job_title,
        company: record.job_company_name,
        industry: record.industry,
        location_name: record.location_name,
        match_score: this.calculateMatchScore(record, params),
        matched_on: this.getMatchedFields(record, params),
        data: record
      }));
    } catch (error) {
      return this.handleError(error);
    }
  }

  async enrichPerson(params: PDLEnrichmentParams) {
    try {
      const response = await this.client.person.enrichment(params);
      this.updateRateLimits(response.headers);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async enrichCompany(params: PDLCompanyParams) {
    try {
      const response = await this.client.company.enrichment(params);
      this.updateRateLimits(response.headers);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
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

    if (params.company && record.job_company_name) {
      totalFields++;
      if (record.job_company_name.toLowerCase().includes(params.company.toLowerCase())) {
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
    if (params.company && record.job_company_name?.toLowerCase().includes(params.company.toLowerCase())) {
      matched.push('company');
    }
    if (params.title && record.job_title?.toLowerCase().includes(params.title.toLowerCase())) {
      matched.push('job_title');
    }

    return matched;
  }
}

export const pdlService = PDLService.getInstance();