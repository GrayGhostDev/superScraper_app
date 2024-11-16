export interface EnrichmentProvider {
  id: string;
  name: string;
  description: string;
  category: 'company' | 'contact' | 'identity' | 'demographics' | 'risk';
  requiresApiKey: boolean;
}

export interface EnrichmentConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  rateLimit?: number;
}

export interface EnrichmentResult {
  provider: string;
  timestamp: Date;
  data: any;
  status: 'success' | 'error';
  error?: string;
}

export const ENRICHMENT_PROVIDERS: EnrichmentProvider[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Company information, employee data, and professional insights',
    category: 'company',
    requiresApiKey: true
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Email verification and discovery',
    category: 'contact',
    requiresApiKey: true
  },
  {
    id: 'rocketreach',
    name: 'RocketReach',
    description: 'Professional contact information and social profiles',
    category: 'contact',
    requiresApiKey: true
  },
  {
    id: 'peopledatalabs',
    name: 'People Data Labs',
    description: 'Demographic and professional information',
    category: 'demographics',
    requiresApiKey: true
  },
  {
    id: 'lexisnexis',
    name: 'LexisNexis',
    description: 'Identity verification, background checks, and risk assessment',
    category: 'risk',
    requiresApiKey: true
  }
];