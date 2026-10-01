const hits = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;

function storageKey(userId, key) {
  return `${userId}:${key}`;
}

export function readIdempotent(userId, key) {
  if (!userId || !key) return null;
  const row = hits.get(storageKey(userId, key));
  if (!row) return null;
  if (Date.now() - row.at > TTL_MS) {
    hits.delete(storageKey(userId, key));
    return null;
  }
  return row;
}

export function saveIdempotent(userId, key, status, body) {
  if (!userId || !key) return;
  hits.set(storageKey(userId, key), { status, body, at: Date.now() });
}
