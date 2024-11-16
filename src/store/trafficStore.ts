import { create } from 'zustand';

interface TrafficData {
  incidents: number;
  lastUpdated: Date;
  severity: {
    minor: number;
    moderate: number;
    major: number;
    severe: number;
  };
}

interface TrafficState {
  trafficData: TrafficData;
  updateTrafficData: (data: TrafficData) => void;
}

export const useTrafficStore = create<TrafficState>((set) => ({
  trafficData: {
    incidents: 0,
    lastUpdated: new Date(),
    severity: {
      minor: 0,
      moderate: 0,
      major: 0,
      severe: 0
    }
  },
  updateTrafficData: (data) => set({ trafficData: data })
}));