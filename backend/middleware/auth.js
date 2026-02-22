// backend/middleware/auth.js
/**
 * Authentication middleware
 * Verify JWT token and attach user to request
 */

import { verifyAccessToken } from "../utils/jwt.js";
import logger from "../config/logger.js";

/**
 * Middleware to verify JWT token
 */
export function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        type: "AUTHENTICATION_ERROR",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        type: "AUTHENTICATION_ERROR",
        message: "Invalid or expired token",
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      type: "AUTHENTICATION_ERROR",
      message: "Authentication failed",
    });
  }
}

/**
 * Middleware to check authorization
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        type: "AUTHORIZATION_ERROR",
        message: "Not authorized for this action",
      });
    }

    next();
  };
}

/**
 * Optional auth - attach user if token present, otherwise continue
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    next(); // Continue without user
  }
}

export default authenticate;
