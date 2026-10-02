/** Wall-clock for sessions is Asia/Ho_Chi_Minh, not the browser timezone. */
export const SLOT_OFFSET = '+07:00';

export function slotInstant(date, time) {
  const day = String(date || '').slice(0, 10);
  const clock = String(time || '00:00').slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Date(NaN);
  return new Date(`${day}T${clock}:00${SLOT_OFFSET}`);
}

export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
