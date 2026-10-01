import SessionLog from '../models/SessionLog.js';
import { SESSION_LOG_DEMO } from '../data/demoContentSeed.js';
import { useDb } from '../lib/dataMode.js';

const memory = [];
let memSeq = 1;

const SEED = SESSION_LOG_DEMO;
const DEMO_TARGET_MIN = 12;

function sessionLogKey(s) {
  return `${s.mentorId}:${s.menteeId}:${s.topic}`;
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
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return value.toISOString().split('T')[0];
}

function clampScore(value) {
  if (value == null || value === '') return null;
  const score = Math.round(Number(value));
  if (!Number.isFinite(score)) return null;
  return Math.min(5, Math.max(1, score));
}

const SCORE_KEYS = ['mentorScore', 'menteeScore'];
const BOOL_KEYS = ['mentorNeedsSupport', 'menteeNeedsSupport', 'completedByMentor', 'completedByMentee'];
const TEXT_KEYS = ['mentorSupportReason', 'menteeSupportReason'];

/** Apply only keys the caller sent. A create fills the missing side with empty defaults. */
export function sessionLogPatch(body, { create }) {
  const patch = {};
  for (const key of SCORE_KEYS) {
    if (body[key] !== undefined) patch[key] = clampScore(body[key]);
    else if (create) patch[key] = null;
  }
  for (const key of BOOL_KEYS) {
    if (body[key] !== undefined) patch[key] = Boolean(body[key]);
    else if (create) patch[key] = false;
  }
  for (const key of TEXT_KEYS) {
    if (body[key] !== undefined) patch[key] = body[key] ? String(body[key]).slice(0, 500) : null;
    else if (create) patch[key] = null;
  }
  return patch;
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
  const { mentorId, menteeId, sessionDate } = body;
  const sessionDay = dayKey(sessionDate);
  const identity = {
    mentorId,
    menteeId,
    sessionDate: new Date(sessionDate),
    topic: String(body.topic || '').trim().slice(0, 200),
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
      Object.assign(existing, identity, sessionLogPatch(body, { create: false }));
      await existing.save();
      return { log: toClient(existing), created: false };
    }

    const doc = await SessionLog.create({ ...identity, ...sessionLogPatch(body, { create: true }) });
    return { log: toClient(doc), created: true };
  }

  const existing = memory.find(
    (l) =>
      l.mentorId === mentorId &&
      l.menteeId === menteeId &&
      dayKey(l.sessionDate) === sessionDay
  );

  if (existing) {
    Object.assign(existing, identity, sessionLogPatch(body, { create: false }), {
      sessionDate: identity.sessionDate.toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { log: existing, created: false };
  }

  const newLog = {
    _id: `sl${memSeq++}`,
    ...identity,
    ...sessionLogPatch(body, { create: true }),
    sessionDate: identity.sessionDate.toISOString(),
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
