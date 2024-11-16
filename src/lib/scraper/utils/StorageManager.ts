import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';

export class StorageManager {
  async setLocalStorage(
    page: Page | PuppeteerPage | WebDriver,
    data: Record<string, string>
  ) {
    const script = Object.entries(data)
      .map(([key, value]) => 
        `localStorage.setItem('${key}', '${value}');`
      )
      .join('\n');

    if ('evaluate' in page) {
      // Playwright/Puppeteer
      await page.evaluate(script);
    } else {
      // Selenium
      await page.executeScript(script);
    }
  }

  async setSessionStorage(
    page: Page | PuppeteerPage | WebDriver,
    data: Record<string, string>
  ) {
    const script = Object.entries(data)
      .map(([key, value]) => 
        `sessionStorage.setItem('${key}', '${value}');`
      )
      .join('\n');

    if ('evaluate' in page) {
      // Playwright/Puppeteer
      await page.evaluate(script);
    } else {
      // Selenium
      await page.executeScript(script);
    }
  }

  async getLocalStorage(page: Page | PuppeteerPage | WebDriver) {
    if ('evaluate' in page) {
      // Playwright/Puppeteer
      return await page.evaluate(() => {
        const items: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            items[key] = localStorage.getItem(key) || '';
          }
        }
        return items;
      });
    } else {
      // Selenium
      return await page.executeScript(`
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            items[key] = localStorage.getItem(key);
          }
        }
        return items;
      `);
    }
  }

  async clearStorage(page: Page | PuppeteerPage | WebDriver) {
    if ('evaluate' in page) {
      // Playwright/Puppeteer
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } else {
      // Selenium
      await page.executeScript(`
        localStorage.clear();
        sessionStorage.clear();
      `);
    }
  }
}