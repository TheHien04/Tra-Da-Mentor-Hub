import express from 'express';
import {
  getAudit,
  getBroadcasts,
  getIntegrations,
  getMetrics,
  sendBroadcast,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/security.js';
import { validate } from '../middleware/validation.js';
import { broadcastSchema } from '../schemas/admin.schema.js';
import { idempotentWrite } from '../middleware/idempotentWrite.js';

const router = express.Router();

router.use(authenticate, authorize('admin'), adminLimiter);
router.get('/audit', getAudit);
router.get('/broadcasts', getBroadcasts);
router.get('/integrations', getIntegrations);
router.get('/metrics', getMetrics);
router.post('/broadcast', validate(broadcastSchema), idempotentWrite, sendBroadcast);

export default router;
