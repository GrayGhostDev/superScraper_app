import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { Browser, Page } from 'puppeteer';
import { ScraperConfig } from '../../types/scraper';
import { notifications } from '../../utils/notifications';

// Add plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export class PuppeteerManager {
  private browser: Browser | null = null;

  async initialize(config: ScraperConfig) {
    try {
      // Add recaptcha solver if configured
      if (config.captcha?.provider === '2captcha') {
        puppeteer.use(
          RecaptchaPlugin({
            provider: {
              id: '2captcha',
              token: config.captcha.apiKey
            }
          })
        );
      }

      this.browser = await puppeteer.launch({
        headless: config.headless ?? true,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          ...(config.proxy ? [`--proxy-server=${config.proxy.server}`] : [])
        ],
        defaultViewport: config.viewport,
        ignoreHTTPSErrors: !config.validateSSL
      });

      return this.browser;
    } catch (error) {
      console.error('Failed to initialize Puppeteer:', error);
      notifications.show('Failed to initialize Puppeteer', 'error');
      throw error;
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    // Set up request interception
    if (this.config?.interceptRequests) {
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (this.config?.blockResources?.includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });
    }

    return page;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}