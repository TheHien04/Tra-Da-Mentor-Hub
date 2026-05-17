import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import env from './config/env.js';
import logger, { httpLogger } from './config/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  sanitizeInputs,
  bodySizeLimiter,
  xssProtection,
} from './middleware/security.js';
import { requireApiAuth } from './middleware/requireApiAuth.js';
import { attachSocketAuth } from './lib/socketAuth.js';

// Routes
import authRoutes from './routes/auth.js';
import mentorRoutes from './routes/mentors.js';
import menteeRoutes from './routes/mentees.js';
import groupRoutes from './routes/groups.js';
import activitiesRoutes from './routes/activities.js';
import sessionLogsRoutes from './routes/sessionLogs.js';
import slotsRoutes from './routes/slots.js';
import invitesRoutes from './routes/invites.js';
import paymentsRoutes from './routes/payments.js';
import { handleWebhook as handleStripeWebhook } from './controllers/paymentsController.js';
import calendarRoutes from './routes/calendar.js';
import matchingRoutes from './routes/matching.js';
import notificationsRoutes from './routes/notifications.js';
import testimonialsRoutes from './routes/testimonials.js';
import adminRoutes from './routes/admin.js';
import { initSentry } from './lib/sentry.js';
import { getHealthPayload } from './lib/healthStatus.js';
import { mountFrontend } from './lib/serveFrontend.js';
import { seedTestimonialsIfEmpty } from './services/testimonialStore.js';
import { seedSlotsIfEmpty } from './services/slotStore.js';
import { seedSessionLogsIfEmpty } from './services/sessionLogStore.js';
import { seedMentorsIfEmpty } from './services/mentorStore.js';
import { seedMenteesIfEmpty } from './services/menteeStore.js';
import { seedGroupsIfEmpty } from './services/groupStore.js';
import { seedActivitiesIfEmpty } from './services/activityStore.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { seedDemoNotifications } from './services/notificationStore.js';

initSentry();

const app = express();

if (env.isProduction) {
  app.set('trust proxy', 1);
}
app.disable('x-powered-by');

// ============ SECURITY MIDDLEWARE ============
// Note: Helmet can interfere with CORS in development
if (env.isDev) {
  // In development, use a more permissive helmet config
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in dev for easier debugging
    crossOriginEmbedderPolicy: false,
  }));
} else {
  app.use(helmetConfig); // Use full security in production
}
app.use(httpLogger); // Request logging

// ============ CORS ============
// Allow all origins in development for easier debugging
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

// ============ BODY PARSING ============
app.use(bodySizeLimiter); // Limit body size
// Stripe webhook must receive raw body (before express.json)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInputs);
app.use(xssProtection);

// ============ ROUTES ============
app.use(generalLimiter);
app.use(requireApiAuth);

// Auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Other routes
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

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: env.isDev
    ? { origin: true, credentials: true }
    : { origin: env.corsOrigins, credentials: env.corsCredentials },
});
app.set('io', io);
attachSocketAuth(io);

if (!env.isProduction) {
  app.get('/', (req, res) => {
    res.send('🚀 Trà Đá Mentor API (with MongoDB + Auth)');
  });
}

app.get('/api/health', (req, res) => {
  res.json(getHealthPayload());
});

mountFrontend(app);

// ============ ERROR HANDLING ============
// 404 handler - Must be after all routes
app.use(notFound);

// Centralized error handler - Must be last
app.use(errorHandler);

// ============ START SERVER ============

async function bootstrapStores() {
  try {
    await connectDatabase();
  } catch {
    logger.warn('MongoDB unavailable — using in-memory store fallback');
  }
  await Promise.all([
    seedMentorsIfEmpty(),
    seedMenteesIfEmpty(),
    seedGroupsIfEmpty(),
    seedTestimonialsIfEmpty(),
    seedSlotsIfEmpty(),
    seedSessionLogsIfEmpty(),
    seedActivitiesIfEmpty(),
  ]);
  seedDemoNotifications(io);
}

httpServer.listen(env.port, env.host, () => {
  logger.info(`Server running at http://${env.host}:${env.port}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`CORS Origin: ${env.corsOrigin}`);
  if (env.platformPublicUrl) {
    logger.info(`Public app URL: ${env.platformPublicUrl}`);
    logger.info(`Health check: ${env.platformPublicUrl}/api/health`);
  }
  logger.info('Socket.io enabled');
  bootstrapStores().catch((err) => logger.warn('Store bootstrap failed', err));
});
