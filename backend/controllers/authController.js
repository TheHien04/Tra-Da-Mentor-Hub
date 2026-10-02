// backend/controllers/authController.js
/**
 * Authentication controller
 * Handle login, register, token refresh
 */

import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  accessTtlSeconds,
} from "../utils/jwt.js";
import logger from '../config/logger.js';
import { DEMO_USER, isDemoAuthEnabled, isDemoUserId } from '../config/demoAuth.js';
import { fail } from '../lib/httpError.js';
import { ensureCrmProfileForUser } from '../services/crmProfileSync.js';
import { setSessionCookies, clearSessionCookies, readRefreshCookie } from '../lib/sessionCookie.js';
import { forgetAccountActive } from '../lib/activeUser.js';
import { emailVerifiedOnRegister, mustVerifyEmail } from '../lib/accountPolicy.js';
import { sendEmailVerification } from '../utils/emailService.js';
import env from '../config/env.js';

function issueSession(res, { accessToken, refreshToken }) {
  setSessionCookies(res, {
    accessToken,
    refreshToken,
    accessMaxAgeMs: accessTtlSeconds() * 1000,
  });
}

/** Browsers keep tokens in httpOnly cookies. Tests still receive them in JSON. */
function clientSession(data, tokens) {
  const body = { ...data, expiresIn: accessTtlSeconds() };
  if (process.env.NODE_ENV === 'test') {
    body.accessToken = tokens.accessToken;
    body.refreshToken = tokens.refreshToken;
  }
  return body;
}

/**
 * Login handler
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    if (isDemoAuthEnabled() && normalizedEmail === DEMO_USER.email.toLowerCase()) {
      logger.info("Using demo admin account");
      const user = DEMO_USER;
      
      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logger.warn(`Login failed - Invalid password for: ${email} from IP: ${req.ip}`);
        return fail(res, 401, 'INVALID_CREDENTIALS');
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.email, user.role);
      const refreshToken = generateRefreshToken(user._id);
      issueSession(res, { accessToken, refreshToken });
      
      logger.info(`Login successful (mock user): ${email} (${user.role}) from IP: ${req.ip}`);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: clientSession({ user: user.toJSON() }, { accessToken, refreshToken }),
      });
    }

    // Try to find user in database (for real users)
    let user;
    try {
      user = await User.findByEmailWithPassword(email);
    } catch (dbError) {
      logger.warn("Database error:", dbError.message);
    }

    if (!user) {
      logger.warn(`Login failed - User not found: ${email} from IP: ${req.ip}`);
      return fail(res, 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn(`Login failed - Invalid password for: ${email} from IP: ${req.ip}`);
      return fail(res, 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Login failed - Account inactive: ${email} from IP: ${req.ip}`);
      return fail(res, 403, 'ACCOUNT_INACTIVE');
    }

    if (mustVerifyEmail(user, Boolean(env.sendgridApiKey))) {
      logger.warn(`Login failed - Email not verified: ${email} from IP: ${req.ip}`);
      return fail(res, 403, 'EMAIL_UNVERIFIED');
    }

    // Update last login and store refresh token (skip for mock user)
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    if (!isDemoUserId(user._id)) {
      await user.updateLastLogin();
      await user.addRefreshToken(refreshToken);
    }
    issueSession(res, { accessToken, refreshToken });

    let crmIds = {};
    try {
      crmIds = await ensureCrmProfileForUser({
        email: user.email,
        name: user.name,
        role: user.role,
        userId: user._id.toString(),
      });
    } catch (crmErr) {
      logger.warn('CRM profile sync on login failed:', crmErr.message);
    }
    
    logger.info(`Login successful: ${email} (${user.role}) from IP: ${req.ip}`);

    // Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
        data: clientSession({ user: { ...user.toJSON(), ...crmIds } }, { accessToken, refreshToken }),
    });
  } catch (error) {
    logger.error("Login error:", { error: error.message, email: req.body?.email, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

/**
 * Register handler
 */
export async function register(req, res) {
  try {
    const { email, password, name, role: bodyRole, inviteToken } = req.body;

    let role = bodyRole || "user";
    if (inviteToken) {
      const { validateInviteToken } = await import("../services/inviteStore.js");
      const check = await validateInviteToken(inviteToken);
      if (!check.valid) {
        return res.status(check.status || 400).json({
          success: false,
          message: check.message,
        });
      }
      if (email.trim().toLowerCase() !== check.email) {
        return res.status(400).json({
          success: false,
          message: "Email must match the invited address",
        });
      }
      role = check.role;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed - Email already exists: ${email} from IP: ${req.ip}`);
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const mailConfigured = Boolean(env.sendgridApiKey);
    const emailVerified = emailVerifiedOnRegister({
      invited: Boolean(inviteToken),
      mailConfigured,
    });

    // Create user
    const newUser = await User.create({
      email,
      password,
      name,
      role,
      emailVerified,
    });

    if (mailConfigured && !emailVerified) {
      const token = newUser.generateEmailVerificationToken();
      await newUser.save();
      await sendEmailVerification(newUser, token);
      logger.info(`Registration awaiting email verification: ${email}`);
      return res.status(201).json({
        success: true,
        needsVerification: true,
        message: 'Check your email to verify this account',
      });
    }

    // Legacy Mentor/Mentee collections are not the product profile.
    // CRM profiles (mentor_profiles / mentee_profiles) are created below.

    let crmIds = {};
    try {
      crmIds = await ensureCrmProfileForUser({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        userId: newUser._id.toString(),
      });
    } catch (crmErr) {
      logger.warn('CRM profile sync on register failed:', crmErr.message);
    }

    // Generate tokens
    const accessToken = generateAccessToken(
      newUser._id,
      newUser.email,
      newUser.role
    );
    const refreshToken = generateRefreshToken(newUser._id);
    
    // Store refresh token
    await newUser.addRefreshToken(refreshToken);
    issueSession(res, { accessToken, refreshToken });
    
    if (inviteToken) {
      const { consumeInviteToken } = await import("../services/inviteStore.js");
      await consumeInviteToken(inviteToken, { email });
    }

    logger.info(`User registered: ${email} (${role}) from IP: ${req.ip}`);

    // Return response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
        data: clientSession(
        { user: { ...newUser.toJSON(), ...crmIds } },
        { accessToken, refreshToken }
      ),
    });
  } catch (error) {
    logger.error("Register error:", { error: error.message, email: req.body?.email, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

/**
 * Refresh token handler
 */
export async function refreshToken(req, res) {
  try {
    const refreshToken = req.body?.refreshToken || readRefreshCookie(req);

    if (!refreshToken) {
      return fail(res, 400, 'VALIDATION', 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return fail(res, 401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
    }

    if (isDemoUserId(decoded.userId)) {
      if (!isDemoAuthEnabled()) {
        return fail(res, 401, 'UNAUTHORIZED', 'Invalid refresh token');
      }
      const newAccessToken = generateAccessToken(DEMO_USER._id, DEMO_USER.email, DEMO_USER.role);
      const newRefreshToken = generateRefreshToken(DEMO_USER._id);
      issueSession(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
      return res.status(200).json({
        success: true,
        message: "Token refreshed",
        data: clientSession({}, { accessToken: newAccessToken, refreshToken: newRefreshToken }),
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return fail(res, 401, 'UNAUTHORIZED', 'Invalid refresh token');
    }

    if (!user.isActive) {
      forgetAccountActive(user._id);
      return fail(res, 403, 'ACCOUNT_INACTIVE');
    }
    
    // Check if refresh token exists in user's token list
    const hasToken = user.refreshTokens?.some((rt) => rt.token === refreshToken);
    if (!hasToken) {
      logger.warn(`Invalid refresh token used for user: ${user.email} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user._id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);
    issueSession(res, { accessToken: newAccessToken, refreshToken: newRefreshToken });
    
    logger.info(`Token refreshed for user: ${user.email} from IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
        data: clientSession({}, { accessToken: newAccessToken, refreshToken: newRefreshToken }),
    });
  } catch (error) {
    logger.error("Refresh token error:", { error: error.message, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
  try {
    if (isDemoUserId(req.user.userId)) {
      return res.status(200).json({
        success: true,
        data: DEMO_USER.toJSON(),
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = { ...user.toJSON() };
    try {
      const crmIds = await ensureCrmProfileForUser({
        email: user.email,
        name: user.name,
        role: user.role,
        userId: user._id.toString(),
      });
      profile = { ...profile, ...crmIds };
    } catch {
      // non-fatal
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error("Get profile error:", { error: error.message, userId: req.user?.userId, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
}

/**
 * Logout handler
 * Note: Tokens are stateless, so logout just clears on client side
 * If you want to blacklist tokens, implement token blacklist
 */
export async function logout(req, res) {
  try {
    clearSessionCookies(res);
    const refreshToken = req.body?.refreshToken || readRefreshCookie(req);

    if (isDemoUserId(req.user?.userId)) {
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }

    if (refreshToken) {
      const user = await User.findById(req.user.userId);
      if (user) {
        await user.removeRefreshToken(refreshToken);
        logger.info(`User logged out: ${user.email} from IP: ${req.ip}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error:", { error: error.message, userId: req.user?.userId, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}
