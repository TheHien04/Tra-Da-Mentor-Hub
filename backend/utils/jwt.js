// backend/utils/jwt.js
/**
 * JWT utilities
 * Generate and verify tokens
 */

import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Generate access token
 */
export function generateAccessToken(userId, email, role) {
  return jwt.sign(
    {
      userId,
      email,
      role,
      type: "access",
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpire,
      issuer: "tra-da-mentor",
      audience: "web",
    }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    {
      userId,
      type: "refresh",
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpire,
      issuer: "tra-da-mentor",
    }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      issuer: "tra-da-mentor",
      audience: "web",
    });

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret, {
      issuer: "tra-da-mentor",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token) {
  return jwt.decode(token);
}
