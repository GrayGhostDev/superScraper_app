import { Page } from 'playwright';

export class PlaywrightUtils {
  static async scrollToBottom(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  static async waitForNetworkIdle(page: Page, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async getElementText(page: Page, selector: string): Promise<string> {
    try {
      await page.waitForSelector(selector, { state: 'visible' });
      return await page.$eval(selector, el => el.textContent?.trim() || '');
    } catch {
      return '';
    }
  }

  static async clickAndWaitForNavigation(page: Page, selector: string) {
    await Promise.all([
      page.waitForNavigation(),
      page.click(selector)
    ]);
  }

  static async interceptRequests(page: Page, patterns: string[]) {
    await page.route(patterns, route => {
      route.abort();
    });
  }

  static async injectScript(page: Page, script: string) {
    await page.addScriptTag({ content: script });
  }

  static async extractStructuredData(page: Page) {
    return await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts)
        .map(script => {
          try {
            return JSON.parse(script.textContent || '');
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    });
  }

  static async getAccessibilityTree(page: Page) {
    return await page.accessibility.snapshot();
  }

  static async getPerformanceMetrics(page: Page) {
    const metrics = await page.metrics();
    const timing = await page.evaluate(() => 
      JSON.stringify(window.performance.timing)
    );
    return { metrics, timing: JSON.parse(timing) };
  }

  static async getCoverage(page: Page) {
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    // Perform actions...

    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    return { jsCoverage, cssCoverage };
  }
}