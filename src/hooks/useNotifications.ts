import { useEffect, useState } from 'react';
import { notificationService } from '../lib/services/notificationService';

export const useNotifications = (options?: {
  unreadOnly?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'info' | 'success' | 'warning' | 'error';
}) => {
  const [notifications, setNotifications] = useState(
    notificationService.getNotifications(options)
  );

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((_updatedNotifications) => {
      setNotifications(
        notificationService.getNotifications(options)
      );
    });

    return unsubscribe;
  }, [options]);

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const removeNotification = (id: string) => {
    notificationService.removeNotification(id);
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
};