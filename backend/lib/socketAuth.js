import { verifyAccessToken } from '../utils/jwt.js';
import logger from '../config/logger.js';

export function attachSocketAuth(io) {
  io.use((socket, next) => {
    const header = socket.handshake.headers?.authorization;
    const raw =
      socket.handshake.auth?.token ||
      (typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7)
        : null);

    if (!raw) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyAccessToken(raw);
    if (!decoded?.userId) {
      return next(new Error('Invalid token'));
    }

    socket.data.userId = String(decoded.userId);
    socket.data.role = decoded.role;
    next();
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      const authenticatedId = socket.data.userId;
      if (!userId || String(userId) !== authenticatedId) {
        logger.warn(`Socket join denied for user ${userId} (auth: ${authenticatedId})`);
        return;
      }
      socket.join(`user:${authenticatedId}`);
    });
  });
}
