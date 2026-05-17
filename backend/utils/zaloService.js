import logger from '../config/logger.js';

const ZALO_OA_ACCESS_TOKEN = process.env.ZALO_OA_ACCESS_TOKEN || '';
const ZALO_API_BASE = process.env.ZALO_API_BASE || 'https://openapi.zalo.me/v3.0';

/**
 * Send broadcast via Zalo Official Account (when configured).
 * Requires ZALO_OA_ACCESS_TOKEN and recipient user_ids from Zalo follow webhook.
 */
export async function sendZaloBroadcast({ message, recipientIds = [] }) {
  if (!ZALO_OA_ACCESS_TOKEN) {
    logger.warn('Zalo OA not configured (ZALO_OA_ACCESS_TOKEN missing)');
    return {
      success: false,
      sent: 0,
      message: 'Zalo OA not configured. Set ZALO_OA_ACCESS_TOKEN in .env',
    };
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
export function getZaloRecipientIdsForAudience(_audience) {
  const raw = process.env.ZALO_BROADCAST_USER_IDS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
