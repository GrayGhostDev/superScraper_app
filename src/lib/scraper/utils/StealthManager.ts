import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';

export class StealthManager {
  async applyEvasionTechniques(page: Page | PuppeteerPage | WebDriver) {
    if ('evaluateHandle' in page) {
      // Playwright/Puppeteer
      await this.applyBrowserEvasion(page as Page | PuppeteerPage);
    } else {
      // Selenium
      await this.applySeleniumEvasion(page as WebDriver);
    }
  }

  private async applyBrowserEvasion(page: Page | PuppeteerPage) {
    await page.evaluateHandle(() => {
      // Mask WebDriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });

      // Spoof plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {
              type: "application/x-google-chrome-pdf",
              suffixes: "pdf",
              description: "Portable Document Format",
              enabledPlugin: Plugin
            },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          }
        ]
      });

      // Spoof languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });

      // Spoof platform
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32'
      });
    });

    // Add random mouse movements
    await this.simulateHumanBehavior(page);
  }

  private async applySeleniumEvasion(driver: WebDriver) {
    await driver.executeScript(`
      // Similar evasion techniques for Selenium
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    `);
  }

  private async simulateHumanBehavior(page: Page | PuppeteerPage) {
    const viewportSize = await page.viewportSize();
    if (!viewportSize) return;

    // Random mouse movements
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * viewportSize.width);
      const y = Math.floor(Math.random() * viewportSize.height);
      await page.mouse.move(x, y, {
        steps: 10 // Make movement more human-like
      });
      await page.waitForTimeout(Math.random() * 1000);
    }
  }
}