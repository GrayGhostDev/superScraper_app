import { notifications } from '../../utils/notifications';

export class RateLimiter {
  private requestTimes: number[] = [];
  private requestsPerSecond: number;
  private timeWindow: number;

  constructor(requestsPerSecond: number = 2, timeWindow: number = 1000) {
    this.requestsPerSecond = requestsPerSecond;
    this.timeWindow = timeWindow;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.timeWindow);

    if (this.requestTimes.length >= this.requestsPerSecond) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.requestTimes.push(now);
  }

  setRateLimit(requestsPerSecond: number): void {
    this.requestsPerSecond = requestsPerSecond;
  }
}