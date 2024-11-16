import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { ScraperConfig } from '../../types/scraper';
import { notifications } from '../../utils/notifications';

export class SeleniumManager {
  private driver: WebDriver | null = null;

  async initialize(config: ScraperConfig) {
    try {
      const builder = new Builder();
      const capabilities = new Capabilities();

      // Set up proxy if configured
      if (config.proxy) {
        capabilities.set('proxy', {
          proxyType: 'manual',
          httpProxy: config.proxy.server,
          sslProxy: config.proxy.server
        });
      }

      // Configure browser options
      if (config.browserType === 'firefox') {
        const options = new FirefoxOptions();
        options.headless(config.headless ?? true);
        options.windowSize(config.viewport);
        builder.setFirefoxOptions(options);
      } else {
        const options = new ChromeOptions();
        options.headless(config.headless ?? true);
        options.windowSize(config.viewport);
        options.addArguments(
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage'
        );
        builder.setChromeOptions(options);
      }

      this.driver = await builder
        .withCapabilities(capabilities)
        .forBrowser(config.browserType === 'firefox' ? 'firefox' : 'chrome')
        .build();

      return this.driver;
    } catch (error) {
      console.error('Failed to initialize Selenium:', error);
      notifications.show('Failed to initialize Selenium', 'error');
      throw error;
    }
  }

  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    if (!this.driver) {
      throw new Error('Driver not initialized');
    }
    return this.driver.executeScript<T>(script, ...args);
  }

  async close() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }
}