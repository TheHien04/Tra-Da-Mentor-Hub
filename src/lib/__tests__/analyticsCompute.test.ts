import { describe, expect, it } from 'vitest';
import { buildAnalyticsSnapshot, exportAnalyticsCsv, periodStart } from '../analyticsCompute';

describe('analyticsCompute', () => {
  it('computes KPIs from sample data', () => {
    const snapshot = buildAnalyticsSnapshot({
      mentors: [{ _id: '1', name: 'A', maxMentees: 5, mentees: ['x'], expertise: ['React'] } as never],
      mentees: [
        { _id: 'm1', progress: 100, track: 'tech', applicationStatus: 'accepted' } as never,
        { _id: 'm2', progress: 50, track: 'tech', applicationStatus: 'interviewed' } as never,
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
    expect(snapshot.applicationFunnel.find((row) => row.key === 'accepted')?.value).toBe(1);
    expect(snapshot.applicationConversion.interviewRate).toBe(100);
    expect(snapshot.applicationConversion.acceptanceRate).toBe(100);
  });

  it('periodStart returns null for all time', () => {
    expect(periodStart('all')).toBeNull();
  });

  it('exports metrics as escaped CSV', () => {
    const snapshot = buildAnalyticsSnapshot({
      mentors: [],
      mentees: [],
      groupsCount: 2,
      sessionLogs: [],
      slots: [],
      period: 'all',
    });
    const csv = exportAnalyticsCsv(snapshot, {
      exportMetric: 'Metric',
      exportValue: 'Value',
      statMentors: 'Mentors',
      statMentees: 'Mentees',
      statGroups: 'Groups',
      statCompletionRate: 'Completion "rate"',
      statAvgProgress: 'Average progress',
      statSessions: 'Sessions',
      statUtilization: 'Utilization',
    });

    expect(csv).toContain('"Metric","Value"');
    expect(csv).toContain('"Completion ""rate""","0%"');
    expect(csv.split('\n')).toHaveLength(8);
  });
});
