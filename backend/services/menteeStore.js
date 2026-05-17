import mongoose from 'mongoose';
import MenteeProfile, { APPLICATION_STATUSES } from '../models/MenteeProfile.js';
import { MENTEE_SEED } from '../data/crmSeed.js';
import { logMenteeCreated } from './activityLogger.js';

const memory = [];

function useDb() {
  return mongoose.connection.readyState === 1;
}

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    ...o,
    _id: String(o._id),
    applicationStatus: o.applicationStatus || 'pending',
    interests: o.interests || [],
  };
}

export { APPLICATION_STATUSES };

export async function listMentees() {
  if (useDb()) {
    const docs = await MenteeProfile.find().sort({ name: 1 }).lean();
    return docs.map((d) => toClient(d));
  }
  return memory.map((m) => ({ ...m, applicationStatus: m.applicationStatus || 'pending' }));
}

export async function getMenteeById(id) {
  if (useDb()) {
    const doc = await MenteeProfile.findById(id).lean();
    return toClient(doc);
  }
  const m = memory.find((x) => x._id === id);
  return m ? { ...m, applicationStatus: m.applicationStatus || 'pending' } : null;
}

export async function createMentee(body) {
  const _id = body._id || String(Date.now());
  const data = {
    _id,
    ...body,
    applicationStatus: body.applicationStatus || 'pending',
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

export async function updateMenteeApplicationStatus(id, applicationStatus) {
  if (!APPLICATION_STATUSES.includes(applicationStatus)) {
    return { error: 'invalid_status' };
  }
  return updateMentee(id, { applicationStatus });
}

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
        }))
      );
    }
    return;
  }
  if (memory.length === 0) {
    MENTEE_SEED.forEach((s) => memory.push({ ...s }));
  }
}
