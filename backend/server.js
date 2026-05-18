import 'dotenv/config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import env from './config/env.js';
import logger from './config/logger.js';
import { initSentry } from './lib/sentry.js';
import { attachSocketAuth } from './lib/socketAuth.js';
import { createApp } from './createApp.js';
import { seedTestimonialsIfEmpty } from './services/testimonialStore.js';
import { seedSlotsIfEmpty } from './services/slotStore.js';
import { seedSessionLogsIfEmpty } from './services/sessionLogStore.js';
import { seedMentorsIfEmpty } from './services/mentorStore.js';
import { seedMenteesIfEmpty } from './services/menteeStore.js';
import { seedGroupsIfEmpty } from './services/groupStore.js';
import { seedActivitiesIfEmpty } from './services/activityStore.js';
import { seedBroadcastNotificationsIfEmpty } from './services/notificationStore.js';
import { seedInvitesIfEmpty } from './services/inviteStore.js';

initSentry();

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: env.isDev
    ? { origin: true, credentials: true }
    : { origin: env.corsOrigins, credentials: env.corsCredentials },
});
app.set('io', io);
attachSocketAuth(io);

async function bootstrapStores() {
  try {
    await connectDatabase();
  } catch (err) {
    if (env.isProduction) {
      logger.error('MongoDB is required in production. Set DATABASE_URL and ensure MongoDB is reachable.');
      logger.error(err?.message || err);
      process.exit(1);
    }
    logger.warn('MongoDB unavailable — using in-memory store fallback (development only)');
  }
  await Promise.all([
    seedMentorsIfEmpty(),
    seedMenteesIfEmpty(),
    seedGroupsIfEmpty(),
    seedTestimonialsIfEmpty(),
    seedSlotsIfEmpty(),
    seedSessionLogsIfEmpty(),
    seedActivitiesIfEmpty(),
    seedInvitesIfEmpty(),
  ]);
  await seedBroadcastNotificationsIfEmpty();
}

async function startServer() {
  try {
    await bootstrapStores();
  } catch (err) {
    logger.error('Failed to bootstrap application stores', err);
    if (env.isProduction) process.exit(1);
  }

  httpServer.listen(env.port, env.host, () => {
    logger.info(`Server running at http://${env.host}:${env.port}`);
    logger.info(`Environment: ${env.nodeEnv}`);
    logger.info(`API docs: http://${env.host}:${env.port}/api/docs`);
    if (env.platformPublicUrl) {
      logger.info(`Public app URL: ${env.platformPublicUrl}`);
      logger.info(`Health check: ${env.platformPublicUrl}/api/health`);
    }
    logger.info('Socket.io enabled');
  });
}

startServer();
