import mongoose from 'mongoose';
import StudyGroup from '../models/StudyGroup.js';
import { GROUP_SEED } from '../data/crmSeed.js';
import { logGroupCreated } from './activityLogger.js';
import { getMentorById } from './mentorStore.js';

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
    mentor: o.mentor || {},
    meetingSchedule: o.meetingSchedule || {},
  };
}

export async function listGroups() {
  if (useDb()) {
    const docs = await StudyGroup.find().sort({ name: 1 }).lean();
    return docs.map((d) => toClient(d));
  }
  return [...memory];
}

export async function getGroupById(id) {
  if (useDb()) {
    const doc = await StudyGroup.findById(id).lean();
    return toClient(doc);
  }
  return memory.find((g) => g._id === id) || null;
}

export async function createGroup(body) {
  const _id = body._id || String(Date.now());
  const data = {
    _id,
    ...body,
    mentees: body.mentees || [],
    mentor: body.mentor || {},
    meetingSchedule: body.meetingSchedule || {},
  };
  delete data.createdAt;
  delete data.updatedAt;

  let result;
  if (useDb()) {
    const doc = await StudyGroup.create(data);
    result = toClient(doc);
  } else {
    const item = { ...data, createdAt: new Date(), updatedAt: new Date() };
    memory.push(item);
    result = item;
  }
  const mentor = await getMentorById(result.mentorId);
  logGroupCreated(result, mentor?.name || result.mentor?.name);
  return result;
}

export async function updateGroup(id, body, { replace = false } = {}) {
  const existing = await getGroupById(id);
  if (!existing) return null;

  const patch = replace ? { ...body } : { ...body };
  delete patch._id;
  delete patch.createdAt;

  if (useDb()) {
    const doc = await StudyGroup.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true });
    return toClient(doc);
  }

  const idx = memory.findIndex((g) => g._id === id);
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

export async function addMenteeToGroup(groupId, menteeId) {
  const group = await getGroupById(groupId);
  if (!group) return null;
  const mentees = group.mentees.includes(menteeId) ? group.mentees : [...group.mentees, menteeId];
  return updateGroup(groupId, { mentees });
}

export async function removeMenteeFromGroup(groupId, menteeId) {
  const group = await getGroupById(groupId);
  if (!group) return null;
  const mentees = group.mentees.filter((id) => id !== menteeId);
  return updateGroup(groupId, { mentees });
}

export async function deleteGroup(id) {
  if (useDb()) {
    const doc = await StudyGroup.findByIdAndDelete(id);
    return toClient(doc);
  }
  const idx = memory.findIndex((g) => g._id === id);
  if (idx === -1) return null;
  const [removed] = memory.splice(idx, 1);
  return removed;
}

export async function seedGroupsIfEmpty() {
  if (useDb()) {
    const count = await StudyGroup.countDocuments();
    if (count === 0) {
      await StudyGroup.insertMany(
        GROUP_SEED.map((s) => ({
          _id: s._id,
          name: s.name,
          description: s.description,
          topic: s.topic,
          mentorId: s.mentorId,
          mentor: s.mentor || {},
          mentees: s.mentees || [],
          maxSize: s.maxSize,
          meetingSchedule: s.meetingSchedule || {},
        }))
      );
    }
    return;
  }
  if (memory.length === 0) {
    GROUP_SEED.forEach((s) => memory.push({ ...s }));
  }
}
