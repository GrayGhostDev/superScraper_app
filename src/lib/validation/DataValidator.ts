import { z } from 'zod';
import { ScrapingParametersSchema } from '../../types/claims';

export class DataValidator {
  validateRequiredFields(data: any): boolean {
    const requiredFields = [
      'claim_id',
      'policy_number',
      'incident_date',
      'claimant_info',
      'accident_details',
    ];
    return requiredFields.every((field) => field in data);
  }

  validateDataFormats(data: any): string[] {
    try {
      ScrapingParametersSchema.parse(data);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map((err) => err.message);
      }
      return ['Unknown validation error occurred'];
    }
  }

  static isValidPhone(phone: string): boolean {
    const pattern = /^\+?1?\d{9,15}$/;
    return pattern.test(phone);
  }

  static isValidEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }
}