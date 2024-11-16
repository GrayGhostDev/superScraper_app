export interface ScraperOptions {
    // Browser selection
    browser: 'playwright' | 'puppeteer' | 'selenium';
    browserType?: 'chromium' | 'firefox' | 'webkit';
    headless?: boolean;
    
    // Authentication
    authentication?: {
      username: string;
      password: string;
      loginUrl: string;
      loginSelectors: {
        usernameInput: string;
        passwordInput: string;
        submitButton: string;
      };
      loginConfirmation?: string | RegExp;
    };
  
    // Captcha handling
    captcha?: {
      provider: '2captcha' | 'anticaptcha';
      apiKey: string;
      type?: 'recaptcha' | 'hcaptcha' | 'image';
      siteKey?: string;
    };
  
    // Proxy configuration
    proxy?: {
      server: string;
      username?: string;
      password?: string;
      rotationInterval?: number;
    };
  
    // Request handling
    timeout?: number;
    retries?: number;
    rateLimit?: number;
    maxConcurrent?: number;
  
    // Resource control
    blockResources?: string[];
    interceptRequests?: boolean;
    maxSize?: number;
  
    // Browser behavior
    viewport?: { width: number; height: number };
    userAgent?: string;
    cookies?: Record<string, string>;
    localStorage?: Record<string, string>;
    sessionStorage?: Record<string, string>;
  
    // Navigation
    waitForSelectors?: string[];
    waitForXPath?: string[];
    navigationTimeout?: number;
  
    // Data extraction
    extractMetadata?: boolean;
    parseScripts?: boolean;
    customSelectors?: Record<string, string>;
  
    // Monitoring
    logging?: {
      console?: boolean;
      network?: boolean;
      performance?: boolean;
      screenshots?: boolean;
    video?: boolean;
  };
}