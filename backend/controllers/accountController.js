import User from '../models/User.js';
import { DEMO_USER, isDemoUserId } from '../config/demoAuth.js';
import { fail } from '../lib/httpError.js';
import { clearSessionCookies } from '../lib/sessionCookie.js';
import { forgetAccountActive } from '../lib/activeUser.js';
import { loadActor } from '../lib/actor.js';
import { getMenteeById, deleteMentee } from '../services/menteeStore.js';
import { getMentorById, deleteMentor } from '../services/mentorStore.js';
import { listSessionLogs } from '../services/sessionLogStore.js';
import { listNotificationsForActor } from '../services/notificationStore.js';
import logger from '../config/logger.js';

async function safeProfile(userId) {
  if (isDemoUserId(userId)) return DEMO_USER.toJSON();
  const user = await User.findById(userId);
  return user ? user.toJSON() : null;
}

export async function changePassword(req, res) {
  try {
    if (isDemoUserId(req.user?.userId)) return fail(res, 403, 'DEMO_ACCOUNT');
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return fail(res, 404, 'NOT_FOUND');
    const matches = await user.comparePassword(req.body.currentPassword);
    if (!matches) return fail(res, 401, 'INVALID_CREDENTIALS');
    user.password = req.body.password;
    user.refreshTokens = [];
    await user.save();
    logger.info(`Password changed: ${user.email}`);
    return res.json({ success: true });
  } catch (error) {
    logger.error('Change password error:', error);
    return fail(res, 500, 'INTERNAL');
  }
}

export async function exportAccount(req, res) {
  try {
    const actor = await loadActor(req);
    const profile = await safeProfile(req.user?.userId);
    if (!profile) return fail(res, 404, 'NOT_FOUND');

    const mentee = actor?.menteeId ? await getMenteeById(actor.menteeId) : null;
    const mentor = actor?.mentorId ? await getMentorById(actor.mentorId) : null;
    let sessionLogs = [];
    if (actor?.menteeId) sessionLogs = await listSessionLogs({ menteeId: actor.menteeId });
    else if (actor?.mentorId && !actor.isAdmin) {
      sessionLogs = await listSessionLogs({ mentorId: actor.mentorId });
    }
    const notifications = actor ? await listNotificationsForActor(actor) : [];

    return res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        profile,
        mentee,
        mentor,
        sessionLogs,
        notifications,
      },
    });
  } catch (error) {
    logger.error('Export account error:', error);
    return fail(res, 500, 'INTERNAL');
  }
}

export async function deleteAccount(req, res) {
  try {
    if (isDemoUserId(req.user?.userId)) return fail(res, 403, 'DEMO_ACCOUNT');
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) return fail(res, 404, 'NOT_FOUND');
    const matches = await user.comparePassword(req.body.password);
    if (!matches) return fail(res, 401, 'INVALID_CREDENTIALS');

    const actor = await loadActor(req);
    if (actor?.role === 'mentee' && actor.menteeId) {
      await deleteMentee(actor.menteeId);
    }
    if (actor?.role === 'mentor' && actor.mentorId) {
      await deleteMentor(actor.mentorId);
    }

    await User.deleteOne({ _id: user._id });
    forgetAccountActive(user._id);
    clearSessionCookies(res);
    logger.info(`Account deleted: ${user.email}`);
    return res.json({ success: true });
  } catch (error) {
    logger.error('Delete account error:', error);
    return fail(res, 500, 'INTERNAL');
  }
}
