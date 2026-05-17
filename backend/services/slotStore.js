import mongoose from 'mongoose';
import Slot from '../models/Slot.js';

const memory = [];
let memSeq = 1;

const SEED = [
  {
    mentorId: 'm1',
    date: '2025-02-20',
    time: '14:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
    bookedBy: null,
    menteeId: null,
  },
  {
    mentorId: 'm1',
    date: '2025-02-21',
    time: '10:00',
    duration: 45,
    meetingLink: '',
    bookedBy: null,
    menteeId: null,
  },
  {
    mentorId: 'm2',
    date: '2025-02-22',
    time: '15:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/yyy-yyyy-yyy',
    bookedBy: '102',
    menteeId: '102',
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
    date: o.date,
    time: o.time,
    duration: Number(o.duration) || 60,
    meetingLink: o.meetingLink || '',
    bookedBy: o.bookedBy ?? null,
    menteeId: o.menteeId ?? null,
    createdAt:
      o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt || new Date().toISOString(),
    updatedAt:
      o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt || new Date().toISOString(),
  };
}

function sortSlots(list) {
  return [...list].sort((a, b) => {
    const d =
      new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    return d;
  });
}

export async function listSlots({ mentorId, menteeId, availableOnly } = {}) {
  let list;
  if (useDb()) {
    const filter = {};
    if (mentorId) filter.mentorId = mentorId;
    if (menteeId) filter.menteeId = menteeId;
    if (availableOnly === true || availableOnly === 'true') {
      filter.bookedBy = null;
    }
    const docs = await Slot.find(filter).lean();
    list = docs.map((d) => toClient(d));
  } else {
    list = memory.filter((s) => {
      if (mentorId && s.mentorId !== mentorId) return false;
      if (menteeId && s.menteeId !== menteeId) return false;
      if (availableOnly === true || availableOnly === 'true') return !s.bookedBy;
      return true;
    });
  }
  return sortSlots(list);
}

export async function createSlot(payload) {
  const data = {
    mentorId: payload.mentorId,
    date: String(payload.date).slice(0, 10),
    time: String(payload.time).slice(0, 5),
    duration: Number(payload.duration) || 60,
    meetingLink: payload.meetingLink || '',
    bookedBy: null,
    menteeId: null,
  };

  if (useDb()) {
    const doc = await Slot.create(data);
    return toClient(doc);
  }

  const item = {
    _id: `slot${memSeq++}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memory.push(item);
  return item;
}

export async function getSlotById(id) {
  if (useDb()) {
    const doc = await Slot.findById(id);
    return toClient(doc);
  }
  return memory.find((s) => s._id === id) || null;
}

export async function bookSlot(id, menteeId) {
  if (useDb()) {
    const doc = await Slot.findOneAndUpdate(
      { _id: id, bookedBy: null },
      { bookedBy: menteeId, menteeId },
      { new: true }
    );
    return toClient(doc);
  }
  const slot = memory.find((s) => s._id === id);
  if (!slot || slot.bookedBy) return null;
  slot.bookedBy = menteeId;
  slot.menteeId = menteeId;
  slot.updatedAt = new Date().toISOString();
  return slot;
}

export async function updateSlot(id, updates) {
  const patch = {};
  if (updates.date) patch.date = String(updates.date).slice(0, 10);
  if (updates.time) patch.time = String(updates.time).slice(0, 5);
  if (updates.duration != null) patch.duration = Number(updates.duration);
  if (updates.meetingLink !== undefined) patch.meetingLink = updates.meetingLink;

  if (useDb()) {
    const doc = await Slot.findByIdAndUpdate(id, { $set: patch }, { new: true });
    return toClient(doc);
  }
  const slot = memory.find((s) => s._id === id);
  if (!slot) return null;
  Object.assign(slot, patch);
  slot.updatedAt = new Date().toISOString();
  return slot;
}

export async function seedSlotsIfEmpty() {
  if (useDb()) {
    const count = await Slot.countDocuments();
    if (count === 0) await Slot.insertMany(SEED);
    return;
  }
  if (memory.length === 0) {
    SEED.forEach((s, i) => {
      memory.push({
        _id: `slot_seed_${i}`,
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
}
