import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { updateMentor } from '../services/mentorStore.js';
import { updateMentee } from '../services/menteeStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../uploads/avatars');
const MAX_BYTES = 2 * 1024 * 1024;

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function matchesMagic(mime, buffer) {
  if (buffer.length < 12) return false;
  if (mime === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === 'image/gif') {
    const head = buffer.subarray(0, 6).toString('ascii');
    return head === 'GIF87a' || head === 'GIF89a';
  }
  if (mime === 'image/webp') {
    return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

export function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) return null;
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) return null;
  if (buffer.length > MAX_BYTES) return { error: 'FILE_TOO_LARGE' };
  if (!matchesMagic(mime, buffer)) return null;
  return { mime, ext, buffer };
}

export async function uploadAvatar(req, res, next) {
  try {
    const actor = await loadActor(req);
    const { entityType, entityId, dataUrl } = req.body || {};
    if (!['mentor', 'mentee'].includes(entityType)) {
      return fail(res, 400, 'VALIDATION', 'Invalid entity type');
    }
    if (!entityId || typeof entityId !== 'string') {
      return fail(res, 400, 'VALIDATION', 'Entity ID required');
    }
    const owns =
      actor?.isAdmin ||
      (entityType === 'mentor' && actor?.mentorId === entityId) ||
      (entityType === 'mentee' && actor?.menteeId === entityId);
    if (!owns) return fail(res, 403, 'FORBIDDEN');

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) return fail(res, 400, 'VALIDATION', 'Invalid image data');
    if (parsed.error === 'FILE_TOO_LARGE') return fail(res, 400, 'FILE_TOO_LARGE');

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `avatar-${randomBytes(16).toString('hex')}${parsed.ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, parsed.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated =
      entityType === 'mentor'
        ? await updateMentor(entityId, { avatarUrl })
        : await updateMentee(entityId, { avatarUrl });

    if (!updated) return fail(res, 404, 'NOT_FOUND', 'Profile not found');

    res.json({ success: true, data: { avatarUrl } });
  } catch (e) {
    next(e);
  }
}
