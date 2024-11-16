import { chromium, firefox, webkit } from 'playwright-extra';
import type { Browser as PlaywrightBrowser } from 'playwright';
import { Browser as PuppeteerBrowser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { Builder, Browser as SeleniumBrowser } from 'selenium-webdriver';
import { ScraperConfig } from '../../types/scraper';
import { notifications } from '../../utils/notifications';
import { ProxyRotator } from './ProxyRotator';
import { WebDriver } from 'selenium-webdriver';

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export class BrowserManager {
  private browsers: Map<string, PlaywrightBrowser | PuppeteerBrowser | typeof SeleniumBrowser> = new Map();
  private config: ScraperConfig;
  private proxyRotator: ProxyRotator;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.proxyRotator = new ProxyRotator();
  }

  async initializeBrowser(type: string = 'default'): Promise<PlaywrightBrowser | PuppeteerBrowser | typeof SeleniumBrowser> {
    try {
      let browser;

      const proxyUrl = this.proxyRotator.getProxyUrl();
      const proxy = this.proxyRotator.getCurrentProxy();

      switch (this.config.browser) {
        case 'playwright':
          browser = await this.initializePlaywright(proxyUrl);
          break;
        case 'puppeteer':
          browser = await this.initializePuppeteer(proxyUrl);
          break;
        case 'selenium':
          browser = await this.initializeSelenium(proxy);
          break;
        default:
          throw new Error('Unsupported browser type');
      }

      this.browsers.set(type, browser);
      return browser;
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      notifications.show('Failed to initialize browser', 'error');
      throw error;
    }
  }

  private async initializePlaywright(proxyUrl: string): Promise<PlaywrightBrowser> {
    const browserType = this.config.browserType || 'chromium';
    const launchOptions = {
      headless: this.config.headless ?? true,
      proxy: {
        server: proxyUrl,
        bypass: 'localhost,127.0.0.1'
      },
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };

    switch (browserType) {
      case 'firefox':
        return firefox.launch(launchOptions);
      case 'webkit':
        return webkit.launch(launchOptions);
      default:
        return chromium.launch(launchOptions);
    }
  }

  private async initializePuppeteer(proxyUrl: string): Promise<PuppeteerBrowser> {
    if (this.config.captcha?.provider === '2captcha') {
      puppeteer.use(
        RecaptchaPlugin({
          provider: {
            id: '2captcha',
            token: this.config.captcha.apiKey
          }
        })
      );
    }

    return puppeteer.launch({
      headless: this.config.headless ?? true,
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        `--proxy-server=${proxyUrl}`
      ],
      defaultViewport: this.config.viewport
    });
  }

  private async initializeSelenium(proxy: any): Promise<typeof SeleniumBrowser> {
    const builder = new Builder();

    const proxyCapability = {
      'proxy': {
        'proxyType': 'manual',
        'httpProxy': `${proxy.host}:${proxy.port}`,
        'sslProxy': `${proxy.host}:${proxy.port}`,
        'socksUsername': proxy.username,
        'socksPassword': proxy.password
      }
    };

    builder.withCapabilities(proxyCapability);

    switch (this.config.browserType) {
      case 'firefox':
        return builder.forBrowser('firefox').build() as unknown as typeof SeleniumBrowser;
      default:
        return builder.forBrowser('chrome').build() as unknown as typeof SeleniumBrowser;
    }
  }

  async closeBrowser(type: string = 'default'): Promise<void> {
    const browser = this.browsers.get(type);
    if (browser) {
      if ('close' in browser) {
        await browser.close();
      } else {
        await (browser as unknown as WebDriver).quit();
      }
      this.browsers.delete(type);
    }
  }

  async closeAll(): Promise<void> {
    await Promise.all(
      Array.from(this.browsers.values()).map(browser => {
        if ('close' in browser) {
          return browser.close();
        }
        return (browser as unknown as WebDriver).quit();
      })
    );
    this.browsers.clear();
  }
}