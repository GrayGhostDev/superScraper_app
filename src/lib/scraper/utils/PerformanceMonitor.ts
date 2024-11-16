import { Page } from 'playwright';
import { Page as PuppeteerPage } from 'puppeteer';
import { WebDriver } from 'selenium-webdriver';

export class PerformanceMonitor {
  private metrics: {
    startTime: number;
    endTime?: number;
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
    timing?: PerformanceTiming;
    resourceCount?: number;
  } = {
    startTime: Date.now()
  };

  async start(page: Page | PuppeteerPage | WebDriver) {
    this.metrics.startTime = Date.now();

    if ('metrics' in page) {
      // Playwright/Puppeteer
      const client = await (page as any).target().createCDPSession();
      await client.send('Performance.enable');
      
      const performanceMetrics = await client.send('Performance.getMetrics');
      this.metrics.memory = {
        jsHeapSizeLimit: performanceMetrics.find((m: any) => m.name === 'JSHeapSizeLimit')?.value || 0,
        totalJSHeapSize: performanceMetrics.find((m: any) => m.name === 'TotalJSHeapSize')?.value || 0,
        usedJSHeapSize: performanceMetrics.find((m: any) => m.name === 'UsedJSHeapSize')?.value || 0
      };
    } else {
      // Selenium
      const timing = await page.executeScript('return window.performance.timing');
      this.metrics.timing = timing;
    }
  }

  async stop(page: Page | PuppeteerPage | WebDriver) {
    this.metrics.endTime = Date.now();

    if ('$$' in page) {
      // Playwright/Puppeteer
      this.metrics.resourceCount = (await page.$$('link, script, img')).length;
    } else {
      // Selenium
      this.metrics.resourceCount = await page.executeScript(
        'return document.querySelectorAll("link, script, img").length'
      );
    }

    return this.getMetrics();
  }

  getMetrics() {
    return {
      duration: this.metrics.endTime 
        ? this.metrics.endTime - this.metrics.startTime 
        : undefined,
      memory: this.metrics.memory,
      timing: this.metrics.timing,
      resourceCount: this.metrics.resourceCount
    };
  }
}