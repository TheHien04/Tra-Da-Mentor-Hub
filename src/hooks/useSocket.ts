import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '../lib/secureStorage';

function resolveSocketUrl(): string {
  const configured = import.meta.env.VITE_SOCKET_URL?.trim();
  if (configured) return configured;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5000';
}

const SOCKET_URL = resolveSocketUrl();

export function useSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: Boolean(token),
      auth: token ? { token } : undefined,
    });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      if (userId) s.emit('join', userId);
    });
    s.on('disconnect', () => setConnected(false));

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

  return { socket, connected };
}
