import { getMatchSuggestions, scoreMentorForMentee } from '../services/matchingEngine.js';

const mentors = Array.from({ length: 12 }, (_, index) => ({
  _id: `mentor-${index}`,
  name: `Mentor ${index}`,
  expertise: index % 2 ? ['React', 'TypeScript'] : ['Product'],
  track: index % 2 ? 'technology' : 'business',
  mentees: [],
  maxMentees: 5,
}));

const mentees = Array.from({ length: 12 }, (_, index) => ({
  _id: `mentee-${index}`,
  name: `Mentee ${index}`,
  interests: ['React'],
  track: 'technology',
  mentorId: index === 0 ? 'mentor-1' : null,
  applicationStatus: 'accepted',
  progress: 20,
}));

describe('matching engine', () => {
  it('returns explainable bounded scores', () => {
    const result = scoreMentorForMentee(mentors[1], mentees[1]);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(99);
    expect(result.factors).toEqual(expect.objectContaining({ skills: expect.any(Number), track: 100 }));
  });

  it('caps platform suggestions and only includes unassigned mentees', () => {
    const results = getMatchSuggestions(mentors, mentees, { limit: 5000 });
    expect(results).toHaveLength(50);
    expect(results.some((row) => row.menteeId === 'mentee-0')).toBe(false);
    expect(results).toEqual([...results].sort((a, b) => b.score - a.score));
  });

  it('returns no platform suggestions when every mentee is already assigned', () => {
    const assigned = mentees.map((mentee) => ({ ...mentee, mentorId: 'mentor-1' }));
    expect(getMatchSuggestions(mentors, assigned)).toEqual([]);
    expect(getMatchSuggestions(mentors, assigned, { mentorId: 'mentor-2' })).toEqual([]);
  });

  it('excludes non-accepted mentees and mentors at capacity in every mode', () => {
    const pending = { ...mentees[1], _id: 'pending', applicationStatus: 'pending' };
    const rejected = { ...mentees[2], _id: 'rejected', applicationStatus: 'rejected' };
    const fullMentor = { ...mentors[1], _id: 'full', mentees: ['a'], maxMentees: 1 };
    const pool = [pending, rejected, mentees[3]];

    const platform = getMatchSuggestions([fullMentor, mentors[2]], pool);
    expect(platform.every((row) => row.menteeId === mentees[3]._id)).toBe(true);
    expect(platform.some((row) => row.mentorId === fullMentor._id)).toBe(false);
    expect(getMatchSuggestions([fullMentor], pool, { mentorId: fullMentor._id })).toEqual([]);
    expect(getMatchSuggestions([fullMentor, mentors[2]], pool, { menteeId: pending._id })).toEqual([]);
  });
});
