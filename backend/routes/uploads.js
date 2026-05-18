import express from 'express';
import { uploadAvatar } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/avatar', uploadAvatar);

export default router;
