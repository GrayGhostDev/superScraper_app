import { z } from 'zod';
import { notifications } from '../../../utils/notifications';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataValidator {
  private schemas: Map<string, z.ZodSchema> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  async validateData(data: any, type: string): Promise<ValidationResult> {
    try {
      const schema = this.schemas.get(type);
      if (!schema) {
        throw new Error(`No schema found for type: ${type}`);
      }

      const result = schema.safeParse(data);
      const warnings = this.checkWarnings(data, type);

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          warnings
        };
      }

      return {
        isValid: false,
        errors: result.error.errors.map(err => err.message),
        warnings
      };
    } catch (error) {
      console.error('Data validation error:', error);
      notifications.show('Failed to validate data', 'error');
      throw error;
    }
  }

  private initializeSchemas() {
    // Contact Information Schema
    this.schemas.set('contact', z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().regex(/^\+?[\d\s-()]+$/),
      address: z.string().optional()
    }));

    // Product Schema
    this.schemas.set('product', z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      description: z.string(),
      category: z.string(),
      images: z.array(z.string().url())
    }));

    // Form Schema
    this.schemas.set('form', z.object({
      action: z.string().url(),
      method: z.enum(['GET', 'POST']),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean()
      }))
    }));
  }

  private checkWarnings(data: any, type: string): string[] {
    const warnings: string[] = [];

    switch (type) {
      case 'contact':
        if (!data.phone?.startsWith('+')) {
          warnings.push('Phone number should include country code');
        }
        break;

      case 'product':
        if (data.description.length < 100) {
          warnings.push('Product description is quite short');
        }
        if (data.images.length === 0) {
          warnings.push('No product images provided');
        }
        break;

      case 'form':
        if (data.method === 'GET' && data.fields.length > 3) {
          warnings.push('Consider using POST method for forms with many fields');
        }
        break;
    }

    return warnings;
  }
}