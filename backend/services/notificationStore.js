import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const memory = [];
let seq = 1;

function useDb() {
  return mongoose.connection.readyState === 1;
}

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
  return {
    _id: String(o._id),
    userId: o.userId,
    title: o.title,
    message: o.message || '',
    type: o.type || 'info',
    href: o.href ?? null,
    read: Boolean(o.read),
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
  };
}

export async function createNotification(payload, io) {
  const data = {
    userId: payload.userId || 'all',
    title: payload.title,
    message: payload.message || '',
    type: payload.type || 'info',
    href: payload.href || null,
    read: false,
  };

  let notification;
  if (useDb()) {
    const doc = await Notification.create(data);
    notification = toClient(doc);
  } else {
    notification = {
      _id: `n${seq++}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    memory.unshift(notification);
    if (memory.length > 200) memory.pop();
  }

  if (io) {
    io.emit('notification', notification);
    if (payload.userId && payload.userId !== 'all') {
      io.to(`user:${payload.userId}`).emit('notification', notification);
    }
  }
  return notification;
}

export async function listNotifications(userId) {
  if (useDb()) {
    const docs = await Notification.find({
      $or: [{ userId: 'all' }, { userId }],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return docs.map((d) => toClient(d));
  }
  return memory.filter((n) => n.userId === 'all' || n.userId === userId);
}

export async function markRead(id, userId) {
  if (useDb()) {
    const doc = await Notification.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { userId: 'all' }] },
      { read: true },
      { new: true }
    );
    return toClient(doc);
  }
  const n = memory.find((x) => x._id === id && (x.userId === userId || x.userId === 'all'));
  if (n) n.read = true;
  return n || null;
}

export async function markAllRead(userId) {
  if (useDb()) {
    await Notification.updateMany(
      { $or: [{ userId }, { userId: 'all' }], read: false },
      { read: true }
    );
    return;
  }
  memory.forEach((n) => {
    if (n.userId === userId || n.userId === 'all') n.read = true;
  });
}

export function seedDemoNotifications() {
  if (memory.length > 0) return;
  const demos = [
    { userId: 'all', title: 'Welcome', message: 'Tea Mentor platform is ready.', type: 'info' },
  ];
  demos.forEach((d) => {
    memory.push({
      _id: `n${seq++}`,
      ...d,
      href: null,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
}
