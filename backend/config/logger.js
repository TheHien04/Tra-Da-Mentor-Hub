// backend/config/logger.js
/**
 * Winston Logger Configuration
 * Professional logging for production environments
 */

import winston from 'winston';
import env from './env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Create logger instance
const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  levels,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.isDev ? colorize() : winston.format.uncolorize(),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    // Error logs file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// HTTP request logging middleware
export const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message);
    } else if (res.statusCode >= 300) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

export default logger;
