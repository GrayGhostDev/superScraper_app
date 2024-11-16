import { z } from 'zod';

export const urlSchema = z.string().url('Please enter a valid URL');

export const configSchema = z.object({
  concurrent: z.number().min(1).max(10),
  timeout: z.number().min(1000),
  retries: z.number().min(0).max(5),
  userAgent: z.string().min(1),
  depth: z.number().min(1).max(5),
  followLinks: z.boolean(),
  respectRobotsTxt: z.boolean(),
  validateSSL: z.boolean(),
  extractMetadata: z.boolean(),
  parseScripts: z.boolean(),
  rateLimit: z.number().min(1),
  maxSize: z.number().optional(),
  allowedDomains: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  customHeaders: z.record(z.string()).optional(),
  proxyUrl: z.string().url().optional(),
  customSelectors: z.record(z.string()).optional(),
});

export const validateUrl = (url: string): string | null => {
  try {
    urlSchema.parse(url);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid URL';
  }
};

export const validateConfig = (config: unknown): string | null => {
  try {
    configSchema.parse(config);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid configuration';
  }
};