import mongoose from 'mongoose';
import ActivityRecord from '../models/ActivityRecord.js';
import { ACTIVITY_SEED } from '../data/crmSeed.js';

const memory = [];
let memSeq = 1;

function useDb() {
  return mongoose.connection.readyState === 1;
}

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const ts = o.timestamp instanceof Date ? o.timestamp : new Date(o.timestamp || Date.now());
  return {
    _id: String(o._id),
    type: o.type,
    actor: o.actor || {},
    action: o.action || '',
    target: o.target || '',
    description: o.description || '',
    message: o.message || o.description || o.action || '',
    timestamp: ts,
    createdAt: ts.toISOString(),
  };
}

export async function listActivities(limit = 50) {
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 200);
  if (useDb()) {
    const docs = await ActivityRecord.find()
      .sort({ timestamp: -1 })
      .limit(cap)
      .lean();
    return docs.map((d) => toClient(d));
  }
  return [...memory]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, cap)
    .map((d) => toClient(d));
}

export async function getActivityById(id) {
  if (useDb()) {
    const doc = await ActivityRecord.findById(id).lean();
    return toClient(doc);
  }
  const item = memory.find((a) => a._id === id);
  return item ? toClient(item) : null;
}

export async function createActivity(body) {
  const _id = body._id || `act${memSeq++}_${Date.now()}`;
  const data = {
    _id,
    type: body.type || 'system',
    actor: body.actor || {},
    action: body.action || '',
    target: body.target || '',
    description: body.description || '',
    message: body.message || body.description || '',
    timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
  };

  if (useDb()) {
    const doc = await ActivityRecord.create(data);
    return toClient(doc);
  }

  memory.unshift(data);
  if (memory.length > 500) memory.pop();
  return toClient(data);
}

export async function updateActivity(id, body) {
  const patch = { ...body };
  delete patch._id;
  if (patch.timestamp) patch.timestamp = new Date(patch.timestamp);

  if (useDb()) {
    const doc = await ActivityRecord.findByIdAndUpdate(id, { $set: patch }, { new: true });
    return toClient(doc);
  }

  const idx = memory.findIndex((a) => a._id === id);
  if (idx === -1) return null;
  memory[idx] = { ...memory[idx], ...patch };
  return toClient(memory[idx]);
}

export async function deleteActivity(id) {
  if (useDb()) {
    const doc = await ActivityRecord.findByIdAndDelete(id);
    return toClient(doc);
  }
  const idx = memory.findIndex((a) => a._id === id);
  if (idx === -1) return null;
  const [removed] = memory.splice(idx, 1);
  return toClient(removed);
}

export async function seedActivitiesIfEmpty() {
  if (useDb()) {
    const count = await ActivityRecord.countDocuments();
    if (count === 0) {
      await ActivityRecord.insertMany(
        ACTIVITY_SEED.map((s, i) => ({
          _id: s._id || `act_seed_${i}`,
          type: s.type,
          actor: s.actor || {},
          action: s.action || '',
          target: s.target || '',
          description: s.description || '',
          message: s.description || s.action || '',
          timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
        }))
      );
    }
    return;
  }
  if (memory.length === 0) {
    ACTIVITY_SEED.forEach((s, i) => {
      memory.push({
        _id: s._id || `act_seed_${i}`,
        ...s,
        timestamp: s.timestamp ? new Date(s.timestamp) : new Date(),
      });
    });
  }
}
