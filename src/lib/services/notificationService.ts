import { webSocketService } from './webSocketService';

type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();

  private constructor() {
    this.initializeWebSocket();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeWebSocket() {
    webSocketService.subscribe('notification', (data) => {
      this.addNotification({
        id: crypto.randomUUID(),
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        timestamp: new Date(),
        read: false,
        data: data.data
      });
    });
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.notifySubscribers();
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifySubscribers();
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifySubscribers();
  }

  clearAll() {
    this.notifications = [];
    this.notifySubscribers();
  }

  getNotifications(options?: {
    unreadOnly?: boolean;
    priority?: NotificationPriority;
    type?: NotificationType;
  }) {
    let filtered = [...this.notifications];

    if (options?.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    if (options?.priority) {
      filtered = filtered.filter(n => n.priority === options.priority);
    }
    if (options?.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }

    return filtered;
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications));
  }
}

export const notificationService = NotificationService.getInstance();