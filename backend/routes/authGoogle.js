/**
 * Google SSO – chỉ bật khi có GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET trong .env
 * Cài: npm install passport passport-google-oauth20
 * Cấu hình: Google Cloud Console → OAuth 2.0 Client → Redirect URI: http://localhost:5000/api/auth/google/callback
 */

import express from 'express';

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// GET /api/auth/google – redirect đến Google OAuth (hoặc 501 nếu chưa cấu hình)
router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      message: 'Google SSO chưa cấu hình. Thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào .env, cài passport + passport-google-oauth20. Xem docs/GOOGLE_SSO_SETUP.md',
    });
  }
  const baseUrl = process.env.BASE_URL || `http://${process.env.HOST || 'localhost'}:${process.env.PORT || '5000'}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const scope = 'email profile';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

// GET /api/auth/google/callback – Google gọi về sau khi user đăng nhập (cần đổi code lấy token rồi tạo JWT)
// Hiện tại trả 501; khi cấu hình xong Passport hoặc fetch token bằng code thì tạo user/jwt và redirect về frontend
router.get('/google/callback', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_no_code`);
  }
  // TODO: đổi code lấy access_token Google, lấy email/name từ Google, tìm hoặc tạo User, tạo JWT, redirect về frontend với token
  res.redirect(`${FRONTEND_URL}/login?error=google_callback_not_implemented&message=Đổi+code+lấy+token+chưa+implement.+Xem+docs/GOOGLE_SSO_SETUP.md`);
});

export default router;
