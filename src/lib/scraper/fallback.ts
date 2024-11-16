import * as cheerio from 'cheerio';
import { notifications } from '../../utils/notifications';

export class FallbackScraper {
  private proxyUrl: string;

  constructor() {
    this.proxyUrl = 'https://api.allorigins.win/raw?url=';
  }

  async scrape(url: string, selectors: Record<string, string>): Promise<any> {
    try {
      const response = await fetch(this.proxyUrl + encodeURIComponent(url));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: Record<string, string> = {};

      for (const [key, selector] of Object.entries(selectors)) {
        results[key] = $(selector).text().trim();
      }

      return results;
    } catch (error) {
      notifications.show('Failed to scrape using fallback method', 'error');
      throw error;
    }
  }

  async extractMetadata(url: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(this.proxyUrl + encodeURIComponent(url));
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const metadata: Record<string, any> = {};
      
      // Extract meta tags
      $('meta').each((_, el) => {
        const name = $(el).attr('name') || $(el).attr('property');
        const content = $(el).attr('content');
        if (name && content) {
          metadata[name] = content;
        }
      });

      // Extract JSON-LD
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).html() || '');
          metadata.jsonLd = data;
        } catch {}
      });

      return metadata;
    } catch (error) {
      notifications.show('Failed to extract metadata', 'error');
      throw error;
    }
  }
}