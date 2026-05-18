import { describe, expect, it } from 'vitest';
import { buildAnalyticsSnapshot, periodStart } from '../analyticsCompute';

describe('analyticsCompute', () => {
  it('computes KPIs from sample data', () => {
    const snapshot = buildAnalyticsSnapshot({
      mentors: [{ _id: '1', name: 'A', maxMentees: 5, mentees: ['x'], expertise: ['React'] } as never],
      mentees: [
        { _id: 'm1', progress: 100, track: 'tech' } as never,
        { _id: 'm2', progress: 50, track: 'tech' } as never,
      ],
      groupsCount: 1,
      sessionLogs: [{ sessionDate: new Date().toISOString(), mentorScore: 5, menteeScore: 4 }],
      slots: [{ date: new Date().toISOString(), bookedBy: 'm2' }],
      activitiesCount: 3,
      period: '90d',
      locale: 'en-US',
    });

    expect(snapshot.kpis.mentors).toBe(1);
    expect(snapshot.kpis.mentees).toBe(2);
    expect(snapshot.kpis.completionRate).toBe(50);
    expect(snapshot.sessionTrend).toHaveLength(6);
  });

  it('periodStart returns null for all time', () => {
    expect(periodStart('all')).toBeNull();
  });
});
