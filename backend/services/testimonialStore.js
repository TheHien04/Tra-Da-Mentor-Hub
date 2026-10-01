import Testimonial from '../models/Testimonial.js';
import { TESTIMONIAL_DEMO } from '../data/demoContentSeed.js';
import { useDb } from '../lib/dataMode.js';

const memory = [];

const SEED = TESTIMONIAL_DEMO;
const DEMO_TARGET_MIN = 12;

function testimonialKey(s) {
  return `${s.menteeName}:${s.mentorName}:${s.date}`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function safeSearchPattern(q) {
  return new RegExp(escapeRegex(String(q).slice(0, 80)), 'i');
}

function clampRating(value) {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, rating));
}

function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

const TRACKS = new Set(['career', 'personal', 'soft_skills']);
const STATUSES = new Set(['PUBLISHED', 'PENDING', 'REJECTED']);

function cleanTrack(value) {
  const track = cleanText(value || 'career', 40);
  return TRACKS.has(track) ? track : 'career';
}

function toClient(doc) {
  if (!doc) return null;
  const o = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
  return {
    _id: String(o._id),
    menteeName: o.menteeName,
    mentorName: o.mentorName,
    content: o.content,
    rating: Number(o.rating) || 5,
    track: o.track || 'career',
    date: o.date || new Date().toISOString().split('T')[0],
    status: o.status || 'PENDING',
  };
}

export async function listTestimonials(query = {}) {
  const { status, track, q } = query;
  if (useDb()) {
    const filter = {};
    if (status) filter.status = status;
    if (track) filter.track = track;
    if (q) {
      const re = safeSearchPattern(q);
      filter.$or = [{ menteeName: re }, { mentorName: re }, { content: re }];
    }
    const docs = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toClient(d));
  }
  return memory.filter((t) => {
    if (status && t.status !== status) return false;
    if (track && t.track !== track) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        t.menteeName.toLowerCase().includes(s) ||
        t.mentorName.toLowerCase().includes(s) ||
        t.content.toLowerCase().includes(s)
      );
    }
    return true;
  });
}

export async function createTestimonial(payload) {
  const data = {
    menteeName: cleanText(payload.menteeName, 80),
    mentorName: cleanText(payload.mentorName, 80),
    content: cleanText(payload.content, 2000),
    rating: clampRating(payload.rating),
    track: cleanTrack(payload.track),
    status: payload.status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
    date: payload.date || new Date().toISOString().split('T')[0],
  };
  if (useDb()) {
    const doc = await Testimonial.create(data);
    return toClient(doc);
  }
  const item = { _id: `t_${Date.now()}`, ...data };
  memory.unshift(item);
  return item;
}

export async function updateTestimonial(id, updates) {
  const patch = { ...updates };
  if (patch.menteeName !== undefined) patch.menteeName = cleanText(patch.menteeName, 80);
  if (patch.mentorName !== undefined) patch.mentorName = cleanText(patch.mentorName, 80);
  if (patch.content !== undefined) patch.content = cleanText(patch.content, 2000);
  if (patch.rating !== undefined) patch.rating = clampRating(patch.rating);
  if (patch.track !== undefined) patch.track = cleanTrack(patch.track);
  if (patch.status !== undefined && !STATUSES.has(patch.status)) delete patch.status;
  if (useDb()) {
    const doc = await Testimonial.findByIdAndUpdate(
      id,
      { $set: patch },
      { new: true, runValidators: true }
    );
    return toClient(doc);
  }
  const idx = memory.findIndex((t) => t._id === id);
  if (idx === -1) return null;
  memory[idx] = { ...memory[idx], ...patch };
  return memory[idx];
}

export async function deleteTestimonial(id) {
  if (useDb()) {
    const doc = await Testimonial.findByIdAndDelete(id);
    return toClient(doc);
  }
  const idx = memory.findIndex((t) => t._id === id);
  if (idx === -1) return null;
  const [removed] = memory.splice(idx, 1);
  return removed;
}

export async function seedTestimonialsIfEmpty() {
  if (useDb()) {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(SEED);
      return;
    }
    if (count < DEMO_TARGET_MIN) {
      const existing = await Testimonial.find().select('menteeName mentorName date').lean();
      const keys = new Set(existing.map((e) => testimonialKey(e)));
      const missing = SEED.filter((s) => !keys.has(testimonialKey(s)));
      if (missing.length) {
        await Testimonial.insertMany(missing.slice(0, DEMO_TARGET_MIN - count));
      }
    }
    return;
  }
  if (memory.length === 0) {
    SEED.forEach((s, i) => memory.push({ _id: `t_seed_${i}`, ...s }));
    return;
  }
  if (memory.length < DEMO_TARGET_MIN) {
    const keys = new Set(memory.map((e) => testimonialKey(e)));
    const missing = SEED.filter((s) => !keys.has(testimonialKey(s)));
    missing.slice(0, DEMO_TARGET_MIN - memory.length).forEach((s, i) => {
      memory.push({ _id: `t_seed_${memory.length + i}`, ...s });
    });
  }
}
