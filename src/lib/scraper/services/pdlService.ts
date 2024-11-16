import PDLJS from 'peopledatalabs';
import { PDLSearchParams } from '../../types/pdl';
import { notifications } from '../../utils/notifications';

class PDLService {
  private client: PDLJS;
  private static instance: PDLService;

  private constructor() {
    this.client = new PDLJS({
      apiKey: import.meta.env.VITE_PDL_API_KEY || ''
    });
  }

  static getInstance(): PDLService {
    if (!PDLService.instance) {
      PDLService.instance = new PDLService();
    }
    return PDLService.instance;
  }

  async searchPeople(params: PDLSearchParams) {
    try {
      let sqlQuery = "SELECT * FROM person WHERE location_country = 'united states'";

      if (params.location) {
        sqlQuery += ` AND location_name LIKE '%${params.location}%'`;
      }
      if (params.industry) {
        sqlQuery += ` AND industry LIKE '%${params.industry}%'`;
      }
      if (params.company) {
        sqlQuery += ` AND company LIKE '%${params.company}%'`;
      }
      if (params.title) {
        sqlQuery += ` AND job_title LIKE '%${params.title}%'`;
      }

      const response = await this.client.person.search.sql({
        dataset: "all",
        searchQuery: sqlQuery,
        size: params.limit,
        pretty: true
      });

      return response.data.matches
        .filter(match => match.match_score >= params.minMatchScore)
        .map(match => ({
          ...match.data,
          match_score: match.match_score,
          matched_on: match.matched_on
        }));
    } catch (error) {
      console.error('PDL search error:', error);
      notifications.show('Failed to search people data', 'error');
      throw error;
    }
  }

  async enrichPerson(params: {
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
  }) {
    try {
      const response = await this.client.person.enrich({
        ...params,
        pretty: true,
        min_likelihood: 0.6
      });

      return response.data;
    } catch (error) {
      console.error('PDL enrich error:', error);
      notifications.show('Failed to enrich person data', 'error');
      throw error;
    }
  }

  async identifyPerson(params: {
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
  }) {
    try {
      const response = await this.client.person.identify({
        ...params,
        pretty: true
      });

      return response.data;
    } catch (error) {
      console.error('PDL identify error:', error);
      notifications.show('Failed to identify person', 'error');
      throw error;
    }
  }
}

export const pdlService = PDLService.getInstance();