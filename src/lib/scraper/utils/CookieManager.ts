import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';

export class CookieManager {
  async setCookies(
    page: Page | PuppeteerPage | WebDriver,
    cookies: Record<string, string>
  ) {
    if ('setCookie' in page) {
      // Playwright/Puppeteer
      await Promise.all(
        Object.entries(cookies).map(([name, value]) =>
          page.setCookie({
            name,
            value,
            domain: new URL(page.url()).hostname,
            path: '/'
          })
        )
      );
    } else {
      // Selenium
      const cookieScript = Object.entries(cookies)
        .map(([name, value]) => 
          `document.cookie = "${name}=${value}; path=/";`
        )
        .join('\n');
      await page.executeScript(cookieScript);
    }
  }

  async getCookies(page: Page | PuppeteerPage | WebDriver) {
    if ('cookies' in page) {
      // Playwright/Puppeteer
      return await page.cookies();
    } else {
      // Selenium
      return await page.executeScript(
        'return document.cookie.split("; ").reduce((acc, curr) => { const [name, value] = curr.split("="); acc[name] = value; return acc; }, {});'
      );
    }
  }

  async clearCookies(page: Page | PuppeteerPage | WebDriver) {
    if ('deleteCookie' in page) {
      // Playwright/Puppeteer
      const cookies = await page.cookies();
      await Promise.all(
        cookies.map(cookie => 
          page.deleteCookie({ 
            name: cookie.name,
            domain: cookie.domain
          })
        )
      );
    } else {
      // Selenium
      await page.executeScript('document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));');
    }
  }
}