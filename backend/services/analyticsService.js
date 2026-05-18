import { listMentors } from './mentorStore.js';
import { listMentees } from './menteeStore.js';
import { listGroups } from './groupStore.js';
import { listSlots } from './slotStore.js';
import { listSessionLogs } from './sessionLogStore.js';
import { listActivities } from './activityStore.js';
import { trackLabel } from '../lib/trackLabels.js';

const PERIOD_MS = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
};

function periodStart(period, now = new Date()) {
  if (period === 'all') return null;
  return new Date(now.getTime() - PERIOD_MS[period]);
}

function inPeriod(iso, start) {
  if (!start) return true;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d >= start;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key, locale = 'vi-VN') {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

function buildSnapshot({
  mentors,
  mentees,
  groupsCount,
  sessionLogs,
  slots,
  activitiesCount,
  period,
  locale,
}) {
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

  const scores = [];
  logsInPeriod.forEach((l) => {
    if (l.mentorScore != null) scores.push(l.mentorScore);
    if (l.menteeScore != null) scores.push(l.menteeScore);
  });
  const satisfactionAvg =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

  const trackMap = new Map();
  [...mentors, ...mentees].forEach((p) => {
    const tr = p.track || 'tech';
    trackMap.set(tr, (trackMap.get(tr) || 0) + 1);
  });
  const trackDistribution = [...trackMap.entries()]
    .map(([track, count]) => ({ track, label: trackLabel(track), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const skillMap = new Map();
  mentors.forEach((m) => {
    (m.expertise || []).forEach((s) => {
      const k = String(s).trim();
      if (k) skillMap.set(k, (skillMap.get(k) || 0) + 1);
    });
  });
  if (skillMap.size === 0) {
    mentees.forEach((m) => {
      (m.interests || []).forEach((s) => {
        const k = String(s).trim();
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
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const sessionsByMonth = new Map();
  const bookingsByMonth = new Map();
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

export async function getAnalyticsSummary(period = '90d', locale = 'vi-VN') {
  const validPeriods = ['7d', '30d', '90d', 'all'];
  const p = validPeriods.includes(period) ? period : '90d';

  const [mentors, mentees, groups, slots, sessionLogs, activities] = await Promise.all([
    listMentors(),
    listMentees(),
    listGroups(),
    listSlots(),
    listSessionLogs(),
    listActivities(200),
  ]);

  const start = periodStart(p);
  const activitiesInPeriod = activities.filter((a) => {
    const ts = String(a.timestamp || a.createdAt || '');
    if (!ts || !start) return true;
    const d = new Date(ts);
    return !Number.isNaN(d.getTime()) && d >= start;
  }).length;

  const logRows = sessionLogs.map((l) => ({
    sessionDate: String(l.sessionDate || ''),
    mentorScore: l.mentorScore,
    menteeScore: l.menteeScore,
    menteeNeedsSupport: Boolean(l.menteeNeedsSupport),
    mentorNeedsSupport: Boolean(l.mentorNeedsSupport),
  }));

  const slotRows = slots.map((s) => ({
    date: String(s.date || ''),
    bookedBy: s.bookedBy,
    menteeId: s.menteeId,
  }));

  return buildSnapshot({
    mentors,
    mentees,
    groupsCount: groups.length,
    sessionLogs: logRows,
    slots: slotRows,
    activitiesCount: activitiesInPeriod,
    period: p,
    locale,
  });
}
