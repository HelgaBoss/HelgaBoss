// Push Notifications für Deadlines
import { useEffect, useCallback } from 'react';

const NOTIFICATION_KEY = 'jahresziele_notifications_enabled';
const LAST_NOTIFICATION_CHECK = 'jahresziele_last_notification_check';

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return false;
  
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem(NOTIFICATION_KEY, 'true');
    return true;
  }
  return false;
};

// Check if notifications are enabled
export const areNotificationsEnabled = () => {
  return localStorage.getItem(NOTIFICATION_KEY) === 'true' && 
         Notification.permission === 'granted';
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!areNotificationsEnabled()) return;
  
  const notification = new Notification(title, {
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: options.tag || 'jahresziele',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// Check deadlines and send notifications
export const checkDeadlinesAndNotify = () => {
  if (!areNotificationsEnabled()) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Check if we already notified today
  const lastCheck = localStorage.getItem(LAST_NOTIFICATION_CHECK);
  if (lastCheck === todayStr) return;
  
  // Get goals from localStorage
  const goals = JSON.parse(localStorage.getItem('jahresziele_goals') || '[]');
  
  const notifications = [];
  
  goals.forEach(goal => {
    // Check goal deadline
    if (goal.deadline) {
      const deadlineDate = goal.deadline.split('T')[0];
      const deadline = new Date(deadlineDate);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 0) {
        notifications.push({
          title: '⏰ Deadline heute!',
          body: `"${goal.title}" ist heute fällig!`,
          tag: `goal-${goal.id}`,
        });
      } else if (daysUntil === 1) {
        notifications.push({
          title: '📅 Deadline morgen',
          body: `"${goal.title}" ist morgen fällig.`,
          tag: `goal-${goal.id}`,
        });
      } else if (daysUntil === 7) {
        notifications.push({
          title: '📆 Deadline in 1 Woche',
          body: `"${goal.title}" ist in einer Woche fällig.`,
          tag: `goal-${goal.id}`,
        });
      }
    }
    
    // Check milestone deadlines
    (goal.milestones || []).forEach(milestone => {
      if (milestone.deadline && !milestone.completed) {
        const deadlineDate = milestone.deadline.split('T')[0];
        const deadline = new Date(deadlineDate);
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 0) {
          notifications.push({
            title: '⏰ Meilenstein heute fällig!',
            body: `"${milestone.title}" (${goal.title})`,
            tag: `milestone-${milestone.id}`,
          });
        } else if (daysUntil === 1) {
          notifications.push({
            title: '📅 Meilenstein morgen fällig',
            body: `"${milestone.title}" (${goal.title})`,
            tag: `milestone-${milestone.id}`,
          });
        }
      }
    });
  });
  
  // Send notifications (max 3 to not spam)
  notifications.slice(0, 3).forEach((notif, index) => {
    setTimeout(() => {
      sendNotification(notif.title, {
        body: notif.body,
        tag: notif.tag,
      });
    }, index * 1000); // Stagger by 1 second
  });
  
  // Mark as checked today
  localStorage.setItem(LAST_NOTIFICATION_CHECK, todayStr);
};

// Hook for deadline notifications
export const useDeadlineNotifications = () => {
  const enableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      checkDeadlinesAndNotify();
    }
    return granted;
  }, []);

  const disableNotifications = useCallback(() => {
    localStorage.removeItem(NOTIFICATION_KEY);
  }, []);

  // Check on mount
  useEffect(() => {
    if (areNotificationsEnabled()) {
      checkDeadlinesAndNotify();
    }
  }, []);

  return {
    isSupported: isNotificationSupported(),
    isEnabled: areNotificationsEnabled(),
    enable: enableNotifications,
    disable: disableNotifications,
    checkNow: checkDeadlinesAndNotify,
  };
};

export default useDeadlineNotifications;
