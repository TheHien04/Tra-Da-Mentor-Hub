import { buildProviderInput } from '../services/matchingAi.js';

describe('matching AI provider boundary', () => {
  it('minimizes profile data and bounds provider input', () => {
    const input = buildProviderInput(
      {
        name: 'Private Mentor',
        email: 'mentor@example.com',
        phone: '+84123456789',
        track: 'technology',
        expertise: Array.from({ length: 12 }, (_, index) => `Skill ${index}`),
      },
      {
        name: 'Private Mentee',
        email: 'mentee@example.com',
        goals: 'Private free-form goal that must not leave the application',
        track: 'technology',
        interests: Array.from({ length: 12 }, (_, index) => `Interest ${index}`),
      },
      {
        score: 88,
        matchedSkills: ['React', 'TypeScript'],
        reasons: ['same track', 'shared skill'],
      }
    );

    expect(input).toEqual(
      expect.objectContaining({
        mentorLabel: 'Mentor A',
        menteeLabel: 'Mentee B',
        mentorTrack: 'technology',
        menteeTrack: 'technology',
        score: 88,
      })
    );
    expect(input.expertise).toHaveLength(8);
    expect(input.interests).toHaveLength(8);
    expect(JSON.stringify(input)).not.toContain('Private Mentor');
    expect(JSON.stringify(input)).not.toContain('mentor@example.com');
    expect(JSON.stringify(input)).not.toContain('Private free-form goal');
  });
});
