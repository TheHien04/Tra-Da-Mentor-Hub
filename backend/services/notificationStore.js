import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { BROADCAST_NOTIFICATION_DEMO } from '../data/demoContentSeed.js';

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

const BROADCAST_USER_IDS = ['all', 'mentors', 'mentees'];

export async function listBroadcastNotifications(limit = 50) {
  if (useDb()) {
    const docs = await Notification.find({ userId: { $in: BROADCAST_USER_IDS } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d) => toClient(d));
  }
  return memory
    .filter((n) => BROADCAST_USER_IDS.includes(n.userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
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

function broadcastSeedRows() {
  const now = Date.now();
  return BROADCAST_NOTIFICATION_DEMO.map((d, i) => ({
    ...d,
    href: '/',
    read: i > 1,
    createdAt: new Date(now - i * 36 * 60 * 60 * 1000).toISOString(),
  }));
}

export function seedDemoNotifications() {
  if (memory.some((n) => BROADCAST_USER_IDS.includes(n.userId))) return;
  broadcastSeedRows().forEach((d) => {
    memory.push({
      _id: `n${seq++}`,
      ...d,
    });
  });
}

export async function seedBroadcastNotificationsIfEmpty() {
  const rows = broadcastSeedRows();
  if (useDb()) {
    const count = await Notification.countDocuments({
      userId: { $in: BROADCAST_USER_IDS },
    });
    if (count === 0) {
      await Notification.insertMany(rows);
    } else if (count < rows.length) {
      const existing = await Notification.find({ userId: { $in: BROADCAST_USER_IDS } })
        .select('title')
        .lean();
      const titles = new Set(existing.map((e) => e.title));
      const missing = rows.filter((r) => !titles.has(r.title));
      if (missing.length) {
        await Notification.insertMany(missing.slice(0, rows.length - count));
      }
    }
    return;
  }
  seedDemoNotifications();
}
