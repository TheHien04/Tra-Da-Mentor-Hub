import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../../dist');

/**
 * Serve Vite production build from /dist (same origin as API).
 * @returns {boolean} true if static files were mounted
 */
export function mountFrontend(app) {
  if (!fs.existsSync(path.join(distPath, 'index.html'))) {
    return false;
  }

  app.use(
    express.static(distPath, {
      index: false,
      maxAge: '7d',
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );

  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    if (req.path.includes('.')) {
      return next();
    }
    const normalized = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '');
    if (normalized.includes('..')) {
      return res.status(400).end();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  logger.info(`📦 Serving frontend from ${distPath}`);
  return true;
}
