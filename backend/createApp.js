/**
 * Express application factory — used by server.js and integration tests.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import logger, { httpLogger } from './config/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import {
  helmetConfig,
  generalLimiter,
  authLimiter,
  sanitizeInputs,
  bodySizeLimiter,
  xssProtection,
} from './middleware/security.js';
import { requireApiAuth } from './middleware/requireApiAuth.js';
import { getHealthPayload } from './lib/healthStatus.js';
import { mountFrontend } from './lib/serveFrontend.js';
import { handleWebhook as handleStripeWebhook } from './controllers/paymentsController.js';
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import menteeRoutes from './routes/mentees.js';
import groupRoutes from './routes/groups.js';
import activitiesRoutes from './routes/activities.js';
import sessionLogsRoutes from './routes/sessionLogs.js';
import slotsRoutes from './routes/slots.js';
import invitesRoutes from './routes/invites.js';
import paymentsRoutes from './routes/payments.js';
import calendarRoutes from './routes/calendar.js';
import matchingRoutes from './routes/matching.js';
import notificationsRoutes from './routes/notifications.js';
import testimonialsRoutes from './routes/testimonials.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import uploadsRoutes from './routes/uploads.js';
import docsRoutes from './routes/docs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __uploadsDir = path.join(__dirname, 'uploads');

/**
 * @param {{ mountSpa?: boolean }} options
 */
export function createApp(options = {}) {
  const { mountSpa = true } = options;
  const app = express();

  if (env.isProduction) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  if (env.isDev) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );
  } else {
    app.use(helmetConfig);
  }

  app.use(httpLogger);

  const corsOptions = env.isDev
    ? {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }
    : {
        origin(origin, callback) {
          if (!origin) return callback(null, true);
          if (env.corsOrigins.includes(origin)) return callback(null, true);
          logger.warn(`CORS blocked origin: ${origin}`);
          return callback(new Error('Not allowed by CORS'));
        },
        credentials: env.corsCredentials,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      };

  app.use(cors(corsOptions));
  app.use(bodySizeLimiter);

  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(__uploadsDir));
  app.use(sanitizeInputs);
  app.use(xssProtection);

  app.use('/api/docs', docsRoutes);

  app.get('/api/health', (_req, res) => {
    const payload = getHealthPayload();
    const code = payload.status === 'degraded' ? 503 : 200;
    res.status(code).json(payload);
  });

  app.use(generalLimiter);
  app.use(requireApiAuth);

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/mentors', mentorRoutes);
  app.use('/api/mentees', menteeRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/activities', activitiesRoutes);
  app.use('/api/session-logs', sessionLogsRoutes);
  app.use('/api/slots', slotsRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/invites', invitesRoutes);
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/matching', matchingRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/testimonials', testimonialsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/uploads', uploadsRoutes);

  if (!env.isProduction) {
    app.get('/', (_req, res) => {
      res.send('Trà Đá Mentor API');
    });
  }

  if (mountSpa) {
    mountFrontend(app);
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
