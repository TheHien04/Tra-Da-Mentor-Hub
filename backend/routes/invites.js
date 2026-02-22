/**
 * Admin invite – tạo link mời mentor/mentee qua email (flow)
 * Gửi email thật cần cấu hình SMTP (env); không có thì trả link để admin copy/gửi tay
 */

import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const INVITE_EXPIRY_DAYS = 7;
const invites = new Map(); // token -> { email, role, createdAt }

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST /api/invites – admin tạo invite (body: email, role) -> trả link
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { email, role } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const r = (role || 'mentee').toLowerCase();
  if (!['mentor', 'mentee', 'admin'].includes(r)) {
    return res.status(400).json({ message: 'Role must be mentor, mentee, or admin' });
  }
  const token = generateToken();
  const data = {
    email: email.trim().toLowerCase(),
    role: r,
    createdAt: new Date().toISOString(),
  };
  invites.set(token, data);
  // Frontend URL – có thể lấy từ env
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${baseUrl}/register?invite=${token}`;
  res.status(201).json({
    success: true,
    link,
    token,
    email: data.email,
    role: data.role,
    expiresIn: INVITE_EXPIRY_DAYS + ' days',
    message: 'Send this link to the user via email or Zalo. Real email sending requires SMTP in .env',
  });
});

// GET /api/invites/validate/:token – kiểm tra invite token (frontend gọi khi vào /register?invite=TOKEN)
router.get('/validate/:token', (req, res) => {
  const data = invites.get(req.params.token);
  if (!data) {
    return res.status(404).json({ valid: false, message: 'Invite link is invalid or expired' });
  }
  const created = new Date(data.createdAt);
  const expiry = new Date(created.getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  if (new Date() > expiry) {
    invites.delete(req.params.token);
    return res.status(410).json({ valid: false, message: 'Invite link has expired' });
  }
  res.json({ valid: true, email: data.email, role: data.role });
});

export default router;
