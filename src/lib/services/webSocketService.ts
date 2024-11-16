import { io, Socket } from 'socket.io-client';
import { notifications } from '../../utils/notifications';

interface WebSocketConfig {
  url: string;
  options?: {
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
  };
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(config: WebSocketConfig) {
    if (this.socket?.connected) return;

    try {
      this.socket = io(config.url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        ...config.options
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      notifications.show('Failed to establish WebSocket connection', 'error');
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      notifications.show('Real-time connection established', 'success');
    });

    this.socket.on('disconnect', () => {
      notifications.show('Real-time connection lost', 'error');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      notifications.show('Real-time connection error', 'error');
    });

    // Handle incoming messages
    this.socket.on('message', (data) => {
      const subscribers = this.subscribers.get('message');
      if (subscribers) {
        subscribers.forEach(callback => callback(data));
      }
    });

    // Handle specific event types
    ['traffic', 'claims', 'incidents'].forEach(eventType => {
      this.socket.on(eventType, (data) => {
        const subscribers = this.subscribers.get(eventType);
        if (subscribers) {
          subscribers.forEach(callback => callback(data));
        }
      });
    });
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)?.add(callback);

    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      notifications.show('No active connection', 'error');
      return;
    }

    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscribers.clear();
    }
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const webSocketService = WebSocketService.getInstance();