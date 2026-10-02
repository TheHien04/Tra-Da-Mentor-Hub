import logger from '../config/logger.js';
import { demoIntegrationsEnabled } from '../lib/demoIntegrations.js';
import { recordDemoZalo } from '../services/demoOutbox.js';

const ZALO_OA_ACCESS_TOKEN = process.env.ZALO_OA_ACCESS_TOKEN || '';
const ZALO_API_BASE = process.env.ZALO_API_BASE || 'https://openapi.zalo.me/v3.0';

/**
 * Send broadcast via Zalo Official Account (when configured).
 * Requires ZALO_OA_ACCESS_TOKEN and recipient user_ids from Zalo follow webhook.
 */
export async function sendZaloBroadcast({ message, recipientIds = [] }) {
  if (!ZALO_OA_ACCESS_TOKEN) {
    if (!demoIntegrationsEnabled()) {
      logger.warn('Zalo OA not configured (ZALO_OA_ACCESS_TOKEN missing)');
      return {
        success: false,
        sent: 0,
        message: 'Zalo OA not configured. Set ZALO_OA_ACCESS_TOKEN in .env',
      };
    }
    const ids = recipientIds.length ? recipientIds : ['demo-follower'];
    ids.forEach((recipientId) => recordDemoZalo({ recipientId, message }));
    logger.info(`Demo Zalo message stored for ${ids.length} recipient(s)`);
    return { success: true, sent: ids.length, total: ids.length, demo: true };
  }

  if (!recipientIds.length) {
    return {
      success: false,
      sent: 0,
      message: 'No Zalo recipient IDs. Connect Zalo OA follower sync first.',
    };
  }

  let sent = 0;
  const errors = [];

  for (const userId of recipientIds) {
    try {
      const res = await fetch(`${ZALO_API_BASE}/oa/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ZALO_OA_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          recipient: { user_id: userId },
          message: { text: message },
        }),
      });
      if (res.ok) sent += 1;
      else errors.push({ userId, status: res.status });
    } catch (err) {
      errors.push({ userId, error: err.message });
    }
  }

  return {
    success: sent > 0,
    sent,
    total: recipientIds.length,
    errors: errors.length ? errors : undefined,
  };
}

/** Placeholder: load follower IDs from env or future DB collection */
export function getZaloRecipientIdsForAudience(audience) {
  const raw = process.env.ZALO_BROADCAST_USER_IDS || '';
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length || !demoIntegrationsEnabled()) return ids;
  if (audience === 'mentors') return ['demo-mentor'];
  if (audience === 'mentees') return ['demo-mentee'];
  return ['demo-mentor', 'demo-mentee'];
}
