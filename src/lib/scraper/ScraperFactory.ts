import { WebScraper } from './WebScraper';
import { PlaywrightManager } from './PlaywrightManager';
import { PuppeteerManager } from './PuppeteerManager';
import { SeleniumManager } from './SeleniumManager';
import { ScraperOptions } from './types';
import { notifications } from '../../utils/notifications';

export class ScraperFactory {
  static async create(options: ScraperOptions): Promise<WebScraper> {
    try {
      let browserManager;

      switch (options.browser) {
        case 'playwright':
          browserManager = new PlaywrightManager();
          await browserManager.initialize(options);
          break;

        case 'puppeteer':
          browserManager = new PuppeteerManager();
          await browserManager.initialize(options);
          break;

        case 'selenium':
          browserManager = new SeleniumManager();
          await browserManager.initialize(options);
          break;

        default:
          throw new Error(`Unsupported browser type: ${options.browser}`);
      }

      return new WebScraper({
        ...options,
        browserManager
      });
    } catch (error) {
      console.error('Failed to create scraper:', error);
      notifications.show('Failed to initialize scraper', 'error');
      throw error;
    }
  }
}