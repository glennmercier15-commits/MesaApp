import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, doc, onSnapshot, collection, query, where, orderBy, limit } from '../firebase';
import { theme } from '../theme';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'session' | 'message' | 'milestone' | 'system';
  timestamp: any;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  requestPermission: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  permission: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, userDoc } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(newNotifications);

      const latest = newNotifications[0];
      const notificationsEnabled = userDoc?.preferences?.notificationsEnabled !== false; // Default to true

      if (latest && !latest.read && permission === 'granted' && latest.id !== lastNotificationId && notificationsEnabled) {
        new Notification(latest.title, {
          body: latest.body,
          icon: '/favicon.ico', 
        });
        setLastNotificationId(latest.id);
      }
    });

    return () => unsubscribe();
  }, [permission, lastNotificationId, user, userDoc]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const markAsRead = async (id: string) => {
    // In a real app, we would update Firestore here
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, requestPermission, markAsRead, permission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
