import express from 'express';
import { listMentors, listMentees } from '../services/platformData.js';
import { getMatchSuggestions } from '../services/matchingEngine.js';
import { explainMatch } from '../services/matchingAi.js';
import { getMentorById } from '../services/mentorStore.js';
import { getMenteeById } from '../services/menteeStore.js';

const router = express.Router();

/** GET /api/matching/suggestions?menteeId=&mentorId=&limit=8 */
router.get('/suggestions', async (req, res, next) => {
  try {
    const { loadActor } = await import('../lib/actor.js');
    const { fail } = await import('../lib/httpError.js');
    const actor = await loadActor(req);
    const mentors = await listMentors();
    const mentees = await listMentees();
    let { menteeId, mentorId, limit } = req.query;
    if (actor?.isAdmin) {
      menteeId = menteeId || undefined;
      mentorId = mentorId || undefined;
    } else if (actor?.role === 'mentee') {
      if (!actor.menteeId) return fail(res, 403, 'FORBIDDEN');
      menteeId = actor.menteeId;
      mentorId = undefined;
    } else if (actor?.role === 'mentor') {
      if (!actor.mentorId) return fail(res, 403, 'FORBIDDEN');
      mentorId = actor.mentorId;
      menteeId = undefined;
    } else {
      return fail(res, 403, 'FORBIDDEN');
    }

    const suggestions = getMatchSuggestions(mentors, mentees, {
      menteeId: menteeId || undefined,
      mentorId: mentorId || undefined,
      limit: limit ? Number(limit) : 8,
    });

    res.json({
      success: true,
      data: suggestions,
      meta: { mentors: mentors.length, mentees: mentees.length, algorithm: 'skill-overlap-v1' },
    });
  } catch (e) {
    next(e);
  }
});

/** GET /api/matching/explain?mentorId=&menteeId= */
router.get('/explain', async (req, res, next) => {
  try {
    const { loadActor } = await import('../lib/actor.js');
    const { fail } = await import('../lib/httpError.js');
    const actor = await loadActor(req);
    const { mentorId, menteeId } = req.query;
    if (!mentorId || !menteeId) {
      return fail(res, 400, 'VALIDATION', 'mentorId and menteeId required');
    }
    if (!actor?.isAdmin) {
      const allowed =
        (actor?.role === 'mentee' && actor.menteeId === String(menteeId)) ||
        (actor?.role === 'mentor' && actor.mentorId === String(mentorId));
      if (!allowed) return fail(res, 403, 'FORBIDDEN');
    }
    const mentor = await getMentorById(String(mentorId));
    const mentee = await getMenteeById(String(menteeId));
    if (!mentor || !mentee) {
      return fail(res, 404, 'NOT_FOUND', 'Mentor or mentee not found');
    }
    const lang = String(req.query.lang || '').toLowerCase().startsWith('en') ? 'en' : 'vi';
    const result = await explainMatch(mentor, mentee, lang);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

export default router;
