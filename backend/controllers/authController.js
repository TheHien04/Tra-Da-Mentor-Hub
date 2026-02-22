// backend/controllers/authController.js
/**
 * Authentication controller
 * Handle login, register, token refresh
 */

import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import logger from '../config/logger.js';

// Mock user for test/demo mode - Always available
const MOCK_USER = {
  _id: "mock-user-id-12345",
  email: "admin@example.com",
  password: "AdminPass123", // Plain text for demo only
  name: "Admin User",
  role: "admin", // Changed to admin role
  isActive: true,
  lastLogin: new Date(),
  toJSON() {
    return {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
    };
  },
  async comparePassword(password) {
    return password === this.password;
  }
};

/**
 * Login handler
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Debug logging
    logger.info(`Login attempt - Email: ${email}, Password length: ${password?.length || 0}`);
    logger.debug(`Request body:`, { email, password: password ? '***' : undefined });

    // Check mock user first (always available for demo)
    // Normalize email for comparison (lowercase, trim)
    const normalizedEmail = email?.toLowerCase().trim();
    if (normalizedEmail === MOCK_USER.email.toLowerCase()) {
      logger.info("Using mock user for demo");
      const user = MOCK_USER;
      
      // Check password
      const isValidPassword = await user.comparePassword(password);
      logger.debug(`Password check - Input: ${password?.substring(0, 3)}***, Expected: ${user.password?.substring(0, 3)}***, Match: ${isValidPassword}`);
      
      if (!isValidPassword) {
        logger.warn(`Login failed - Invalid password for: ${email} from IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id, user.email, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      logger.info(`Login successful (mock user): ${email} (${user.role}) from IP: ${req.ip}`);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken,
          expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        },
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
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn(`Login failed - Invalid password for: ${email} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Login failed - Account inactive: ${email} from IP: ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Update last login and store refresh token (skip for mock user)
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    if (user !== MOCK_USER) {
      await user.updateLastLogin();
      await user.addRefreshToken(refreshToken);
    }
    
    logger.info(`Login successful: ${email} (${user.role}) from IP: ${req.ip}`);

    // Return response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });
  } catch (error) {
    logger.error("Login error:", { error: error.message, email: req.body?.email, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}

/**
 * Register handler
 */
export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed - Email already exists: ${email} from IP: ${req.ip}`);
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const newUser = await User.create({
      email,
      password,
      name,
      role,
    });

    // If registering as mentor or mentee, create related record
    if (role === "mentor") {
      await Mentor.create({
        userId: newUser._id,
        track: "tech", // default
        maxMentees: 5,
        expertise: [],
      });
    } else if (role === "mentee") {
      await Mentee.create({
        userId: newUser._id,
        track: "tech", // default
        interests: [],
      });
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
    
    logger.info(`User registered: ${email} (${role}) from IP: ${req.ip}`);

    // Return response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: newUser.toJSON(),
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
    });
  } catch (error) {
    logger.error("Register error:", { error: error.message, email: req.body?.email, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
}

/**
 * Refresh token handler
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Check if refresh token exists in user's token list
    const hasToken = user.refreshTokens?.some((rt) => rt.token === refreshToken);
    if (!hasToken) {
      logger.warn(`Invalid refresh token used for user: ${user.email} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token (keep same refresh token)
    const newAccessToken = generateAccessToken(user._id, user.email, user.role);
    
    logger.info(`Token refreshed for user: ${user.email} from IP: ${req.ip}`);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        expiresIn: 7 * 24 * 60 * 60,
      },
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
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If mentor, get mentor data
    let profile = { ...user.toJSON() };
    if (user.role === "mentor") {
      const mentor = await Mentor.findOne({ userId: user._id });
      profile.mentorData = mentor;
    } else if (user.role === "mentee") {
      const mentee = await Mentee.findOne({ userId: user._id });
      profile.menteeData = mentee;
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
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove refresh token from user's token list
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
