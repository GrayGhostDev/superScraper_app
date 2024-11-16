import { z } from 'zod';

export enum ClaimType {
  AUTO = 'auto_accident',
  PERSONAL_INJURY = 'personal_injury',
  PROPERTY = 'property_damage',
}

export enum InjurySeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export interface HospitalWaitTime {
  id: string;
  name: string;
  currentWait: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  activeCases: number;
  departments: {
    emergency: number;
    urgent: number;
    standard: number;
  };
  lastUpdated: Date;
}
export interface ClaimData {
  id: string;
  value: number;
  processingTime: number;
  complexity: number;
  isOutlier: boolean;
}

export const ClaimantInfoSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  dob: z.string(),
  ssn: z.string().optional(),
  drivers_license: z.string().optional(),
});

export const AccidentDetailsSchema = z.object({
  location: z.string(),
  weather_conditions: z.string(),
  road_conditions: z.string(),
  time_of_day: z.string(),
  description: z.string(),
  police_report_number: z.string().optional(),
  responding_officers: z.array(z.string()),
  witnesses: z.array(z.string()),
});

export const VehicleInfoSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.string(),
  vin: z.string(),
  license_plate: z.string(),
  damage_description: z.string(),
  current_location: z.string(),
  mileage: z.string(),
});

export const InjuryDetailsSchema = z.object({
  type: z.string(),
  severity: z.nativeEnum(InjurySeverity),
  body_part: z.string(),
  treatment_facility: z.string(),
  treatment_date: z.date(),
  treating_physician: z.string(),
  diagnosis: z.string(),
  prognosis: z.string(),
});

export const PropertyDamageSchema = z.object({
  property_type: z.string(),
  damage_description: z.string(),
  estimated_value: z.number(),
  location: z.string(),
  ownership_status: z.string(),
});

export const InsuranceInfoSchema = z.object({
  policy_type: z.string(),
  coverage_limits: z.record(z.string(), z.number()),
  deductible: z.number(),
  policy_start_date: z.date(),
  policy_end_date: z.date(),
  prior_claims: z.array(z.string()),
});

export const HospitalWaitTimeSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentWait: z.number(),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  activeCases: z.number(),
  departments: z.object({
    emergency: z.number(),
    urgent: z.number(),
    standard: z.number()
  }),
  lastUpdated: z.date()
});

export const ScrapingParametersSchema = z.object({
  claim_id: z.string(),
  policy_number: z.string(),
  incident_date: z.date(),
  report_date: z.date(),
  claimant_info: ClaimantInfoSchema,
  accident_details: AccidentDetailsSchema,
  vehicle_info: VehicleInfoSchema.optional(),
  injury_details: z.array(InjuryDetailsSchema).optional(),
  property_damage: z.array(PropertyDamageSchema).optional(),
  insurance_info: InsuranceInfoSchema,
});

export type ClaimantInfo = z.infer<typeof ClaimantInfoSchema>;
export type AccidentDetails = z.infer<typeof AccidentDetailsSchema>;
export type VehicleInfo = z.infer<typeof VehicleInfoSchema>;
export type InjuryDetails = z.infer<typeof InjuryDetailsSchema>;
export type PropertyDamage = z.infer<typeof PropertyDamageSchema>;
export type InsuranceInfo = z.infer<typeof InsuranceInfoSchema>;
export type ScrapingParameters = z.infer<typeof ScrapingParametersSchema>;