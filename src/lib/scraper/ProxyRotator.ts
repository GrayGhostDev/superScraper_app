import { notifications } from '../../utils/notifications';

interface Proxy {
  host: string;
  port: number;
  username: string;
  password: string;
  protocol?: string;
  zone?: string;
}

export class ProxyRotator {
  private proxies: Proxy[];
  private currentIndex: number = 0;
  private lastRotation: number = 0;
  private rotationInterval: number;

  constructor(rotationInterval: number = 300000) { // 5 minutes default
    // Initialize with Brightdata proxy
    this.proxies = [{
      host: 'brd.superproxy.io',
      port: 22225,
      username: 'brd-customer-hl_bfaa9b16-zone-isp_proxy2',
      password: 'q408tp0dyy6a',
      protocol: 'http',
      zone: 'isp_proxy2'
    }];
    this.rotationInterval = rotationInterval;
  }

  getCurrentProxy(): Proxy {
    const now = Date.now();
    if (now - this.lastRotation >= this.rotationInterval) {
      this.rotate();
    }
    return this.proxies[this.currentIndex];
  }

  getProxyUrl(): string {
    const proxy = this.getCurrentProxy();
    const auth = proxy.username && proxy.password 
      ? `${proxy.username}:${proxy.password}@`
      : '';
    return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
  }

  getProxyConfig(): Record<string, any> {
    const proxy = this.getCurrentProxy();
    return {
      host: proxy.host,
      port: proxy.port,
      auth: {
        username: proxy.username,
        password: proxy.password
      },
      protocol: proxy.protocol
    };
  }

  rotate(): void {
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    this.lastRotation = Date.now();
    notifications.show('Rotating proxy', 'info');
  }

  addProxy(proxy: Proxy): void {
    this.proxies.push(proxy);
  }

  removeProxy(host: string): void {
    this.proxies = this.proxies.filter(p => p.host !== host);
    if (this.currentIndex >= this.proxies.length) {
      this.currentIndex = 0;
    }
  }

  getProxyCount(): number {
    return this.proxies.length;
  }

  getProxyStats(): Record<string, any> {
    return {
      totalProxies: this.proxies.length,
      currentProxy: this.getCurrentProxy().host,
      lastRotation: new Date(this.lastRotation),
      nextRotation: new Date(this.lastRotation + this.rotationInterval)
    };
  }
}