// backend/middleware/security.js
/**
 * Security Middleware Collection
 * Helmet, Rate Limiting, Input Sanitization
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../config/logger.js';
import env from '../config/env.js';

const isProd = env.isProduction;

/**
 * Helmet - Security headers (production SPA + API)
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
});

function buildLimiter(max, message) {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip} path=${req.path}`);
      res.status(429).json({ success: false, message });
    },
  });
}

export const generalLimiter = buildLimiter(
  isProd ? env.rateLimitMaxRequests : 10000,
  'Too many requests, please try again later.'
);

export const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: isProd ? 10 : 1000,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: isProd ? 5 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Password reset rate limit for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again later.',
    });
  },
});

export const adminLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: isProd ? 30 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many admin requests.' });
  },
});

/** MongoDB operator sanitization — body/params only (Express 5 query is read-only) */
export const sanitizeInputs = (req, res, next) => {
  try {
    if (req.body) {
      mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    if (req.params) {
      mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    }
    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    next();
  }
};

export const bodySizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 1024 * 1024; // 1MB

  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    logger.warn(`Request body too large from IP: ${req.ip}`);
    return res.status(413).json({
      success: false,
      message: 'Request body too large.',
    });
  }
  next();
};

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[\s\S]*?>/gi,
];

function hasXssPayload(value) {
  if (typeof value !== 'string') return false;
  return XSS_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}

function scanForXss(obj) {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of Object.keys(obj)) {
    if (hasXssPayload(key)) return true;
    const val = obj[key];
    if (typeof val === 'string' && hasXssPayload(val)) return true;
    if (typeof val === 'object' && val !== null && scanForXss(val)) return true;
  }
  return false;
}

export const xssProtection = (req, res, next) => {
  if ((req.body && scanForXss(req.body)) || (req.query && scanForXss(req.query))) {
    logger.warn(`XSS attempt blocked from IP: ${req.ip}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected.',
    });
  }
  next();
};

export default {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  adminLimiter,
  sanitizeInputs,
  bodySizeLimiter,
  xssProtection,
};
