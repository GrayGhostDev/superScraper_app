import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';

export class NetworkMonitor {
  private requests: Map<string, {
    url: string;
    method: string;
    headers: Record<string, string>;
    startTime: number;
    endTime?: number;
    status?: number;
    error?: string;
  }> = new Map();

  async attachToPage(page: Page | PuppeteerPage | WebDriver) {
    if ('on' in page) {
      // Playwright/Puppeteer
      page.on('request', request => {
        this.requests.set(request.url(), {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          startTime: Date.now()
        });
      });

      page.on('requestfinished', request => {
        const entry = this.requests.get(request.url());
        if (entry) {
          entry.endTime = Date.now();
          entry.status = request.response()?.status();
        }
      });

      page.on('requestfailed', request => {
        const entry = this.requests.get(request.url());
        if (entry) {
          entry.endTime = Date.now();
          entry.error = request.failure()?.errorText;
        }
      });
    } else {
      // Selenium - Limited network monitoring
      const cdp = await (page as any).createCDPConnection('page');
      await cdp.execute('Network.enable', {});
      
      cdp.on('Network.requestWillBeSent', (params: any) => {
        this.requests.set(params.request.url, {
          url: params.request.url,
          method: params.request.method,
          headers: params.request.headers,
          startTime: Date.now()
        });
      });
    }
  }

  getMetrics() {
    const metrics = {
      totalRequests: this.requests.size,
      successfulRequests: 0,
      failedRequests: 0,
      totalBytes: 0,
      averageResponseTime: 0
    };

    let totalTime = 0;
    let completedRequests = 0;

    for (const request of this.requests.values()) {
      if (request.endTime) {
        completedRequests++;
        totalTime += request.endTime - request.startTime;

        if (request.error) {
          metrics.failedRequests++;
        } else {
          metrics.successfulRequests++;
        }
      }
    }

    metrics.averageResponseTime = completedRequests > 0 
      ? totalTime / completedRequests 
      : 0;

    return metrics;
  }

  clear() {
    this.requests.clear();
  }
}