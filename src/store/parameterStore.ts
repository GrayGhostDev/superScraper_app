import { create } from 'zustand';
import { ClaimType, InjurySeverity, ScrapingParameters } from '../types/claims';

interface ParameterState {
  parameters: Partial<ScrapingParameters>;
  updateParameters: (section: keyof ScrapingParameters, data: any) => void;
  resetParameters: () => void;
  validateParameters: () => string[];
}

const initialState: Partial<ScrapingParameters> = {
  claim_id: '',
  policy_number: '',
  incident_date: new Date(),
  report_date: new Date(),
  claimant_info: {
    name: '',
    phone: '',
    email: '',
    address: '',
    dob: '',
    ssn: '',
    drivers_license: '',
  },
  accident_details: {
    location: '',
    weather_conditions: '',
    road_conditions: '',
    time_of_day: '',
    description: '',
    police_report_number: '',
    responding_officers: [],
    witnesses: [],
  },
  vehicle_info: {
    make: '',
    model: '',
    year: '',
    vin: '',
    license_plate: '',
    damage_description: '',
    current_location: '',
    mileage: '',
  },
  injury_details: [{
    type: '',
    severity: InjurySeverity.MINOR,
    body_part: '',
    treatment_facility: '',
    treatment_date: new Date(),
    treating_physician: '',
    diagnosis: '',
    prognosis: '',
  }],
  property_damage: [{
    property_type: '',
    damage_description: '',
    estimated_value: 0,
    location: '',
    ownership_status: '',
  }],
  insurance_info: {
    policy_type: '',
    coverage_limits: {},
    deductible: 0,
    policy_start_date: new Date(),
    policy_end_date: new Date(),
    prior_claims: [],
  },
};

export const useParameterStore = create<ParameterState>((set, get) => ({
  parameters: initialState,
  updateParameters: (section, data) =>
    set((state) => ({
      parameters: {
        ...state.parameters,
        [section]: {
          ...state.parameters[section],
          ...data,
        },
      },
    })),
  resetParameters: () => set({ parameters: initialState }),
  validateParameters: () => {
    const errors: string[] = [];
    const { parameters } = get();

    // Required field validation
    if (!parameters.claim_id) errors.push('Claim ID is required');
    if (!parameters.policy_number) errors.push('Policy number is required');
    if (!parameters.incident_date) errors.push('Incident date is required');

    // Claimant validation
    if (!parameters.claimant_info?.name) errors.push('Claimant name is required');
    if (parameters.claimant_info?.email && !isValidEmail(parameters.claimant_info.email)) {
      errors.push('Invalid email format');
    }
    if (parameters.claimant_info?.phone && !isValidPhone(parameters.claimant_info.phone)) {
      errors.push('Invalid phone format');
    }

    // Date validations
    if (parameters.incident_date && parameters.incident_date > new Date()) {
      errors.push('Incident date cannot be in the future');
    }

    return errors;
  },
}));

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-()]+$/.test(phone);
}