/** Build Google Calendar datetimes from slot date (YYYY-MM-DD) and time (HH:mm). */
export function slotToDateTimes(dateStr, timeStr, durationMinutes, timeZone = 'Asia/Ho_Chi_Minh') {
  const date = String(dateStr).slice(0, 10);
  const time = String(timeStr).slice(0, 5);
  const startDateTime = `${date}T${time}:00`;

  const [hh, mm] = time.split(':').map(Number);
  const totalMin = hh * 60 + mm + (Number(durationMinutes) || 60);
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  const endDayOffset = Math.floor(totalMin / (24 * 60));
  const endDate = endDayOffset
    ? new Date(`${date}T00:00:00`)
    : null;
  let endDateStr = date;
  if (endDate) {
    endDate.setDate(endDate.getDate() + endDayOffset);
    endDateStr = endDate.toISOString().slice(0, 10);
  }
  const endDateTime = `${endDateStr}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

  return { startDateTime, endDateTime, timeZone };
}
