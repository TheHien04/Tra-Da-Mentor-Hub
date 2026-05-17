import express from 'express';
import { validateMentee } from '../middleware/validation.js';
import {
  listMentees,
  getMenteeById,
  createMentee,
  updateMentee,
  updateMenteeApplicationStatus,
  deleteMentee,
  APPLICATION_STATUSES,
} from '../services/menteeStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listMentees());
  } catch (e) {
    next(e);
  }
});

router.post('/', validateMentee, async (req, res, next) => {
  try {
    const mentee = await createMentee(req.body);
    res.status(201).json(mentee);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const mentee = await getMenteeById(req.params.id);
    if (!mentee) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json(mentee);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/application-status', async (req, res, next) => {
  try {
    const { applicationStatus } = req.body;
    if (!applicationStatus || !APPLICATION_STATUSES.includes(applicationStatus)) {
      return res.status(400).json({
        message: 'applicationStatus phải là: ' + APPLICATION_STATUSES.join(', '),
      });
    }
    const result = await updateMenteeApplicationStatus(req.params.id, applicationStatus);
    if (result?.error === 'invalid_status') {
      return res.status(400).json({ message: 'applicationStatus không hợp lệ' });
    }
    if (!result) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateMentee, async (req, res, next) => {
  try {
    const mentee = await updateMentee(req.params.id, req.body, { replace: true });
    if (!mentee) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json(mentee);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateMentee, async (req, res, next) => {
  try {
    const mentee = await updateMentee(req.params.id, req.body);
    if (!mentee) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json(mentee);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const mentee = await deleteMentee(req.params.id);
    if (!mentee) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json({ message: 'Đã xóa mentee' });
  } catch (e) {
    next(e);
  }
});

export default router;
