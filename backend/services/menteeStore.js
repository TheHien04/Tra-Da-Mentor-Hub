import MenteeProfile, { APPLICATION_STATUSES } from '../models/MenteeProfile.js';
import {
  allowedApplicationTransitions,
  applicationTransitionError,
  canTransitionApplication,
} from '../domain/applicationLifecycle.js';
import { MENTEE_SEED } from '../data/crmSeed.js';
import { logMenteeCreated } from './activityLogger.js';
import { queryMemoryDirectory, queryMongoDirectory } from '../lib/directoryQuery.js';
import { useDb } from '../lib/dataMode.js';

const memory = [];

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    ...o,
    _id: String(o._id),
    applicationStatus: o.applicationStatus || 'pending',
    applicationHistory: o.applicationHistory || [],
    interests: o.interests || [],
  };
}

export { APPLICATION_STATUSES };

export async function listMentees() {
  if (useDb()) {
    const docs = await MenteeProfile.find().sort({ name: 1 }).lean();
    return docs.map((d) => toClient(d));
  }
  return memory.map((m) => ({
    ...m,
    applicationStatus: m.applicationStatus || 'pending',
    applicationHistory: m.applicationHistory || [],
  }));
}

export async function getMenteeById(id) {
  if (useDb()) {
    const doc = await MenteeProfile.findById(id).lean();
    return toClient(doc);
  }
  const m = memory.find((x) => x._id === id);
  return m
    ? {
        ...m,
        applicationStatus: m.applicationStatus || 'pending',
        applicationHistory: m.applicationHistory || [],
      }
    : null;
}

export async function createMentee(body) {
  const email = String(body.email || '').toLowerCase().trim();
  if (email) {
    const duplicate = useDb()
      ? await MenteeProfile.findOne({ email }).lean()
      : memory.find((m) => String(m.email || '').toLowerCase() === email);
    if (duplicate) {
      const error = new Error('EMAIL_TAKEN');
      error.code = 'EMAIL_TAKEN';
      throw error;
    }
  }

  const _id = body._id || String(Date.now());
  const data = {
    _id,
    ...body,
    email,
    userId: body.userId || null,
    applicationStatus: body.applicationStatus || 'pending',
    applicationHistory: [],
    interests: body.interests || [],
  };
  delete data.createdAt;
  delete data.updatedAt;

  let result;
  if (useDb()) {
    const doc = await MenteeProfile.create(data);
    result = toClient(doc);
  } else {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    memory.push(item);
    result = item;
  }
  logMenteeCreated(result);
  return result;
}

export async function updateMentee(id, body, { replace = false } = {}) {
  const existing = await getMenteeById(id);
  if (!existing) return null;

  const patch = replace ? { ...body } : { ...body };
  delete patch._id;
  delete patch.createdAt;

  if (useDb()) {
    const doc = await MenteeProfile.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true });
    return toClient(doc);
  }

  const idx = memory.findIndex((m) => m._id === id);
  const updated = {
    ...existing,
    ...patch,
    _id: id,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  };
  memory[idx] = updated;
  return updated;
}

/** Assign once, without silently moving a mentee away from another group. */
export async function assignMenteeToGroup(id, groupId) {
  if (useDb()) {
    const doc = await MenteeProfile.findOneAndUpdate(
      { _id: id, $or: [{ groupId: null }, { groupId: { $exists: false } }, { groupId }] },
      { $set: { groupId } },
      { new: true, runValidators: true }
    );
    return toClient(doc);
  }
  const idx = memory.findIndex((m) => m._id === id);
  if (idx === -1) return null;
  if (memory[idx].groupId && memory[idx].groupId !== groupId) return null;
  memory[idx] = { ...memory[idx], groupId, updatedAt: new Date() };
  return toClient(memory[idx]);
}

export async function clearMenteeGroup(id, groupId) {
  if (useDb()) {
    const doc = await MenteeProfile.findOneAndUpdate(
      { _id: id, groupId },
      { $set: { groupId: null } },
      { new: true, runValidators: true }
    );
    return toClient(doc);
  }
  const idx = memory.findIndex((m) => m._id === id && m.groupId === groupId);
  if (idx === -1) return null;
  memory[idx] = { ...memory[idx], groupId: null, updatedAt: new Date() };
  return toClient(memory[idx]);
}

export async function updateMenteeApplicationStatus(id, applicationStatus, context = {}) {
  if (!APPLICATION_STATUSES.includes(applicationStatus)) {
    return { error: 'invalid_status' };
  }

  const existing = await getMenteeById(id);
  if (!existing) return null;
  const currentStatus = existing.applicationStatus || 'pending';
  if (!canTransitionApplication(currentStatus, applicationStatus)) {
    return applicationTransitionError(currentStatus, applicationStatus);
  }

  const historyEntry = {
    from: currentStatus,
    to: applicationStatus,
    changedAt: new Date(),
    actorId: String(context.actorId || ''),
    actorRole: String(context.actorRole || ''),
    reason: String(context.reason || '').trim().slice(0, 500),
  };

  if (useDb()) {
    const statusFilter = currentStatus === 'pending'
      ? { $or: [{ applicationStatus: 'pending' }, { applicationStatus: null }, { applicationStatus: { $exists: false } }] }
      : { applicationStatus: currentStatus };
    const doc = await MenteeProfile.findOneAndUpdate(
      { _id: id, ...statusFilter },
      { $set: { applicationStatus }, $push: { applicationHistory: historyEntry } },
      { new: true, runValidators: true }
    );
    if (doc) return toClient(doc);

    const latest = await getMenteeById(id);
    if (!latest) return null;
    return applicationTransitionError(latest.applicationStatus || 'pending', applicationStatus);
  }

  const idx = memory.findIndex((m) => m._id === id);
  memory[idx] = {
    ...memory[idx],
    applicationStatus,
    applicationHistory: [...(memory[idx].applicationHistory || []), historyEntry],
    updatedAt: new Date(),
  };
  return toClient(memory[idx]);
}

export { allowedApplicationTransitions };

export async function deleteMentee(id) {
  if (useDb()) {
    const doc = await MenteeProfile.findByIdAndDelete(id);
    return toClient(doc);
  }
  const idx = memory.findIndex((m) => m._id === id);
  if (idx === -1) return null;
  const [removed] = memory.splice(idx, 1);
  return removed;
}

export async function seedMenteesIfEmpty() {
  if (useDb()) {
    const count = await MenteeProfile.countDocuments();
    if (count === 0) {
      await MenteeProfile.insertMany(
        MENTEE_SEED.map((s) => ({
          _id: s._id,
          name: s.name,
          email: s.email,
          phone: s.phone || '',
          track: s.track,
          school: s.school || '',
          interests: s.interests || [],
          progress: s.progress ?? 0,
          mentorId: s.mentorId || null,
          groupId: s.groupId || null,
          mentorshipType: s.mentorshipType || 'GROUP',
          applicationStatus: s.applicationStatus || 'pending',
          applicationHistory: s.applicationHistory || [],
        }))
      );
    }
    return;
  }
  if (memory.length === 0) {
    MENTEE_SEED.forEach((s) => memory.push({ ...s }));
  }
}

const MENTEE_TEXT = ['name', 'email', 'school', 'track', 'interests'];

export async function queryMenteeDirectory(query, baseFilter) {
  if (!useDb()) {
    const rows = memory.map((row) => ({
      ...row,
      applicationStatus: row.applicationStatus || 'pending',
      applicationHistory: row.applicationHistory || [],
    }));
    return queryMemoryDirectory(rows, query, MENTEE_TEXT, baseFilter);
  }
  return queryMongoDirectory(MenteeProfile, query, {
    textFields: MENTEE_TEXT,
    skillFields: ['interests'],
    baseFilter,
    map: toClient,
  });
}
