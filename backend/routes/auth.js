// backend/routes/auth.js
/**
 * Authentication routes
 * POST /api/auth/login
 * POST /api/auth/register
 * POST /api/auth/refresh
 * GET /api/auth/profile
 * POST /api/auth/logout
 */

import express from "express";
import { validate } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../schemas/auth.schema.js";
import {
  login,
  register,
  refreshToken,
  getProfile,
  logout,
} from "../controllers/authController.js";
import {
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  sendVerificationEmail,
} from "../controllers/emailAuthController.js";
import authGoogle from "./authGoogle.js";

const router = express.Router();

// Google SSO (GET /api/auth/google, /api/auth/google/callback)
router.use("/", authGoogle);

// Public routes
router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/refresh", validate(refreshTokenSchema), refreshToken);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);
router.post("/send-verification", authenticate, sendVerificationEmail);

export default router;
