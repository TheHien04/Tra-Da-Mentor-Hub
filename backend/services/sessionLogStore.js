import mongoose from 'mongoose';
import SessionLog from '../models/SessionLog.js';

const memory = [];
let memSeq = 1;

const SEED = [
  {
    mentorId: 'm1',
    menteeId: '101',
    sessionDate: new Date('2025-12-19T00:00:00.000Z'),
    topic: 'React hooks và state management',
    mentorScore: 5,
    menteeScore: 5,
    mentorNeedsSupport: false,
    mentorSupportReason: null,
    menteeNeedsSupport: false,
    menteeSupportReason: null,
    completedByMentor: true,
    completedByMentee: true,
  },
  {
    mentorId: 'm2',
    menteeId: '102',
    sessionDate: new Date('2025-12-20T00:00:00.000Z'),
    topic: 'Node.js backend architecture',
    mentorScore: 4,
    menteeScore: 5,
    mentorNeedsSupport: false,
    menteeNeedsSupport: true,
    menteeSupportReason: 'Cần tài liệu thêm về Docker',
    completedByMentor: true,
    completedByMentee: true,
  },
];

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

export async function seedSessionLogsIfEmpty() {
  if (useDb()) {
    const count = await SessionLog.countDocuments();
    if (count === 0) await SessionLog.insertMany(SEED);
    return;
  }
  if (memory.length === 0) {
    SEED.forEach((s, i) => {
      const now = new Date().toISOString();
      memory.push({
        _id: `sl_seed_${i}`,
        ...s,
        sessionDate: s.sessionDate.toISOString(),
        createdAt: now,
        updatedAt: now,
      });
    });
  }
}
