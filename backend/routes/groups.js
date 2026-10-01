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
import {
  pickFields,
  GROUP_MANAGER_FIELDS,
  GROUP_ADMIN_FIELDS,
  redactGroup,
  mapDirectory,
} from '../lib/profileFields.js';

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
    const result = await queryGroupDirectory(req.query, baseFilter);
    return sendDirectory(res, mapDirectory(result, (row) => redactGroup(row, actor)));
  } catch (e) {
    next(e);
  }
});

router.post('/', validateGroup, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
    const fields = actor.isAdmin ? GROUP_ADMIN_FIELDS : GROUP_MANAGER_FIELDS;
    const body = pickFields(req.body, fields);
    if (!actor.isAdmin) body.mentorId = actor.mentorId;
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
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
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
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    await updateMentee(req.params.menteeId, { groupId: null });
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/full', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const group = await getGroupById(req.params.id);
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    res.json(redactGroup(group, actor));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const group = await getGroupById(req.params.id);
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    res.json(redactGroup(group, actor));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateGroup, async (req, res, next) => {
  try {
    const existing = await getGroupById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    const actor = await assertGroupManager(req, res, existing);
    if (!actor) return;
    const fields = actor.isAdmin ? GROUP_ADMIN_FIELDS : GROUP_MANAGER_FIELDS;
    const group = await updateGroup(req.params.id, pickFields(req.body, fields), { replace: true });
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateGroup, async (req, res, next) => {
  try {
    const existing = await getGroupById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    const actor = await assertGroupManager(req, res, existing);
    if (!actor) return;
    const fields = actor.isAdmin ? GROUP_ADMIN_FIELDS : GROUP_MANAGER_FIELDS;
    const group = await updateGroup(req.params.id, pickFields(req.body, fields));
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
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
    if (!group) return fail(res, 404, 'NOT_FOUND', 'Group not found');
    res.json({ message: 'Đã xóa group' });
  } catch (e) {
    next(e);
  }
});

export default router;
