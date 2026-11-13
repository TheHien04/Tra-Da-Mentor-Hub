import { randomUUID } from 'node:crypto';

const SAFE_REQUEST_ID = /^[a-zA-Z0-9._:-]{1,100}$/;

export function requestContext(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}
