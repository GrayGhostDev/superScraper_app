import { create } from 'zustand';
import { HospitalWaitTime } from '../types/claims';

interface HospitalState {
  waitTimes: Record<string, HospitalWaitTime>;
  updateWaitTime: (hospitalId: string, data: Partial<HospitalWaitTime>) => void;
  getAverageWaitTime: (hospitalId: string) => number;
  getEstimatedWaitTime: (hospitalId: string, severity: string) => number;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  waitTimes: {},
  
  updateWaitTime: (hospitalId, data) => 
    set(state => ({
      waitTimes: {
        ...state.waitTimes,
        [hospitalId]: {
          ...state.waitTimes[hospitalId],
          ...data,
          lastUpdated: new Date()
        }
      }
    })),

  getAverageWaitTime: (hospitalId) => {
    const hospital = get().waitTimes[hospitalId];
    if (!hospital) return 0;
    
    const { emergency, urgent, standard } = hospital.departments;
    return Math.round((emergency + urgent + standard) / 3);
  },

  getEstimatedWaitTime: (hospitalId, severity) => {
    const hospital = get().waitTimes[hospitalId];
    if (!hospital) return 0;

    const { activeCases, departments } = hospital;
    const baseTime = departments[severity === 'Critical' ? 'emergency' : 
                     severity === 'Severe' ? 'urgent' : 'standard'];

    // Adjust wait time based on active cases
    const multiplier = 1 + (activeCases * 0.1);
    return Math.round(baseTime * multiplier);
  }
}));