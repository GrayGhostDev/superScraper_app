import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';
import { BrowserManager } from './BrowserManager';
import { RequestManager } from './RequestManager';
import { RateLimiter } from './services/RateLimiter';
import { ContentExtractor } from './ContentExtractor';
import { AIParser } from './AIParser';
import { FormHandler } from './FormHandler';
import { FormAnalyzer } from './services/FormAnalyzer';
import { ContentClassifier } from './services/ContentClassifier';
import { DataValidator } from './services/DataValidator';
import { ErrorHandler } from './services/ErrorHandler';
import { DataEnricher } from './DataEnricher';
import { DataAnalyzer } from '../analysis/DataAnalyzer';
import { ScraperConfig, ScrapedData } from '../../types/scraper';
import { notifications } from '../../utils/notifications';
import { AI_PROVIDERS } from '../../types/ai';

export class WebScraper {
  private browserManager: BrowserManager;
  private requestManager: RequestManager;
  private rateLimiter: RateLimiter;
  private contentExtractor: ContentExtractor;
  private aiParser: AIParser;
  private formHandler: FormHandler;
  private formAnalyzer: FormAnalyzer;
  private contentClassifier: ContentClassifier;
  private dataValidator: DataValidator;
  private errorHandler: ErrorHandler;
  private dataEnricher: DataEnricher;
  private dataAnalyzer: DataAnalyzer;
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.browserManager = new BrowserManager(config);
    this.requestManager = new RequestManager({
      requestsPerSecond: config.rateLimit || 2,
      maxRetries: config.retries || 3,
      timeout: config.timeout || 30000
    });
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: config.rateLimit || 2,
      burstSize: config.rateLimit ? config.rateLimit * 2 : 4,
      timeWindow: 1000
    });
    this.contentExtractor = new ContentExtractor();
    this.formHandler = new FormHandler();
    this.formAnalyzer = new FormAnalyzer();
    this.contentClassifier = new ContentClassifier();
    this.dataValidator = new DataValidator();
    this.errorHandler = new ErrorHandler();
    this.dataEnricher = new DataEnricher();
    this.dataAnalyzer = new DataAnalyzer();

    // Initialize AI parser with environment variables
    const aiProvider = AI_PROVIDERS.find(p => p.id === 'openai') || AI_PROVIDERS[0];
    this.aiParser = new AIParser(
      aiProvider,
      import.meta.env.VITE_OPENAI_API_KEY || '',
      0.7
    );
  }

  async scrape(url: string): Promise<ScrapedData[]> {
    await this.rateLimiter.waitForSlot();

    if (!this.isAllowedDomain(url)) {
      this.errorHandler.handleError(new Error('Domain not allowed'));
      throw new Error('Domain not allowed');
    }

    let browser;
    let page: Page | PuppeteerPage | WebDriver;

    try {
      const startTime = Date.now();
      browser = await this.browserManager.initializeBrowser();

      if (this.config.browser === 'selenium') {
        page = browser as WebDriver;
      } else {
        const context = await (browser as any).newContext({
          viewport: this.config.viewport,
          userAgent: this.config.userAgent,
          geolocation: this.config.geolocation,
          permissions: ['geolocation']
        });
        page = await context.newPage();
      }

      // Set up request interception if needed
      if (this.config.interceptRequests) {
        await this.setupRequestInterception(page);
      }

      // Navigate to URL with retry logic
      await this.navigateWithRetry(page, url);

      // Wait for content to load
      await this.waitForContent(page);

      // Extract basic content
      const content = await this.extractContent(page);

      // Process with AI
      const aiAnalysis = await this.aiParser.parseContent(content.text || '');

      // Extract structured content
      const structuredContent = await this.contentExtractor.extractStructuredContent(page);

      // Detect and analyze forms
      const forms = await this.formHandler.detectForms(page);
      const formAnalysis = await this.formAnalyzer.analyzeForms(page as Page);

      // Classify content
      const classification = await this.contentClassifier.classifyContent(content.text || '');

      // Validate data
      const validation = await this.dataValidator.validateData(content, 'content');

      // Enrich data
      const enrichment = await this.dataEnricher.enrichData(content);

      // Analyze data
      const analysis = await this.dataAnalyzer.analyzeData([content]);

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      const data: ScrapedData = {
        ...content,
        aiAnalysis,
        structuredContent,
        forms: formAnalysis,
        classification,
        validation,
        enrichment,
        analysis,
        timestamp: new Date(),
        performance: {
          size: content.text?.length || 0,
          loadTime,
          resourceCount: await this.getResourceCount(page)
        }
      };

      return [data];
    } catch (error) {
      this.errorHandler.handleError(error as Error, { url });
      throw error;
    } finally {
      await this.browserManager.closeAll();
    }
  }

  private async setupRequestInterception(page: any) {
    if ('route' in page) {
      // Playwright
      await page.route('**/*', route => {
        const request = route.request();
        if (this.shouldBlockRequest(request.resourceType())) {
          route.abort();
        } else {
          route.continue();
        }
      });
    } else if ('setRequestInterception' in page) {
      // Puppeteer
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (this.shouldBlockRequest(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }
  }

  private shouldBlockRequest(resourceType: string): boolean {
    if (!this.config.blockResources) return false;
    return this.config.blockResources.includes(resourceType);
  }

  private async navigateWithRetry(page: any, url: string, maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (this.config.browser === 'selenium') {
          await page.get(url);
        } else {
          await Promise.all([
            page.waitForNavigation({
              waitUntil: 'networkidle',
              timeout: this.config.navigationTimeout || 30000
            }),
            page.goto(url)
          ]);
        }
        return;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  private async waitForContent(page: any) {
    if (this.config.waitForSelectors) {
      for (const selector of this.config.waitForSelectors) {
        await page.waitForSelector(selector);
      }
    }

    if (this.config.waitForXPath) {
      for (const xpath of this.config.waitForXPath) {
        await page.waitForXPath(xpath);
      }
    }
  }

  private async extractContent(page: any) {
    return {
      title: await this.extractTitle(page),
      text: await this.extractText(page),
      links: await this.extractLinks(page),
      images: await this.extractImages(page),
      metadata: this.config.extractMetadata ? await this.extractMetadata(page) : undefined,
      schema: this.config.parseScripts ? await this.extractStructuredData(page) : undefined
    };
  }

  private async extractTitle(page: any): Promise<string> {
    return this.config.browser === 'selenium'
      ? await page.getTitle()
      : await page.title();
  }

  private async extractText(page: any): Promise<string> {
    if (this.config.customSelectors?.text) {
      return this.config.browser === 'selenium'
        ? await page.findElement({ css: this.config.customSelectors.text }).getText()
        : await page.$eval(this.config.customSelectors.text, (el: any) => el.textContent);
    }

    return this.config.browser === 'selenium'
      ? await page.findElement({ css: 'body' }).getText()
      : await page.$eval('body', (el: any) => el.textContent);
  }

  private async extractLinks(page: any): Promise<string[]> {
    const selector = this.config.customSelectors?.links || 'a[href]';
    
    if (this.config.browser === 'selenium') {
      const elements = await page.findElements({ css: selector });
      const links = await Promise.all(
        elements.map(el => el.getAttribute('href'))
      );
      return links.filter(Boolean);
    }

    return page.$$eval(selector, (links: any[]) => 
      links.map(link => link.href).filter(Boolean)
    );
  }

  private async extractImages(page: any): Promise<string[]> {
    const selector = this.config.customSelectors?.images || 'img[src]';

    if (this.config.browser === 'selenium') {
      const elements = await page.findElements({ css: selector });
      const images = await Promise.all(
        elements.map(el => el.getAttribute('src'))
      );
      return images.filter(Boolean);
    }

    return page.$$eval(selector, (images: any[]) => 
      images.map(img => img.src).filter(Boolean)
    );
  }

  private async extractMetadata(page: any): Promise<Record<string, any>> {
    return page.evaluate(() => {
      const metadata: Record<string, any> = {};
      const metaTags = document.querySelectorAll('meta[property], meta[name]');
      
      metaTags.forEach(tag => {
        const key = tag.getAttribute('property') || tag.getAttribute('name');
        const content = tag.getAttribute('content');
        if (key && content) {
          metadata[key] = content;
        }
      });

      return metadata;
    });
  }

  private async extractStructuredData(page: any): Promise<Record<string, any>> {
    return page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts)
        .map(script => {
          try {
            return JSON.parse(script.textContent || '');
          } catch {
            return null;
          }
        })
        .filter(Boolean)[0];
    });
  }

  private async getResourceCount(page: any): Promise<number> {
    if (this.config.browser === 'selenium') {
      return 0; // Not easily available in Selenium
    }
    return page.$$eval('link, script, img', (els: any[]) => els.length);
  }

  private isAllowedDomain(url: string): boolean {
    if (!this.config.allowedDomains?.length) return true;
    
    try {
      const urlObj = new URL(url);
      return this.config.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
}