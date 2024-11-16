import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';
import { ScraperConfig } from '../../types/scraper';
import { notifications } from '../../utils/notifications';

export class AuthenticationManager {
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  async authenticate(
    page: Page | PuppeteerPage | WebDriver
  ): Promise<boolean> {
    if (!this.config.authentication) return true;

    try {
      const {
        loginUrl,
        loginSelectors,
        username,
        password,
        loginConfirmation
      } = this.config.authentication;

      if (!loginUrl || !loginSelectors || !username || !password) {
        throw new Error('Missing authentication configuration');
      }

      if (page instanceof WebDriver) {
        return this.authenticateSelenium(page);
      } else {
        return this.authenticateBrowser(page);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      notifications.show('Authentication failed', 'error');
      return false;
    }
  }

  private async authenticateBrowser(
    page: Page | PuppeteerPage
  ): Promise<boolean> {
    const {
      loginUrl,
      loginSelectors,
      username,
      password,
      loginConfirmation
    } = this.config.authentication!;

    // Navigate to login page
    await page.goto(loginUrl!);

    // Wait for username input
    await page.waitForSelector(loginSelectors!.usernameInput);

    // Type credentials
    await page.type(loginSelectors!.usernameInput, username!);
    await page.type(loginSelectors!.passwordInput, password!);

    // Submit form
    await Promise.all([
      page.waitForNavigation(),
      page.click(loginSelectors!.submitButton)
    ]);

    // Verify login success
    if (loginConfirmation) {
      if (typeof loginConfirmation === 'string') {
        await page.waitForSelector(loginConfirmation);
      } else {
        const content = await page.content();
        if (!loginConfirmation.test(content)) {
          throw new Error('Login confirmation failed');
        }
      }
    }

    return true;
  }

  private async authenticateSelenium(
    driver: WebDriver
  ): Promise<boolean> {
    const {
      loginUrl,
      loginSelectors,
      username,
      password,
      loginConfirmation
    } = this.config.authentication!;

    // Navigate to login page
    await driver.get(loginUrl!);

    // Type credentials
    await driver.findElement({ css: loginSelectors!.usernameInput })
      .sendKeys(username!);
    await driver.findElement({ css: loginSelectors!.passwordInput })
      .sendKeys(password!);

    // Submit form
    await driver.findElement({ css: loginSelectors!.submitButton }).click();

    // Verify login success
    if (loginConfirmation) {
      if (typeof loginConfirmation === 'string') {
        await driver.findElement({ css: loginConfirmation });
      } else {
        const content = await driver.getPageSource();
        if (!loginConfirmation.test(content)) {
          throw new Error('Login confirmation failed');
        }
      }
    }

    return true;
  }
}