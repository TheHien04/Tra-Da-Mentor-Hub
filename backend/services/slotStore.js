import mongoose from 'mongoose';
import Slot from '../models/Slot.js';

const memory = [];
let memSeq = 1;

function useDb() {
  return mongoose.connection.readyState === 1;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Demo slots with dates relative to today (booked + open) */
function buildUpcomingSeed() {
  const templates = [
    { mentorId: 'm1', menteeId: '101', dayOffset: 1, time: '09:00', booked: true },
    { mentorId: 'm2', menteeId: '102', dayOffset: 2, time: '14:00', booked: true },
    { mentorId: 'm4', menteeId: '201', dayOffset: 3, time: '16:30', booked: true },
    { mentorId: 'm1', menteeId: null, dayOffset: 4, time: '10:00', booked: false },
    { mentorId: 'm3', menteeId: '202', dayOffset: 5, time: '15:00', booked: true },
    { mentorId: 'm5', menteeId: null, dayOffset: 7, time: '11:00', booked: false },
  ];

  return templates.map((t) => {
    const d = new Date();
    d.setDate(d.getDate() + t.dayOffset);
    return {
      mentorId: t.mentorId,
      date: d.toISOString().slice(0, 10),
      time: t.time,
      duration: 60,
      meetingLink: t.booked ? 'https://meet.google.com/trada-mentor-demo' : '',
      bookedBy: t.booked ? t.menteeId : null,
      menteeId: t.booked ? t.menteeId : null,
    };
  });
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
    googleCalendarEventId: o.googleCalendarEventId ?? null,
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
  if (updates.googleCalendarEventId !== undefined) {
    patch.googleCalendarEventId = updates.googleCalendarEventId;
  }

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

async function countUpcomingSlots() {
  const today = todayKey();
  if (useDb()) {
    return Slot.countDocuments({ date: { $gte: today } });
  }
  return memory.filter((s) => String(s.date) >= today).length;
}

export async function seedSlotsIfEmpty() {
  const upcoming = await countUpcomingSlots();
  const demos = buildUpcomingSeed();

  if (useDb()) {
    const total = await Slot.countDocuments();
    if (total === 0) {
      await Slot.insertMany(demos);
      return;
    }
    if (upcoming === 0) {
      await Slot.insertMany(demos);
    }
    return;
  }

  if (memory.length === 0 || upcoming === 0) {
    const base = memory.length;
    demos.forEach((s, i) => {
      memory.push({
        _id: `slot_seed_${base + i}`,
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }
}
