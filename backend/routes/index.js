import { authLimiter } from '../middleware/security.js';
import activitiesRoutes from './activities.js';
import adminRoutes from './admin.js';
import analyticsRoutes from './analytics.js';
import authRoutes from './auth.js';
import calendarRoutes from './calendar.js';
import docsRoutes from './docs.js';
import groupRoutes from './groups.js';
import invitesRoutes from './invites.js';
import matchingRoutes from './matching.js';
import menteeRoutes from './mentees.js';
import mentorRoutes from './mentors.js';
import notificationsRoutes from './notifications.js';
import paymentsRoutes from './payments.js';
import sessionLogsRoutes from './sessionLogs.js';
import slotsRoutes from './slots.js';
import testimonialsRoutes from './testimonials.js';
import uploadsRoutes from './uploads.js';

const protectedRoutes = [
  ['/api/auth', authRoutes, [authLimiter]],
  ['/api/mentors', mentorRoutes],
  ['/api/mentees', menteeRoutes],
  ['/api/groups', groupRoutes],
  ['/api/activities', activitiesRoutes],
  ['/api/session-logs', sessionLogsRoutes],
  ['/api/slots', slotsRoutes],
  ['/api/payments', paymentsRoutes],
  ['/api/invites', invitesRoutes],
  ['/api/calendar', calendarRoutes],
  ['/api/matching', matchingRoutes],
  ['/api/notifications', notificationsRoutes],
  ['/api/testimonials', testimonialsRoutes],
  ['/api/admin', adminRoutes],
  ['/api/analytics', analyticsRoutes],
  ['/api/uploads', uploadsRoutes],
];

/** Public API documentation is mounted before the global authentication gate. */
export function mountPublicApiRoutes(app) {
  app.use('/api/docs', docsRoutes);
}

/** Register the authenticated API surface from one auditable route table. */
export function mountProtectedApiRoutes(app) {
  for (const [path, router, middleware = []] of protectedRoutes) {
    app.use(path, ...middleware, router);
  }
}
