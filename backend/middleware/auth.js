// backend/middleware/auth.js
/**
 * Authentication middleware
 * Verify JWT token and attach user to request
 */

import { verifyAccessToken } from "../utils/jwt.js";
import logger from "../config/logger.js";
import { readAccessCookie } from "../lib/sessionCookie.js";
import { isAccountActive } from "../lib/activeUser.js";

function bearerToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return readAccessCookie(req);
}

/**
 * Middleware to verify JWT token
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const token = bearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        type: "AUTHENTICATION_ERROR",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        type: "AUTHENTICATION_ERROR",
        message: "Invalid or expired token",
      });
    }

    if (!(await isAccountActive(decoded.userId))) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
        type: "AUTHORIZATION_ERROR",
        message: "Your account is inactive",
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      _id: decoded.userId,
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
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
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
    const token = bearerToken(req);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          _id: decoded.userId,
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
