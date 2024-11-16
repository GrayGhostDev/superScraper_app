import { RateLimiter } from './RateLimiter';
import { ProxyRotator } from './ProxyRotator';
import { notifications } from '../../utils/notifications';

export class RequestManager {
  private rateLimiter: RateLimiter;
  private proxyRotator: ProxyRotator;
  private maxRetries: number;
  private timeout: number;

  constructor(config: {
    requestsPerSecond: number;
    maxRetries: number;
    timeout: number;
  }) {
    this.rateLimiter = new RateLimiter(config.requestsPerSecond);
    this.proxyRotator = new ProxyRotator();
    this.maxRetries = config.maxRetries;
    this.timeout = config.timeout;
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.rateLimiter.waitForSlot();

        const proxyUrl = this.proxyRotator.getProxyUrl();
        const response = await this.makeRequest(url, proxyUrl, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          this.proxyRotator.rotate();
        }
      }
    }

    notifications.show('Failed to fetch after multiple retries', 'error');
    throw lastError;
  }

  private async makeRequest(url: string, proxyUrl: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GrayGhostBot/1.0)',
          ...options.headers
        }
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  setRateLimit(requestsPerSecond: number): void {
    this.rateLimiter.setRateLimit(requestsPerSecond);
  }
}