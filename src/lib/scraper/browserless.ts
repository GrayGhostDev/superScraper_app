import { notifications } from '../../utils/notifications';

interface BrowserlessOptions {
  url: string;
  token?: string;
  timeout?: number;
}

export class BrowserlessClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;

  constructor(options: BrowserlessOptions) {
    this.baseUrl = options.url || 'https://chrome.browserless.io';
    this.token = options.token || '';
    this.timeout = options.timeout || 30000;
  }

  async scrape(url: string, selectors: Record<string, string>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/scrape?token=${this.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          elements: selectors,
          timeout: this.timeout,
          waitFor: Object.values(selectors),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      notifications.show('Failed to scrape using browserless', 'error');
      throw error;
    }
  }

  async screenshot(url: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/screenshot?token=${this.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          options: {
            fullPage: true,
            type: 'jpeg',
            quality: 80,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      notifications.show('Failed to capture screenshot', 'error');
      throw error;
    }
  }

  async pdf(url: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/pdf?token=${this.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          options: {
            printBackground: true,
            format: 'A4',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      notifications.show('Failed to generate PDF', 'error');
      throw error;
    }
  }
}