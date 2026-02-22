// backend/middleware/errorHandler.js
/**
 * Centralized Error Handler
 * Professional error handling with logging
 */

import logger from '../config/logger.js';
import env from '../config/env.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error Handler
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Centralized Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (error.statusCode === 500) {
    logger.error(`Internal Server Error: ${error.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      body: req.body,
    });
  } else {
    logger.warn(`${error.statusCode} Error: ${error.message}`, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    error = new ApiError(400, message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ApiError(400, message);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please login again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired. Please login again.');
  }

  // Send response
  res.status(error.statusCode).json({
    success: false,
    status: error.status || 'error',
    message: error.message,
    ...(env.isDev && { stack: err.stack }), // Stack trace only in development
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  ApiError,
  notFound,
  errorHandler,
  catchAsync,
};
