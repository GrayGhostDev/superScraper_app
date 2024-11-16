import { useEffect, useState } from 'react';
import { trafficService } from '../lib/services/trafficService';
import { webSocketService } from '../lib/services/webSocketService';
import { useTrafficStore } from '../store/trafficStore';
import { notifications } from '../utils/notifications';

interface TrafficBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const useTrafficMonitoring = (bounds?: TrafficBounds) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { updateTrafficData } = useTrafficStore();

  useEffect(() => {
    if (!bounds) return;

    const startMonitoring = async () => {
      setIsMonitoring(true);
      try {
        // Initial fetch
        const incidents = await trafficService.getTrafficIncidents(bounds);
        updateTrafficData({
          incidents: incidents.length,
          lastUpdated: new Date(),
          severity: {
            minor: incidents.filter(i => i.severity === 'minor').length,
            moderate: incidents.filter(i => i.severity === 'moderate').length,
            major: incidents.filter(i => i.severity === 'major').length,
            severe: incidents.filter(i => i.severity === 'severe').length
          }
        });

        // Set up WebSocket connection
        webSocketService.connect({
          url: 'wss://your-websocket-server.com',
          options: {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
          }
        });

        // Subscribe to real-time updates
        const unsubscribe = webSocketService.subscribe('traffic', (data) => {
          updateTrafficData(data);
        });

        // Start real-time monitoring
        const cleanup = trafficService.startRealtimeUpdates(bounds);

        return () => {
          cleanup();
          unsubscribe();
          webSocketService.disconnect();
          setIsMonitoring(false);
        };
      } catch (error) {
        console.error('Failed to start traffic monitoring:', error);
        notifications.show('Failed to start traffic monitoring', 'error');
        setIsMonitoring(false);
      }
    };

    const cleanup = startMonitoring();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [bounds]);

  return { isMonitoring };
};