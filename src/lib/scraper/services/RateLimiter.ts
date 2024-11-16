import { notifications } from '../../../utils/notifications';

interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize?: number;
  timeWindow?: number;
}

export class RateLimiter {
  private requestTimes: number[] = [];
  private config: Required<RateLimitConfig>;
  private tokenBucket: {
    tokens: number;
    lastRefill: number;
  };

  constructor(config: RateLimitConfig) {
    this.config = {
      requestsPerSecond: config.requestsPerSecond,
      burstSize: config.burstSize || config.requestsPerSecond * 2,
      timeWindow: config.timeWindow || 1000
    };

    this.tokenBucket = {
      tokens: this.config.burstSize,
      lastRefill: Date.now()
    };
  }

  async waitForSlot(): Promise<void> {
    try {
      await this.waitForToken();
      this.recordRequest();
    } catch (error) {
      console.error('Rate limiting error:', error);
      notifications.show('Rate limit exceeded', 'error');
      throw error;
    }
  }

  private async waitForToken(): Promise<void> {
    const now = Date.now();
    this.refillTokens(now);

    if (this.tokenBucket.tokens < 1) {
      const waitTime = Math.ceil(
        (1 - this.tokenBucket.tokens) * (1000 / this.config.requestsPerSecond)
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refillTokens(Date.now());
    }

    this.tokenBucket.tokens -= 1;
  }

  private refillTokens(now: number): void {
    const timePassed = now - this.tokenBucket.lastRefill;
    const newTokens = (timePassed / 1000) * this.config.requestsPerSecond;
    
    this.tokenBucket.tokens = Math.min(
      this.config.burstSize,
      this.tokenBucket.tokens + newTokens
    );
    this.tokenBucket.lastRefill = now;
  }

  private recordRequest(): void {
    const now = Date.now();
    this.requestTimes = [
      ...this.requestTimes.filter(time => now - time < this.config.timeWindow),
      now
    ];
  }

  getMetrics() {
    return {
      requestsInWindow: this.requestTimes.length,
      availableTokens: this.tokenBucket.tokens,
      isThrottled: this.tokenBucket.tokens < 1
    };
  }
}