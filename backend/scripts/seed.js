/**
 * Idempotently seed the current development collections.
 * This script never deletes existing records and never creates known-password users.
 */
import 'dotenv/config.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { lockDataMode } from '../lib/dataMode.js';
import { seedActivitiesIfEmpty } from '../services/activityStore.js';
import { seedGroupsIfEmpty } from '../services/groupStore.js';
import { seedInvitesIfEmpty } from '../services/inviteStore.js';
import { seedMenteesIfEmpty } from '../services/menteeStore.js';
import { seedMentorsIfEmpty } from '../services/mentorStore.js';
import { seedBroadcastNotificationsIfEmpty } from '../services/notificationStore.js';
import { seedSessionLogsIfEmpty } from '../services/sessionLogStore.js';
import { seedSlotsIfEmpty } from '../services/slotStore.js';
import { seedTestimonialsIfEmpty } from '../services/testimonialStore.js';

async function seed() {
  try {
    await connectDatabase();
    lockDataMode('mongo');
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
    console.log('Development data is ready. Existing records were preserved.');
  } catch (error) {
    console.error('Seeding failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

await seed();
