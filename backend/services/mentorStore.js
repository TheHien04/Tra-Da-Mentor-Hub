import mongoose from 'mongoose';
import MentorProfile from '../models/MentorProfile.js';
import { MENTOR_SEED } from '../data/crmSeed.js';
import { logMentorCreated } from './activityLogger.js';

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
    mentees: o.mentees || [],
    groups: o.groups || [],
    expertise: o.expertise || [],
  };
}

export async function listMentors() {
  if (useDb()) {
    const docs = await MentorProfile.find().sort({ name: 1 }).lean();
    return docs.map((d) => toClient(d));
  }
  return [...memory];
}

export async function getMentorById(id) {
  if (useDb()) {
    const doc = await MentorProfile.findById(id).lean();
    return toClient(doc);
  }
  return memory.find((m) => m._id === id) || null;
}

export async function createMentor(body) {
  const _id = body._id || `m${Date.now()}`;
  const data = {
    _id,
    ...body,
    mentees: body.mentees || [],
    groups: body.groups || [],
    expertise: body.expertise || [],
  };
  delete data.createdAt;
  delete data.updatedAt;

  let result;
  if (useDb()) {
    const doc = await MentorProfile.create(data);
    result = toClient(doc);
  } else {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    memory.push(item);
    result = item;
  }
  logMentorCreated(result);
  return result;
}

export async function updateMentor(id, body, { replace = false } = {}) {
  const existing = await getMentorById(id);
  if (!existing) return null;

  const patch = replace
    ? { ...body, _id: id, mentees: body.mentees ?? existing.mentees, groups: body.groups ?? existing.groups }
    : { ...body };

  delete patch._id;
  delete patch.createdAt;

  if (useDb()) {
    const doc = await MentorProfile.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true });
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

export async function deleteMentor(id) {
  if (useDb()) {
    const doc = await MentorProfile.findByIdAndDelete(id);
    return toClient(doc);
  }
  const idx = memory.findIndex((m) => m._id === id);
  if (idx === -1) return null;
  const [removed] = memory.splice(idx, 1);
  return removed;
}

export async function seedMentorsIfEmpty() {
  if (useDb()) {
    const count = await MentorProfile.countDocuments();
    if (count === 0) {
      await MentorProfile.insertMany(
        MENTOR_SEED.map(({ _id, name, email, phone, track, bio, expertise, maxMentees, mentees, groups, mentorshipType, duration }) => ({
          _id,
          name,
          email,
          phone,
          track,
          bio,
          expertise,
          maxMentees,
          mentees,
          groups,
          mentorshipType,
          duration,
        }))
      );
    }
    return;
  }
  if (memory.length === 0) {
    MENTOR_SEED.forEach((s) => memory.push({ ...s }));
  }
}
