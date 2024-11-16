import { z } from 'zod';

export interface FormData {
  basicInformation: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  locationDetails: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  incidentInformation: {
    date: string;
    time: string;
    description: string;
    witnesses: string[];
    type: string;
  };
  injuryDetails: {
    injuryType: string;
    bodyPart: string;
    severity: string;
    treatment: string;
    medicalProvider: string;
  };
  documentation: {
    photos: File[];
    documents: File[];
    additionalNotes: string;
  };
}

export const ValidationSchema = {
  basicInformation: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  }),
  locationDetails: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().min(1, 'Country is required'),
  }),
  incidentInformation: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    witnesses: z.array(z.string()),
    type: z.string().min(1, 'Incident type is required'),
  }),
  injuryDetails: z.object({
    injuryType: z.string().min(1, 'Injury type is required'),
    bodyPart: z.string().min(1, 'Body part is required'),
    severity: z.string().min(1, 'Severity is required'),
    treatment: z.string().min(1, 'Treatment is required'),
    medicalProvider: z.string().min(1, 'Medical provider is required'),
  }),
  documentation: z.object({
    photos: z.array(z.instanceof(File)),
    documents: z.array(z.instanceof(File)),
    additionalNotes: z.string(),
  }),
};