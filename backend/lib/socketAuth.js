import { verifyAccessToken } from '../utils/jwt.js';
import logger from '../config/logger.js';
import { readAccessCookie } from './sessionCookie.js';

export function attachSocketAuth(io) {
  io.use((socket, next) => {
    const header = socket.handshake.headers?.authorization;
    const raw =
      socket.handshake.auth?.token ||
      (typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7)
        : null) ||
      readAccessCookie({ headers: { cookie: socket.handshake.headers?.cookie } });

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
    const userId = socket.data.userId;
    const role = socket.data.role;
    socket.join(`user:${userId}`);
    socket.join('role:all');
    if (role === 'mentor' || role === 'admin') socket.join('role:mentors');
    if (role === 'mentee' || role === 'admin') socket.join('role:mentees');

    socket.on('join', (requestedId) => {
      if (!requestedId || String(requestedId) !== userId) {
        logger.warn(`Socket join denied for user ${requestedId} (auth: ${userId})`);
      }
    });
  });
}
