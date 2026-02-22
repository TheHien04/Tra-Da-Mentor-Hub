/**
 * Slot rảnh (interview / mentoring) – mentor thêm slot, mentee chọn (không cần Google Calendar)
 * meetingLink: mentor paste link Google Meet (hoặc sau tích hợp API tạo link)
 */

import express from 'express';

const router = express.Router();

let slots = [
  {
    _id: 'slot1',
    mentorId: 'm1',
    date: '2025-02-20',
    time: '14:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
    bookedBy: null,
    menteeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'slot2',
    mentorId: 'm1',
    date: '2025-02-21',
    time: '10:00',
    duration: 45,
    meetingLink: '',
    bookedBy: null,
    menteeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'slot3',
    mentorId: 'm2',
    date: '2025-02-22',
    time: '15:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/yyy-yyyy-yyy',
    bookedBy: '102',
    menteeId: '102',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET /api/slots – list (query: mentorId, menteeId, availableOnly)
router.get('/', (req, res) => {
  let list = [...slots];
  const { mentorId, menteeId, availableOnly } = req.query;
  if (mentorId) list = list.filter((s) => s.mentorId === mentorId);
  if (menteeId) list = list.filter((s) => s.menteeId === menteeId);
  if (availableOnly === 'true') list = list.filter((s) => !s.bookedBy);
  list.sort((a, b) => {
    const d = (new Date(a.date + 'T' + a.time).getTime()) - (new Date(b.date + 'T' + b.time).getTime());
    return d;
  });
  res.json(list);
});

// POST /api/slots – mentor thêm slot (body: mentorId, date, time, duration, meetingLink?)
router.post('/', (req, res) => {
  const { mentorId, date, time, duration, meetingLink } = req.body;
  if (!mentorId || !date || !time || !duration) {
    return res.status(400).json({ message: 'mentorId, date, time, duration là bắt buộc' });
  }
  const newSlot = {
    _id: 'slot' + (slots.length + 1),
    mentorId,
    date: String(date).slice(0, 10),
    time: String(time).slice(0, 5),
    duration: Number(duration) || 60,
    meetingLink: meetingLink || '',
    bookedBy: null,
    menteeId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  slots.push(newSlot);
  res.status(201).json(newSlot);
});

// PATCH /api/slots/:id/book – mentee chọn slot (body: menteeId)
router.patch('/:id/book', (req, res) => {
  const { menteeId } = req.body;
  if (!menteeId) return res.status(400).json({ message: 'menteeId là bắt buộc' });
  const slot = slots.find((s) => s._id === req.params.id);
  if (!slot) return res.status(404).json({ message: 'Không tìm thấy slot' });
  if (slot.bookedBy) return res.status(400).json({ message: 'Slot đã được đặt' });
  slot.bookedBy = menteeId;
  slot.menteeId = menteeId;
  slot.updatedAt = new Date().toISOString();
  res.json(slot);
});

// PATCH /api/slots/:id – cập nhật slot (mentor: meetingLink, v.v.)
router.patch('/:id', (req, res) => {
  const slot = slots.find((s) => s._id === req.params.id);
  if (!slot) return res.status(404).json({ message: 'Không tìm thấy slot' });
  const { date, time, duration, meetingLink } = req.body;
  if (date) slot.date = String(date).slice(0, 10);
  if (time) slot.time = String(time).slice(0, 5);
  if (duration != null) slot.duration = Number(duration);
  if (meetingLink !== undefined) slot.meetingLink = meetingLink;
  slot.updatedAt = new Date().toISOString();
  res.json(slot);
});

export default router;
