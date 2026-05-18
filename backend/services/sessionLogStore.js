import mongoose from 'mongoose';
import SessionLog from '../models/SessionLog.js';
import { SESSION_LOG_DEMO } from '../data/demoContentSeed.js';

const memory = [];
let memSeq = 1;

const SEED = SESSION_LOG_DEMO;
const DEMO_TARGET_MIN = 12;

function sessionLogKey(s) {
  return `${s.mentorId}:${s.menteeId}:${s.topic}`;
}

function useDb() {
  return mongoose.connection.readyState === 1;
}

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
  return {
    _id: String(o._id),
    mentorId: o.mentorId,
    menteeId: o.menteeId,
    sessionDate:
      o.sessionDate instanceof Date
        ? o.sessionDate.toISOString()
        : String(o.sessionDate),
    topic: o.topic || '',
    mentorScore: o.mentorScore ?? null,
    menteeScore: o.menteeScore ?? null,
    mentorNeedsSupport: Boolean(o.mentorNeedsSupport),
    mentorSupportReason: o.mentorSupportReason ?? null,
    menteeNeedsSupport: Boolean(o.menteeNeedsSupport),
    menteeSupportReason: o.menteeSupportReason ?? null,
    completedByMentor: Boolean(o.completedByMentor),
    completedByMentee: Boolean(o.completedByMentee),
    createdAt:
      o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    updatedAt:
      o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
  };
}

function dayKey(date) {
  return new Date(date).toISOString().split('T')[0];
}

export async function listSessionLogs({ mentorId, menteeId } = {}) {
  let list;
  if (useDb()) {
    const filter = {};
    if (mentorId) filter.mentorId = mentorId;
    if (menteeId) filter.menteeId = menteeId;
    const docs = await SessionLog.find(filter).sort({ sessionDate: -1 }).lean();
    list = docs.map((d) => toClient(d));
  } else {
    list = memory.filter((l) => {
      if (mentorId && l.mentorId !== mentorId) return false;
      if (menteeId && l.menteeId !== menteeId) return false;
      return true;
    });
    list.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
  }
  return list;
}

export async function upsertSessionLog(body) {
  const {
    mentorId,
    menteeId,
    sessionDate,
    topic,
    mentorScore,
    menteeScore,
    mentorNeedsSupport,
    mentorSupportReason,
    menteeNeedsSupport,
    menteeSupportReason,
    completedByMentor,
    completedByMentee,
  } = body;

  const sessionDay = dayKey(sessionDate);
  const payload = {
    mentorId,
    menteeId,
    sessionDate: new Date(sessionDate),
    topic: topic || '',
    mentorScore: mentorScore != null ? Number(mentorScore) : null,
    menteeScore: menteeScore != null ? Number(menteeScore) : null,
    mentorNeedsSupport: Boolean(mentorNeedsSupport),
    mentorSupportReason: mentorSupportReason || null,
    menteeNeedsSupport: Boolean(menteeNeedsSupport),
    menteeSupportReason: menteeSupportReason || null,
    completedByMentor: Boolean(completedByMentor),
    completedByMentee: Boolean(completedByMentee),
  };

  if (useDb()) {
    const start = new Date(sessionDay);
    const end = new Date(sessionDay);
    end.setUTCDate(end.getUTCDate() + 1);

    const existing = await SessionLog.findOne({
      mentorId,
      menteeId,
      sessionDate: { $gte: start, $lt: end },
    });

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return { log: toClient(existing), created: false };
    }

    const doc = await SessionLog.create(payload);
    return { log: toClient(doc), created: true };
  }

  const existing = memory.find(
    (l) =>
      l.mentorId === mentorId &&
      l.menteeId === menteeId &&
      dayKey(l.sessionDate) === sessionDay
  );

  if (existing) {
    Object.assign(existing, payload, {
      sessionDate: payload.sessionDate.toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { log: existing, created: false };
  }

  const newLog = {
    _id: `sl${memSeq++}`,
    ...payload,
    sessionDate: payload.sessionDate.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memory.push(newLog);
  return { log: newLog, created: true };
}

export async function listNeedsSupport() {
  if (useDb()) {
    const docs = await SessionLog.find({
      $or: [{ mentorNeedsSupport: true }, { menteeNeedsSupport: true }],
    })
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map((d) => toClient(d));
  }
  return memory
    .filter((l) => l.mentorNeedsSupport === true || l.menteeNeedsSupport === true)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function pushSeedToMemory(rows, startIndex = 0) {
  const now = new Date().toISOString();
  rows.forEach((s, i) => {
    memory.push({
      _id: `sl_seed_${startIndex + i}`,
      ...s,
      sessionDate:
        s.sessionDate instanceof Date ? s.sessionDate.toISOString() : String(s.sessionDate),
      mentorSupportReason: s.mentorSupportReason ?? null,
      menteeSupportReason: s.menteeSupportReason ?? null,
      createdAt: now,
      updatedAt: now,
    });
  });
}

export async function seedSessionLogsIfEmpty() {
  if (useDb()) {
    const count = await SessionLog.countDocuments();
    if (count === 0) {
      await SessionLog.insertMany(SEED);
      return;
    }
    if (count < DEMO_TARGET_MIN) {
      const existing = await SessionLog.find().select('mentorId menteeId topic').lean();
      const keys = new Set(existing.map((e) => sessionLogKey(e)));
      const missing = SEED.filter((s) => !keys.has(sessionLogKey(s)));
      if (missing.length) {
        await SessionLog.insertMany(missing.slice(0, DEMO_TARGET_MIN - count));
      }
    }
    return;
  }
  if (memory.length === 0) {
    pushSeedToMemory(SEED);
    return;
  }
  if (memory.length < DEMO_TARGET_MIN) {
    const keys = new Set(memory.map((e) => sessionLogKey(e)));
    const missing = SEED.filter((s) => !keys.has(sessionLogKey(s)));
    pushSeedToMemory(missing.slice(0, DEMO_TARGET_MIN - memory.length), memory.length);
  }
}
