import { trackLabel } from './trackTheme';
import type { Mentor, Mentee } from '../types/models';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface SessionLogRow {
  sessionDate: string;
  mentorScore?: number | null;
  menteeScore?: number | null;
  menteeNeedsSupport?: boolean;
  mentorNeedsSupport?: boolean;
}

export interface SlotRow {
  date?: string;
  bookedBy?: string;
  menteeId?: string;
}

export interface AnalyticsKpis {
  mentors: number;
  mentees: number;
  groups: number;
  completionRate: number;
  avgProgress: number;
  bookedSlots: number;
  openSlots: number;
  sessionsLogged: number;
  mentorUtilization: number;
  needsSupport: number;
}

export interface AnalyticsSnapshot {
  kpis: AnalyticsKpis;
  progressSegments: { key: string; value: number }[];
  trackDistribution: { track: string; label: string; count: number }[];
  sessionTrend: { label: string; sessions: number; bookings: number }[];
  topSkills: { skill: string; count: number }[];
  topMentors: { name: string; filled: number; capacity: number }[];
  satisfactionAvg: number | null;
  activitiesInPeriod: number;
}

const PERIOD_MS: Record<Exclude<AnalyticsPeriod, 'all'>, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

export function periodStart(period: AnalyticsPeriod, now = new Date()): Date | null {
  if (period === 'all') return null;
  return new Date(now.getTime() - PERIOD_MS[period]);
}

function inPeriod(iso: string, start: Date | null): boolean {
  if (!start) return true;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d >= start;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key: string, locale = 'vi-VN'): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

export function buildAnalyticsSnapshot({
  mentors,
  mentees,
  groupsCount,
  sessionLogs,
  slots,
  activitiesCount = 0,
  period,
  locale,
}: {
  mentors: Mentor[];
  mentees: Mentee[];
  groupsCount: number;
  sessionLogs: SessionLogRow[];
  slots: SlotRow[];
  activitiesCount?: number;
  period: AnalyticsPeriod;
  locale?: string;
}): AnalyticsSnapshot {
  const start = periodStart(period);
  const loc = locale || 'vi-VN';

  const completed = mentees.filter((m) => m.progress === 100).length;
  const inProgress = mentees.filter((m) => m.progress > 0 && m.progress < 100).length;
  const justStarted = mentees.length - completed - inProgress;
  const avgProgress =
    mentees.length > 0
      ? Math.round(mentees.reduce((s, m) => s + (m.progress || 0), 0) / mentees.length)
      : 0;

  const bookedSlots = slots.filter((s) => s.bookedBy || s.menteeId).length;
  const openSlots = slots.length - bookedSlots;

  const logsInPeriod = sessionLogs.filter((l) => inPeriod(l.sessionDate, start));
  const needsSupport = logsInPeriod.filter(
    (l) => l.menteeNeedsSupport || l.mentorNeedsSupport
  ).length;

  let utilizationSum = 0;
  let utilizationCount = 0;
  mentors.forEach((m) => {
    const cap = m.maxMentees || 10;
    const filled = m.mentees?.length || 0;
    utilizationSum += cap > 0 ? (filled / cap) * 100 : 0;
    utilizationCount += 1;
  });
  const mentorUtilization =
    utilizationCount > 0 ? Math.round(utilizationSum / utilizationCount) : 0;

  const scores: number[] = [];
  logsInPeriod.forEach((l) => {
    if (l.mentorScore != null) scores.push(l.mentorScore);
    if (l.menteeScore != null) scores.push(l.menteeScore);
  });
  const satisfactionAvg =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

  const trackMap = new Map<string, number>();
  [...mentors, ...mentees].forEach((p) => {
    const tr = p.track || 'tech';
    trackMap.set(tr, (trackMap.get(tr) || 0) + 1);
  });
  const trackDistribution = [...trackMap.entries()]
    .map(([track, count]) => ({ track, label: trackLabel(track), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const skillMap = new Map<string, number>();
  mentors.forEach((m) => {
    (m.expertise || []).forEach((s) => {
      const k = s.trim();
      if (k) skillMap.set(k, (skillMap.get(k) || 0) + 1);
    });
  });
  if (skillMap.size === 0) {
    mentees.forEach((m) => {
      (m.interests || []).forEach((s) => {
        const k = s.trim();
        if (k) skillMap.set(k, (skillMap.get(k) || 0) + 1);
      });
    });
  }
  const topSkills = [...skillMap.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topMentors = [...mentors]
    .map((m) => ({
      name: m.name,
      filled: m.mentees?.length || 0,
      capacity: m.maxMentees || 10,
    }))
    .sort((a, b) => b.filled - a.filled)
    .slice(0, 5);

  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const sessionsByMonth = new Map<string, number>();
  const bookingsByMonth = new Map<string, number>();
  months.forEach((k) => {
    sessionsByMonth.set(k, 0);
    bookingsByMonth.set(k, 0);
  });

  sessionLogs.forEach((l) => {
    const d = new Date(l.sessionDate);
    if (Number.isNaN(d.getTime())) return;
    const k = monthKey(d);
    if (sessionsByMonth.has(k)) {
      sessionsByMonth.set(k, (sessionsByMonth.get(k) || 0) + 1);
    }
  });

  slots.forEach((s) => {
    if (!s.date || (!s.bookedBy && !s.menteeId)) return;
    const d = new Date(s.date);
    if (Number.isNaN(d.getTime())) return;
    const k = monthKey(d);
    if (bookingsByMonth.has(k)) {
      bookingsByMonth.set(k, (bookingsByMonth.get(k) || 0) + 1);
    }
  });

  const sessionTrend = months.map((k) => ({
    label: formatMonthLabel(k, loc),
    sessions: sessionsByMonth.get(k) || 0,
    bookings: bookingsByMonth.get(k) || 0,
  }));

  return {
    kpis: {
      mentors: mentors.length,
      mentees: mentees.length,
      groups: groupsCount,
      completionRate: mentees.length > 0 ? Math.round((completed / mentees.length) * 100) : 0,
      avgProgress,
      bookedSlots,
      openSlots,
      sessionsLogged: logsInPeriod.length,
      mentorUtilization,
      needsSupport,
    },
    progressSegments: [
      { key: 'justStarted', value: justStarted },
      { key: 'inProgress', value: inProgress },
      { key: 'completed', value: completed },
    ],
    trackDistribution,
    sessionTrend,
    topSkills,
    topMentors,
    satisfactionAvg,
    activitiesInPeriod: activitiesCount,
  };
}

export function exportAnalyticsCsv(snapshot: AnalyticsSnapshot, labels: Record<string, string>): string {
  const rows = [
    [labels.exportMetric, labels.exportValue],
    [labels.statMentors, String(snapshot.kpis.mentors)],
    [labels.statMentees, String(snapshot.kpis.mentees)],
    [labels.statGroups, String(snapshot.kpis.groups)],
    [labels.statCompletionRate, `${snapshot.kpis.completionRate}%`],
    [labels.statAvgProgress, `${snapshot.kpis.avgProgress}%`],
    [labels.statSessions, String(snapshot.kpis.sessionsLogged)],
    [labels.statUtilization, `${snapshot.kpis.mentorUtilization}%`],
  ];
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}
