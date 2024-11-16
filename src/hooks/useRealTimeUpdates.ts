import { useEffect, useRef } from 'react';
import { webSocketService } from '../lib/services/webSocketService';
import { trafficService } from '../lib/services/trafficService';
import { useTrafficStore } from '../store/trafficStore';
import { notifications } from '../utils/notifications';

export const useRealTimeUpdates = (bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
}) => {
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const { updateTrafficData } = useTrafficStore();

  useEffect(() => {
    if (!bounds) return;

    const cleanup = setupRealTimeUpdates();
    return () => {
      cleanup();
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [bounds]);

  const setupRealTimeUpdates = () => {
    // Connect to WebSocket for real-time updates
    webSocketService.connect({
      url: 'wss://your-websocket-server.com',
      options: {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }
    });

    // Subscribe to traffic updates
    const unsubscribeTraffic = webSocketService.subscribe('traffic', (data) => {
      updateTrafficData(data);
    });

    // Start polling for traffic updates as backup
    if (bounds) {
      const startPolling = async () => {
        try {
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
        } catch (error) {
          console.error('Failed to fetch traffic updates:', error);
          notifications.show('Failed to fetch traffic updates', 'error');
        }
      };

      // Initial fetch
      startPolling();

      // Set up polling interval (every 30 seconds)
      updateInterval.current = setInterval(startPolling, 30000);
    }

    return () => {
      unsubscribeTraffic();
      webSocketService.disconnect();
    };
  };
};