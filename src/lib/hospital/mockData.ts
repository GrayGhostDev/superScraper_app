import { HospitalWaitTime } from '../../types/claims';

export const MOCK_HOSPITALS: Record<string, HospitalWaitTime> = {
  'hosp_001': {
    id: 'hosp_001',
    name: 'Corewell Health',
    currentWait: 45,
    trend: 'increasing',
    activeCases: 32,
    departments: {
      emergency: 15,
      urgent: 45,
      standard: 75
    },
    lastUpdated: new Date()
  },
  'hosp_002': {
    id: 'hosp_002',
    name: 'Detroit Medical Center',
    currentWait: 30,
    trend: 'stable',
    activeCases: 28,
    departments: {
      emergency: 10,
      urgent: 30,
      standard: 60
    },
    lastUpdated: new Date()
  },
  'hosp_003': {
    id: 'hosp_003',
    name: 'Ascension Health',
    currentWait: 60,
    trend: 'decreasing',
    activeCases: 45,
    departments: {
      emergency: 20,
      urgent: 60,
      standard: 90
    },
    lastUpdated: new Date()
  }
};