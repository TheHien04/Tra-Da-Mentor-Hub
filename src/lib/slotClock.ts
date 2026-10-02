/** Sessions are booked on the Asia/Ho_Chi_Minh wall clock. */
const SLOT_OFFSET = '+07:00';

export function slotInstant(date: string, time?: string): Date {
  const day = String(date || '').slice(0, 10);
  const clock = String(time || '00:00').slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return new Date(NaN);
  return new Date(`${day}T${clock}:00${SLOT_OFFSET}`);
}
