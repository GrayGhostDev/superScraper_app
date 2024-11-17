export interface PDLError {
    type: 'invalid_request_error' | 'authentication_error' | 'payment_required' | 'rate_limit_error' | 'api_error' | 'not_found';
    message: string;
  }
  
  export interface PDLErrorResponse {
    status: number;
    error: PDLError;
  }
  
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
    data_include?: string[];
  }
  
  export interface PDLRateLimits {
    minute?: number;
    day?: number;
    month?: number;
  }
  
  export interface PDLResponseHeaders {
    'x-call-credits-spent': number;
    'x-call-credits-type': 'enrich' | 'search' | 'search_company' | 'enrich_company' | 'enrich_skill' | 'enrich_job_title' | 'preview_search' | 'person_identify';
    'x-ratelimit-reset': string;
    'x-ratelimit-remaining': PDLRateLimits;
    'x-ratelimit-limit': PDLRateLimits;
    'x-lifetime-used': number;
    'x-totallimit-remaining': number;
    'x-totallimit-purchased-remaining': number;
    'x-totallimit-overages-remaining': number;
  }
  
  export interface PDLResponse {
    status: number;
    data: any[];
    total?: number;
    headers: PDLResponseHeaders;
  }
  
  export interface PDLEnrichmentParams {
    first_name?: string;
    last_name?: string;
    email?: string;
    company?: string;
    profile?: string;
    data_include?: string[];
  }
  
  export interface PDLCompanyParams {
    website?: string;
    name?: string;
    profile?: string;
    data_include?: string[];
  }
  
  export interface PDLSchoolParams {
    name?: string;
    profile?: string;
  }
  
  export const DEFAULT_SEARCH_PARAMS: PDLSearchParams = {
    location: '',
    industry: '',
    company: '',
    title: '',
    minMatchScore: 0,
    limit: 50
  };