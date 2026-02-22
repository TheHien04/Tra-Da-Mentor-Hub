/**
 * Session Log API – CRM sau mỗi buổi mentoring (flow)
 * GET /api/session-logs – list (filter by mentor / mentee / admin)
 * POST /api/session-logs – create or update (mentor/mentee điền log)
 */

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

// In-memory store (fallback when DB not used). Có thể thay bằng SessionLog model.
let sessionLogs = [
  {
    _id: "sl1",
    mentorId: "m1",
    menteeId: "101",
    sessionDate: "2025-12-19T00:00:00.000Z",
    topic: "React hooks và state management",
    mentorScore: 5,
    menteeScore: 5,
    mentorNeedsSupport: false,
    mentorSupportReason: null,
    menteeNeedsSupport: false,
    menteeSupportReason: null,
    completedByMentor: true,
    completedByMentee: true,
    createdAt: "2025-12-19T16:00:00.000Z",
    updatedAt: "2025-12-19T16:00:00.000Z",
  },
  {
    _id: "sl2",
    mentorId: "m2",
    menteeId: "102",
    sessionDate: "2025-12-20T00:00:00.000Z",
    topic: "Node.js backend architecture",
    mentorScore: 4,
    menteeScore: 5,
    mentorNeedsSupport: false,
    menteeNeedsSupport: true,
    menteeSupportReason: "Cần tài liệu thêm về Docker",
    completedByMentor: true,
    completedByMentee: true,
    createdAt: "2025-12-20T11:00:00.000Z",
    updatedAt: "2025-12-20T11:00:00.000Z",
  },
];

// GET /api/session-logs – list (query: role, mentorId, menteeId, asMentor, asMentee)
router.get("/", (req, res) => {
  const { role } = req.user;
  let list = [...sessionLogs];

  // Mentor: chỉ xem log của mình (mentorId = current user's mentor id). Admin: xem hết.
  // Ở đây mock chưa có userId→mentorId, nên tạm trả hết; sau gắn với auth.
  if (role === "admin") {
    // Admin xem tất cả
  } else if (role === "mentor") {
    // TODO: filter by req.user → mentorId khi có link User–Mentor
    // list = list.filter(log => log.mentorId === req.user.mentorId);
  } else if (role === "mentee") {
    // list = list.filter(log => log.menteeId === req.user.menteeId);
  }

  const mentorId = req.query.mentorId;
  const menteeId = req.query.menteeId;
  if (mentorId) list = list.filter((l) => l.mentorId === mentorId);
  if (menteeId) list = list.filter((l) => l.menteeId === menteeId);

  list.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
  res.json(list);
});

// POST /api/session-logs – create or update (upsert by mentorId + menteeId + sessionDate)
router.post("/", (req, res) => {
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
  } = req.body;

  if (!mentorId || !menteeId || !sessionDate || !topic) {
    return res.status(400).json({
      success: false,
      message: "mentorId, menteeId, sessionDate, topic are required",
    });
  }

  const dateNorm = new Date(sessionDate).toISOString().split("T")[0];
  const existing = sessionLogs.find(
    (l) =>
      l.mentorId === mentorId &&
      l.menteeId === menteeId &&
      l.sessionDate?.toString().startsWith(dateNorm)
  );

  const payload = {
    mentorId,
    menteeId,
    sessionDate: new Date(sessionDate),
    topic: topic || "",
    mentorScore: mentorScore != null ? Number(mentorScore) : null,
    menteeScore: menteeScore != null ? Number(menteeScore) : null,
    mentorNeedsSupport: Boolean(mentorNeedsSupport),
    mentorSupportReason: mentorSupportReason || null,
    menteeNeedsSupport: Boolean(menteeNeedsSupport),
    menteeSupportReason: menteeSupportReason || null,
    completedByMentor: Boolean(completedByMentor),
    completedByMentee: Boolean(completedByMentee),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, payload);
    return res.json(existing);
  }

  const newLog = {
    _id: "sl" + (sessionLogs.length + 1),
    ...payload,
    createdAt: payload.updatedAt,
  };
  sessionLogs.push(newLog);
  res.status(201).json(newLog);
});

// GET /api/session-logs/needs-support – admin: danh sách log có needs support
router.get("/needs-support", authorize("admin"), (req, res) => {
  const list = sessionLogs.filter(
    (l) => l.mentorNeedsSupport === true || l.menteeNeedsSupport === true
  );
  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(list);
});

export default router;
