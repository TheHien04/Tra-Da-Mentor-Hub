/**
 * Admin invite – create link, list, revoke; validate for registration
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createInvite,
  listInvites,
  revokeInvite,
  validateInviteToken,
} from '../services/inviteStore.js';
import { sendInviteEmail } from '../utils/emailService.js';
import logger from '../config/logger.js';

const router = express.Router();

const INVITE_EXPIRY_DAYS = 7;

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const r = (role || 'mentee').toLowerCase();
    if (!['mentor', 'mentee', 'admin'].includes(r)) {
      return res.status(400).json({ success: false, message: 'Role must be mentor, mentee, or admin' });
    }

    const invite = await createInvite({
      email: email.trim(),
      role: r,
      createdBy: req.user?.userId,
    });

    sendInviteEmail({
      to: invite.email,
      link: invite.link,
      role: invite.role,
      expiresAt: invite.expiresAt,
    }).catch((err) => {
      logger.warn('Invite email failed (invite still created):', err.message);
    });

    res.status(201).json({
      success: true,
      ...invite,
      expiresIn: `${INVITE_EXPIRY_DAYS} days`,
      message: 'Invite created. Email sent if SendGrid is configured.',
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', authenticate, authorize('admin'), async (_req, res, next) => {
  try {
    const data = await listInvites();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:token', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const ok = await revokeInvite(req.params.token);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Invite not found' });
    }
    res.json({ success: true, message: 'Invite revoked' });
  } catch (e) {
    next(e);
  }
});

router.get('/validate/:token', async (req, res, next) => {
  try {
    const result = await validateInviteToken(req.params.token);
    if (!result.valid) {
      return res.status(result.status || 400).json({
        valid: false,
        message: result.message,
      });
    }
    res.json({ valid: true, email: result.email, role: result.role });
  } catch (e) {
    next(e);
  }
});

export default router;
