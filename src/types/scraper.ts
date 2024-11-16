import { z } from 'zod';

export interface ScrapeJob {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  dataCollected?: number;
  error?: string;
  data?: ScrapedData[];
  selector?: string;
  dataSchema?: z.ZodSchema;
  performance?: {
    requestTime: number;
    processingTime: number;
    memoryUsage: number;
  };
}

export interface ScrapedData {
  title?: string;
  text?: string;
  links?: string[];
  images?: string[];
  timestamp: Date;
  url?: string;
  metadata?: Record<string, any>;
  headers?: Record<string, string>;
  statusCode?: number;
  contentType?: string;
  schema?: Record<string, any>;
  performance?: {
    size: number;
    loadTime: number;
    resourceCount: number;
  };
  screenshots?: string[];
  pdf?: string;
  cookies?: Record<string, any>;
  console?: string[];
  network?: {
    requests: number;
    dataTransferred: number;
    errors: number;
  };
  accessibility?: {
    violations: any[];
    score: number;
  };
  structuredContent?: {
    mainContent: {
      sentences: string[];
      paragraphs: {
        text: string;
        wordCount: number;
      }[];
    };
    pricing: {
      raw: string;
      value: number;
    }[];
    dates: string[];
    locations: string[];
    contactInfo: {
      phones: string[];
      emails: string[];
    };
    socialMedia: {
      platform: string;
      url: string;
    }[];
    tables: {
      headers: string[];
      rows: string[][];
    }[];
    lists: {
      type: string;
      items: string[];
    }[];
    keywords: {
      term: string;
      score: number;
    }[];
    fileDownloads: {
      url: string;
      text: string;
      type: string;
    }[];
    microdata: {
      type: string;
      properties: Record<string, string>;
    }[];
    openGraph: Record<string, string>;
  };
}

export interface ScraperConfig {
  // Browser settings
  browser: 'playwright' | 'puppeteer' | 'selenium';
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  
  // Authentication
  authentication?: {
    username?: string;
    password?: string;
    loginUrl?: string;
    loginSelectors?: {
      usernameInput: string;
      passwordInput: string;
      submitButton: string;
    };
    loginConfirmation?: string | RegExp;
  };

  export interface ScrapedData {
    // Previous properties remain the same
    
    forms?: {
      action?: string;
      method?: string;
      fields: {
        name: string;
        type: string;
        label?: string;
        required?: boolean;
        options?: string[];
        placeholder?: string;
      }[];
    }[];
    
    aiAnalysis?: {
      entities: {
        names: string[];
        emails: string[];
        phones: string[];
        addresses: string[];
      };
      forms: {
        action?: string;
        method?: string;
        fields: {
          name: string;
          type: string;
          label?: string;
          required?: boolean;
          options?: string[];
          placeholder?: string;
        }[];
      }[];
      relevantText: string[];
      confidence: number;

  // Captcha settings
  captcha?: {
    provider: '2captcha' | 'anticaptcha';
    apiKey: string;
    type?: 'recaptcha' | 'hcaptcha' | 'image';
    siteKey?: string;
  };

  // Proxy settings
  proxy?: {
    host: string;
    port: number;
    username: string;
    password: string;
    protocol?: string;
  };

  // Rate limiting
  rateLimit: number;
  concurrent: number;
  timeout: number;
  retries: number;

  // Navigation
  depth: number;
  followLinks: boolean;
  maxNavigationTime?: number;
  waitForSelectors?: string[];
  waitForXPath?: string[];
  navigationTimeout?: number;

  // Content settings
  maxSize?: number;
  allowedDomains?: string[];
  excludePatterns?: string[];
  customSelectors?: Record<string, string>;
  extractMetadata: boolean;
  parseScripts?: boolean;

  // Headers and cookies
  customHeaders?: Record<string, string>;
  cookies?: Record<string, string>;

  // Resource handling
  blockResources?: string[];
  interceptRequests?: boolean;
  cacheEnabled?: boolean;

  // Privacy and security
  validateSSL: boolean;
  respectRobotsTxt: boolean;
  stealth?: boolean;
  anonymizeProxy?: boolean;

  // Advanced features
  javascript?: boolean;
  emulateDevice?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;

  // Monitoring
  performance?: {
    enableMetrics: boolean;
    sampleRate: number;
    maxMemoryUsage: number;
  };
  logging?: {
    console: boolean;
    network: boolean;
    performance: boolean;
  };

  // Output
  captureScreenshots?: boolean;
  generatePDF?: boolean;
  captureCookies?: boolean;
  captureConsole?: boolean;
  networkAnalysis?: boolean;
  checkAccessibility?: boolean;
  scrollToBottom?: boolean;
}