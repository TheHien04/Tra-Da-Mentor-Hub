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

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) return null;
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) return { error: 'FILE_TOO_LARGE' };
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
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid image data' });
    }
    if (parsed.error === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'Image must be under 2MB' });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${entityType}-${entityId}-${randomBytes(8).toString('hex')}${parsed.ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, parsed.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated =
      entityType === 'mentor'
        ? await updateMentor(entityId, { avatarUrl })
        : await updateMentee(entityId, { avatarUrl });

    if (!updated) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ success: true, data: { avatarUrl } });
  } catch (e) {
    next(e);
  }
}
