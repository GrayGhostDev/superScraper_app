export interface PDLRecord {
    id: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    job_title?: string;
    company?: string;
    industry?: string;
    location_name?: string;
    match_score: number;
    matched_on?: string[];
    data?: any;
  }
  
  export interface PDLSearchParams {
    location?: string;
    industry?: string;
    company?: string;
    title?: string;
    minMatchScore: number;
    limit: number;
  }
  
  export interface PDLResponse {
    status: number;
    matches: {
      data: PDLRecord;
      match_score: number;
      matched_on: string[];
    }[];
  }
  
  export const DEFAULT_SEARCH_PARAMS: PDLSearchParams = {
    location: '',
    industry: '',
    company: '',
    title: '',
    minMatchScore: 0,
    limit: 10
  };