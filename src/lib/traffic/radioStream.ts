import { io, Socket } from 'socket.io-client';
import { notifications } from '../../utils/notifications';

export class RadioStreamListener {
  private socket: Socket | null = null;
  private keywords: string[];
  private onTransmission: (data: any) => void;

  constructor(keywords: string[], onTransmission: (data: any) => void) {
    this.keywords = keywords.map(k => k.toLowerCase());
    this.onTransmission = onTransmission;
  }

  connect(url: string) {
    try {
      this.socket = io(url);

      this.socket.on('connect', () => {
        notifications.show('Connected to radio stream', 'success');
      });

      this.socket.on('transmission', (data) => {
        const text = data.text.toLowerCase();
        if (this.keywords.some(keyword => text.includes(keyword))) {
          this.onTransmission(data);
        }
      });

      this.socket.on('error', (error) => {
        notifications.show('Error connecting to radio stream', 'error');
        console.error('Radio stream error:', error);
      });
    } catch (error) {
      notifications.show('Failed to connect to radio stream', 'error');
      console.error('Radio stream connection error:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}