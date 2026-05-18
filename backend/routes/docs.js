/**
 * OpenAPI documentation — Swagger UI (no secrets exposed).
 */
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, '../../docs/openapi.json');

let cachedSpec = null;

function loadSpec() {
  if (cachedSpec) return cachedSpec;
  cachedSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  return cachedSpec;
}

router.get('/openapi.json', (_req, res) => {
  res.json(loadSpec());
});

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(null, {
    swaggerOptions: { url: '/api/docs/openapi.json' },
    customSiteTitle: 'Trà Đá Mentor API',
  })
);

export default router;
