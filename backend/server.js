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
  sanitizeInputs,
  bodySizeLimiter,
  xssProtection,
} from './middleware/security.js';

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
import calendarRoutes from './routes/calendar.js';

const app = express();

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
      origin: true, // Allow all origins in dev
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }
  : {
      origin: env.corsOrigin,
      credentials: env.corsCredentials,
    };

app.use(cors(corsOptions));

// ============ BODY PARSING ============
app.use(bodySizeLimiter); // Limit body size
app.use(express.json()); // Parse JSON
app.use(sanitizeInputs); // Prevent NoSQL injection
app.use(xssProtection); // XSS protection

// Connect to MongoDB (non-blocking)
connectDatabase().catch((err) => {
  logger.warn('MongoDB connection failed. Server running in test mode without persistence.');
});

// ============ ROUTES ============
// Apply general rate limiting to all routes
app.use(generalLimiter);

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

app.get('/', (req, res) => {
  res.send('🚀 Trà Đá Mentor API (with MongoDB + Auth)');
});

// Test endpoint (no DB required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============ ERROR HANDLING ============
// 404 handler - Must be after all routes
app.use(notFound);

// Centralized error handler - Must be last
app.use(errorHandler);

// ============ START SERVER ============

app.listen(env.port, env.host, () => {
  logger.info(`Server running at http://${env.host}:${env.port}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`CORS Origin: ${env.corsOrigin}`);
});
