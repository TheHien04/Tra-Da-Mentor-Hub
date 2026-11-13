import {
  claimIdempotent,
  completeIdempotent,
  createIdempotencyContext,
  releaseIdempotent,
} from '../lib/idempotency.js';

/**
 * Reserve and replay a POST only after the route has authenticated and authorized it.
 */
export async function idempotentWrite(req, res, next) {
  if (req.method !== 'POST') return next();
  const key = req.get('Idempotency-Key');
  if (!key || !req.user?.userId) return next();
  if (key.length > 200) {
    return res.status(400).json({ success: false, code: 'VALIDATION', message: 'Idempotency-Key is too long' });
  }

  try {
    const context = createIdempotencyContext(req);
    const claim = await claimIdempotent(context);
    if (claim.kind === 'replay') return res.status(claim.status).json(claim.body);
    if (claim.kind === 'conflict') {
      return res.status(409).json({
        success: false,
        code: 'IDEMPOTENCY_KEY_REUSED',
        message: 'This Idempotency-Key was already used with different request data or authorization',
      });
    }
    if (claim.kind === 'pending') {
      return res.status(409).json({
        success: false,
        code: 'IDEMPOTENCY_IN_PROGRESS',
        message: 'A request with this Idempotency-Key is already in progress',
      });
    }

    const send = res.json.bind(res);
    res.json = (body) => {
      const status = res.statusCode || 200;
      res.json = send;
      const persist = status < 500
        ? completeIdempotent(context, status, body)
        : releaseIdempotent(context);
      void persist.then(() => send(body)).catch(next);
      return res;
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
