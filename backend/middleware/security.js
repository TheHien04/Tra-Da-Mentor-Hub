// backend/middleware/security.js
/**
 * Security Middleware Collection
 * Helmet, Rate Limiting, Input Sanitization
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

/**
 * Helmet - Security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Rate Limiting - Prevent brute force attacks
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // 10000 in dev, 100 in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

/**
 * Auth Rate Limiting - Stricter for login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 1000, // 1000 in dev, 5 in production
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} - Email: ${req.body?.email}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});

/**
 * MongoDB Query Sanitization
 * Custom implementation to avoid Express 5.x compatibility issues
 */
export const sanitizeInputs = (req, res, next) => {
  try {
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const keysToDelete = [];
      
      for (const key in obj) {
        // Remove MongoDB operators from keys
        if (key.startsWith('$')) {
          logger.warn(`Removed MongoDB operator - Key: ${key}, IP: ${req.ip}`);
          keysToDelete.push(key);
          continue;
        }
        
        // Recursively sanitize nested objects
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
        
        // Remove $ from string values (but keep dots for emails, etc.)
        if (typeof obj[key] === 'string' && obj[key].includes('$')) {
          logger.warn(`Sanitized $ from value - Key: ${key}, IP: ${req.ip}`);
          obj[key] = obj[key].replace(/\$/g, '');
        }
      }
      
      // Delete keys after iteration
      keysToDelete.forEach(key => delete obj[key]);
      
      return obj;
    };

    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query && typeof req.query === 'object') {
      // Sanitize query without reassigning (avoids Express 5.x read-only issue)
      sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    logger.error('Sanitization error:', error);
    next();
  }
};

/**
 * Request body size limiter
 */
export const bodySizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    logger.warn(`Request body too large: ${contentLength} bytes from IP: ${req.ip}`);
    return res.status(413).json({
      success: false,
      message: 'Request body too large. Maximum size is 10MB.',
    });
  }

  next();
};

/**
 * XSS Protection middleware
 */
export const xssProtection = (req, res, next) => {
  // Basic XSS pattern detection
  const xssPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  
  const checkXSS = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        if (xssPattern.test(obj[key])) {
          logger.warn(`XSS attempt detected - Key: ${key}, IP: ${req.ip}`);
          return true;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkXSS(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body && checkXSS(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected.',
    });
  }

  if (req.query && checkXSS(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters.',
    });
  }

  next();
};

export default {
  helmetConfig,
  generalLimiter,
  authLimiter,
  sanitizeInputs,
  bodySizeLimiter,
  xssProtection,
};
