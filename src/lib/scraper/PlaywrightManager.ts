import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright-extra';
import { ScraperConfig } from '../../types/scraper';
import { notifications } from '../../utils/notifications';

export class PlaywrightManager {
  private browsers: Record<string, Browser> = {};
  private contexts: Record<string, BrowserContext> = {};

  async initBrowser(type: 'chromium' | 'firefox' | 'webkit' = 'chromium', config: ScraperConfig) {
    if (this.browsers[type]) return;

    try {
      const browser = await (type === 'firefox' ? firefox :
                           type === 'webkit' ? webkit :
                           chromium).launch({
        headless: config.headless ?? true,
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ],
        proxy: config.proxy
      });

      const context = await browser.newContext({
        viewport: config.viewport,
        userAgent: config.userAgent,
        geolocation: config.geolocation,
        permissions: ['geolocation'],
        bypassCSP: true,
        ignoreHTTPSErrors: !config.validateSSL,
        recordVideo: config.logging?.video ? { dir: 'videos/' } : undefined,
        recordHar: config.logging?.network ? { path: `logs/${type}-recording.har` } : undefined
      });

      // Set up request interception if needed
      if (config.interceptRequests) {
        await context.route('**/*', route => {
          const request = route.request();
          if (config.blockResources?.includes(request.resourceType())) {
            route.abort();
          } else {
            route.continue();
          }
        });
      }

      // Set up storage state if provided
      if (config.localStorage || config.sessionStorage) {
        await context.addInitScript(`
          window.localStorage.clear();
          window.sessionStorage.clear();
          ${Object.entries(config.localStorage || {}).map(([k, v]) => 
            `window.localStorage.setItem('${k}', '${v}');`
          ).join('\n')}
          ${Object.entries(config.sessionStorage || {}).map(([k, v]) => 
            `window.sessionStorage.setItem('${k}', '${v}');`
          ).join('\n')}
        `);
      }

      // Set up console logging
      if (config.logging?.console) {
        context.on('console', msg => {
          console.log(`[${type}] Console ${msg.type()}: ${msg.text()}`);
        });
      }

      // Set up error logging
      context.on('page', page => {
        page.on('pageerror', error => {
          console.error(`[${type}] Page Error:`, error);
        });

        page.on('requestfailed', request => {
          console.error(`[${type}] Failed request:`, request.url());
        });
      });

      this.browsers[type] = browser;
      this.contexts[type] = context;

    } catch (error) {
      console.error(`Failed to initialize ${type} browser:`, error);
      notifications.show(`Failed to initialize ${type} browser`, 'error');
      throw error;
    }
  }

  async getPage(type: 'chromium' | 'firefox' | 'webkit' = 'chromium'): Promise<Page> {
    const context = this.contexts[type];
    if (!context) {
      throw new Error(`Browser context for ${type} not initialized`);
    }
    return await context.newPage();
  }

  async closeAll() {
    await Promise.all(
      Object.values(this.browsers).map(browser => browser.close())
    );
    this.browsers = {};
    this.contexts = {};
  }
}