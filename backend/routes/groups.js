import express from 'express';
import { validateGroup } from '../middleware/validation.js';
import {
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMenteeToGroup,
  removeMenteeFromGroup,
  queryGroupDirectory,
} from '../services/groupStore.js';
import { updateMentee } from '../services/menteeStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { sendDirectory } from '../lib/directoryQuery.js';

const router = express.Router();

async function assertGroupManager(req, res, group) {
  const actor = await loadActor(req);
  if (actor?.isAdmin) return actor;
  if (actor?.role === 'mentor' && group && actor.mentorId === group.mentorId) return actor;
  fail(res, 403, 'FORBIDDEN');
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const baseFilter = actor?.role === 'mentor' && !actor.isAdmin ? { mentorId: actor.mentorId || '__none__' } : undefined;
    return sendDirectory(res, await queryGroupDirectory(req.query, baseFilter));
  } catch (e) {
    next(e);
  }
});

router.post('/', validateGroup, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
    const body = actor.isAdmin ? req.body : { ...req.body, mentorId: actor.mentorId };
    if (!body.mentorId) return fail(res, 403, 'FORBIDDEN');
    const group = await createGroup(body);
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
});

router.post('/:groupId/mentees/:menteeId', async (req, res, next) => {
  try {
    const existing = await getGroupById(req.params.groupId);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    if (!(await assertGroupManager(req, res, existing))) return;
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
    const existing = await getGroupById(req.params.groupId);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    if (!(await assertGroupManager(req, res, existing))) return;
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
    const existing = await getGroupById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    if (!(await assertGroupManager(req, res, existing))) return;
    const group = await updateGroup(req.params.id, req.body, { replace: true });
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateGroup, async (req, res, next) => {
  try {
    const existing = await getGroupById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    if (!(await assertGroupManager(req, res, existing))) return;
    const group = await updateGroup(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const group = await deleteGroup(req.params.id);
    if (!group) return res.status(404).json({ message: 'Không tìm thấy group' });
    res.json({ message: 'Đã xóa group' });
  } catch (e) {
    next(e);
  }
});

export default router;
