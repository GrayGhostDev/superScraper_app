import { ScrapedData, ScraperConfig } from '../types/scraper';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import robotsParser from 'robots-parser';

export class WebScraper {
  private config: ScraperConfig;
  private visitedUrls: Set<string>;
  private rateLimiter: ReturnType<typeof pLimit>;
  private robotsTxtCache: Map<string, any>;
  private proxyUrl: string;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.visitedUrls = new Set();
    this.rateLimiter = pLimit(config.concurrent);
    this.robotsTxtCache = new Map();
    // Use a CORS proxy for development
    this.proxyUrl = 'https://api.allorigins.win/raw?url=';
  }

  async scrape(url: string, depth = 1): Promise<ScrapedData[]> {
    if (depth > this.config.depth || this.visitedUrls.has(url)) {
      return [];
    }

    if (!this.isAllowedDomain(url)) {
      return [];
    }

    if (this.config.respectRobotsTxt && !(await this.isAllowedByRobotsTxt(url))) {
      return [];
    }

    this.visitedUrls.add(url);
    const results: ScrapedData[] = [];

    try {
      const response = await fetch(this.proxyUrl + encodeURIComponent(url), {
        headers: {
          'User-Agent': this.config.userAgent,
          ...this.config.customHeaders
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      if (this.config.maxSize && html.length > this.config.maxSize) {
        throw new Error('Content size exceeds maximum allowed size');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const mainData: ScrapedData = {
        timestamp: new Date(),
        title: doc.title,
        text: await this.extractText(doc),
        links: await this.extractLinks(doc, url),
        images: await this.extractImages(doc),
        metadata: this.config.extractMetadata ? await this.extractMetadata(doc) : undefined,
        headers: Object.fromEntries(response.headers),
        statusCode: response.status,
        contentType: response.headers.get('content-type') || undefined,
        schema: this.config.parseScripts ? await this.extractStructuredData(doc) : undefined,
        performance: {
          size: html.length,
          loadTime: 0,
          resourceCount: doc.querySelectorAll('link, script, img').length
        }
      };

      results.push(mainData);

      if (this.config.followLinks && depth < this.config.depth) {
        const filteredLinks = this.filterLinks(mainData.links || []);
        const linkPromises = filteredLinks
          .map(link => () => this.rateLimiter(() => this.scrape(link, depth + 1)));
          
        const nestedResults = await Promise.all(
          linkPromises.map(promise => pRetry(promise, { retries: this.config.retries }))
        );
        results.push(...nestedResults.flat());
      }

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Scraping failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async extractText(doc: Document): Promise<string> {
    if (this.config.customSelectors?.text) {
      const element = doc.querySelector(this.config.customSelectors.text);
      return element?.textContent?.trim() || '';
    }

    // Remove script and style elements
    const clone = doc.cloneNode(true) as Document;
    clone.querySelectorAll('script, style').forEach(el => el.remove());
    return clone.body.textContent?.trim() || '';
  }

  private async extractLinks(doc: Document, baseUrl: string): Promise<string[]> {
    const selector = this.config.customSelectors?.links || 'a[href]';
    const links = new Set<string>();
    
    doc.querySelectorAll(selector).forEach(a => {
      try {
        const href = new URL(a.getAttribute('href') || '', baseUrl).toString();
        if (href.startsWith('http')) {
          links.add(href);
        }
      } catch {}
    });

    return Array.from(links);
  }

  private async extractImages(doc: Document): Promise<string[]> {
    const selector = this.config.customSelectors?.images || 'img[src]';
    const images = new Set<string>();
    
    doc.querySelectorAll(selector).forEach(img => {
      const src = img.getAttribute('src');
      if (src?.startsWith('http')) {
        images.add(src);
      }
    });

    return Array.from(images);
  }

  private async extractMetadata(doc: Document): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};
    
    // Extract meta tags
    doc.querySelectorAll('meta[property], meta[name]').forEach(meta => {
      const key = meta.getAttribute('property') || meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (key && content) {
        metadata[key] = content;
      }
    });

    // Extract OpenGraph and Twitter Card data
    const ogData = {};
    const twitterData = {};
    doc.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(meta => {
      const property = meta.getAttribute('property') || meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (property?.startsWith('og:')) {
        ogData[property.replace('og:', '')] = content;
      } else if (property?.startsWith('twitter:')) {
        twitterData[property.replace('twitter:', '')] = content;
      }
    });

    return {
      ...metadata,
      openGraph: ogData,
      twitterCard: twitterData
    };
  }

  private async extractStructuredData(doc: Document): Promise<Record<string, any> | undefined> {
    try {
      const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      const data = scripts.map(script => JSON.parse(script.textContent || ''));
      return data.length > 0 ? data[0] : undefined;
    } catch {
      return undefined;
    }
  }

  private async isAllowedByRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;
      
      if (!this.robotsTxtCache.has(robotsUrl)) {
        const response = await fetch(this.proxyUrl + encodeURIComponent(robotsUrl));
        const robotsTxt = await response.text();
        const robots = robotsParser(robotsUrl, robotsTxt);
        this.robotsTxtCache.set(robotsUrl, robots);
      }

      const robots = this.robotsTxtCache.get(robotsUrl);
      return robots.isAllowed(url, this.config.userAgent);
    } catch {
      return true;
    }
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

  private filterLinks(links: string[]): string[] {
    return links.filter(link => {
      if (this.config.excludePatterns?.length) {
        return !this.config.excludePatterns.some(pattern => 
          new RegExp(pattern).test(link)
        );
      }
      return true;
    });
  }
}