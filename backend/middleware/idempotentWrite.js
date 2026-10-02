import { readIdempotent, saveIdempotent } from '../lib/idempotency.js';

/**
 * Replay a successful POST when the client sends the same Idempotency-Key.
 * Callers without the header are unchanged.
 */
export function idempotentWrite(req, res, next) {
  if (req.method !== 'POST') return next();
  const key = req.get('Idempotency-Key');
  const userId = req.user?.userId;
  if (!key || !userId) return next();

  const prior = readIdempotent(userId, key);
  if (prior) return res.status(prior.status).json(prior.body);

  const send = res.json.bind(res);
  res.json = (body) => {
    const status = res.statusCode || 200;
    if (status < 400) saveIdempotent(userId, key, status, body);
    return send(body);
  };
  next();
}
