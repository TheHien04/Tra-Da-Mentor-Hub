const emails = [];
const zalo = [];
const MAX = 100;

function push(list, row) {
  list.unshift({ ...row, at: new Date().toISOString() });
  if (list.length > MAX) list.pop();
}

export function recordDemoEmail({ to, subject, text }) {
  push(emails, { to, subject, text: String(text || '').slice(0, 500) });
}

export function recordDemoZalo({ recipientId, message }) {
  push(zalo, { recipientId, message: String(message || '').slice(0, 500) });
}

export function listDemoOutbox() {
  return { emails: emails.slice(0, 20), zalo: zalo.slice(0, 20) };
}
