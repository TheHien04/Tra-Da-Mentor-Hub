import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSocket } from '../hooks/useSocket';
import { notificationsApi, type AppNotification } from '../services/api';
import { useAuth } from './AuthContext';
import { getUserId } from '../lib/authUser';
import { toast } from 'react-toastify';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  connected: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const userId = getUserId(state.user) || 'all';
  const { socket, connected } = useSocket(userId);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsApi.list(userId);
      const data = res.data?.data ?? res.data ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;
    const onNotification = (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev.filter((x) => x._id !== n._id)]);
      toast.info(n.title, { autoClose: 4000 });
    };
    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket]);

  const markRead = useCallback(
    async (id: string) => {
      await notificationsApi.markRead(id, userId);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, connected, refresh, markRead, markAllRead }),
    [notifications, unreadCount, connected, refresh, markRead, markAllRead]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
