import { slotInstant } from './slotClock.js';

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Returns a safe slot payload, or `{ error: 'VALIDATION' | 'SLOT_PAST' }`. */
export function parseSlotInput(input = {}) {
  const date = String(input.date || '');
  const time = String(input.time || '');
  const duration = Number(input.duration);
  if (!isRealDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return { error: 'VALIDATION' };
  }
  if (!Number.isFinite(duration) || duration < 15 || duration > 180) {
    return { error: 'VALIDATION' };
  }
  const meetingLink = input.meetingLink == null ? '' : String(input.meetingLink).trim();
  if (meetingLink && (meetingLink.length > 500 || !/^https:\/\//i.test(meetingLink))) {
    return { error: 'VALIDATION' };
  }
  const at = slotInstant(date, time);
  if (Number.isNaN(at.getTime())) return { error: 'VALIDATION' };
  if (at.getTime() < Date.now() - 60_000) return { error: 'SLOT_PAST' };
  return { date, time, duration, meetingLink };
}
