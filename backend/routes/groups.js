import express from 'express';
import { validateGroup } from '../middleware/validation.js';
import {
  listGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMenteeToGroup,
  removeMenteeFromGroup,
} from '../services/groupStore.js';
import { updateMentee } from '../services/menteeStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listGroups());
  } catch (e) {
    next(e);
  }
});

router.post('/', validateGroup, async (req, res, next) => {
  try {
    const group = await createGroup(req.body);
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
});

router.post('/:groupId/mentees/:menteeId', async (req, res, next) => {
  try {
    const group = await addMenteeToGroup(req.params.groupId, req.params.menteeId);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    await updateMentee(req.params.menteeId, { groupId: req.params.groupId });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.delete('/:groupId/mentees/:menteeId', async (req, res, next) => {
  try {
    const group = await removeMenteeFromGroup(req.params.groupId, req.params.menteeId);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    await updateMentee(req.params.menteeId, { groupId: null });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/full', async (req, res, next) => {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateGroup, async (req, res, next) => {
  try {
    const group = await updateGroup(req.params.id, req.body, { replace: true });
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateGroup, async (req, res, next) => {
  try {
    const group = await updateGroup(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const group = await deleteGroup(req.params.id);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json({ message: 'Đã xóa group' });
  } catch (e) {
    next(e);
  }
});

export default router;
