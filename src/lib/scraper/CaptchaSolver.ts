import { TwoCaptcha } from '2captcha';
import { AntiCaptcha } from 'anticaptcha';
import { notifications } from '../../utils/notifications';

export class CaptchaSolver {
  private solver: TwoCaptcha | AntiCaptcha;
  private provider: '2captcha' | 'anticaptcha';

  constructor(provider: '2captcha' | 'anticaptcha', apiKey: string) {
    this.provider = provider;
    
    if (provider === '2captcha') {
      this.solver = new TwoCaptcha(apiKey);
    } else {
      this.solver = new AntiCaptcha(apiKey);
    }
  }

  async solveCaptcha(params: {
    type: 'recaptcha' | 'hcaptcha' | 'image';
    siteKey?: string;
    url?: string;
    imageBase64?: string;
  }): Promise<string> {
    try {
      let result: string;

      switch (params.type) {
        case 'recaptcha':
          result = await this.solveRecaptcha(params.siteKey!, params.url!);
          break;
        case 'hcaptcha':
          result = await this.solveHCaptcha(params.siteKey!, params.url!);
          break;
        case 'image':
          result = await this.solveImageCaptcha(params.imageBase64!);
          break;
        default:
          throw new Error('Unsupported captcha type');
      }

      return result;
    } catch (error) {
      console.error('Captcha solving error:', error);
      notifications.show('Failed to solve captcha', 'error');
      throw error;
    }
  }

  private async solveRecaptcha(siteKey: string, url: string): Promise<string> {
    if (this.provider === '2captcha') {
      const result = await this.solver.recaptcha({
        googlekey: siteKey,
        pageurl: url
      });
      return result.data;
    } else {
      const task = await this.solver.createTask({
        type: 'RecaptchaV2TaskProxyless',
        websiteURL: url,
        websiteKey: siteKey
      });
      const result = await this.solver.getTaskResult(task.taskId);
      return result.solution.gRecaptchaResponse;
    }
  }

  private async solveHCaptcha(siteKey: string, url: string): Promise<string> {
    if (this.provider === '2captcha') {
      const result = await this.solver.hcaptcha({
        sitekey: siteKey,
        pageurl: url
      });
      return result.data;
    } else {
      const task = await this.solver.createTask({
        type: 'HCaptchaTaskProxyless',
        websiteURL: url,
        websiteKey: siteKey
      });
      const result = await this.solver.getTaskResult(task.taskId);
      return result.solution.gRecaptchaResponse;
    }
  }

  private async solveImageCaptcha(imageBase64: string): Promise<string> {
    if (this.provider === '2captcha') {
      const result = await this.solver.normal({
        body: imageBase64,
        numeric: 0,
        min_len: 0,
        max_len: 0,
        phrase: 0,
        case: 0,
        calc: 0,
      });
      return result.data;
    } else {
      const task = await this.solver.createTask({
        type: 'ImageToTextTask',
        body: imageBase64,
      });
      const result = await this.solver.getTaskResult(task.taskId);
      return result.solution.text;
    }
  }
}