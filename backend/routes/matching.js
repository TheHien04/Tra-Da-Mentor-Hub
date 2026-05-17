import express from 'express';
import { listMentors, listMentees } from '../services/platformData.js';
import { getMatchSuggestions } from '../services/matchingEngine.js';

const router = express.Router();

/** GET /api/matching/suggestions?menteeId=&mentorId=&limit=8 */
router.get('/suggestions', async (req, res, next) => {
  try {
    const mentors = await listMentors();
    const mentees = await listMentees();
    const { menteeId, mentorId, limit } = req.query;

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

export default router;
