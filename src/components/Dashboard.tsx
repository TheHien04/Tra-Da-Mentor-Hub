import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppTranslation } from '../hooks/useAppTranslation';
import type { Mentor, Mentee } from '../types/models';
import { useMentors } from '../hooks/queries/useMentors';
import { useMentees } from '../hooks/queries/useMentees';
import { useGroups } from '../hooks/queries/useGroups';
import { useSlots } from '../hooks/queries/useSlots';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineTrophy,
  HiOutlinePlus,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import Skeleton from './Skeleton';
import { Alert } from './ui/Alert';
import { SmartMatchPanel } from './features/SmartMatchPanel';
import { LiveActivityFeed } from './features/LiveActivityFeed';
import { DashboardHero } from './features/DashboardHero';
import { PageShell } from './ui/PageShell';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { getApiErrorMessage } from '../lib/apiHelpers';

interface DashboardStats {
  totalMentors: number;
  totalMentees: number;
  totalGroups: number;
  mentorsAtCapacity: number;
  menteesCompleted: number;
  menteesInProgress: number;
  menteesJustStarted: number;
}

interface UpcomingSession {
  _id: string;
  title: string;
  mentor: string;
  date: string;
  time: string;
  type: 'GROUP' | 'ONE_ON_ONE';
  isBooked: boolean;
}

function parseSlotDateTime(date: string, time?: string) {
  const normalized = time && time.length === 5 ? `${time}:00` : time || '00:00:00';
  return new Date(`${date}T${normalized}`);
}

const Dashboard = () => {
  const { t } = useAppTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const calendar = searchParams.get('calendar');
    if (!calendar) return;

    if (calendar === 'connected') {
      toast.success(t('dashboard.calendarConnected'));
    } else if (calendar === 'error') {
      toast.error(t('dashboard.calendarError'));
    }

    const next = new URLSearchParams(searchParams);
    next.delete('calendar');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, t]);
  const {
    data: mentorsList = [],
    isLoading: mentorsLoading,
    isError: mentorsError,
    error: mentorsQueryError,
  } = useMentors();
  const {
    data: menteesData = [],
    isLoading: menteesLoading,
    isError: menteesError,
    error: menteesQueryError,
  } = useMentees();
  const { data: groupsList = [], isLoading: groupsLoading } = useGroups();
  const { data: slots = [], isLoading: slotsLoading } = useSlots();

  const loading = mentorsLoading || menteesLoading || groupsLoading || slotsLoading;
  const error =
    mentorsError || menteesError
      ? getApiErrorMessage(mentorsQueryError || menteesQueryError)
      : null;

  const { stats, upcomingSessions, trendingSkills } = useMemo((): {
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    trendingSkills: { skill: string; count: number; percentage: number }[];
  } => {
    const mentors = mentorsList as Mentor[];
    const mentees = menteesData as Mentee[];
    const mentorName = (id: string) => mentors.find((m) => m._id === id)?.name || id;
    const now = new Date();

    const futureSlots = slots
      .map((s) => {
        const date = String(s.date || '');
        const time = String(s.time || '');
        const isBooked = Boolean(s.bookedBy || s.menteeId);
        return {
          raw: s,
          date,
          time,
          isBooked,
          at: parseSlotDateTime(date, time),
        };
      })
      .filter((s) => s.date && !Number.isNaN(s.at.getTime()) && s.at >= now);

    const booked = futureSlots.filter((s) => s.isBooked).sort((a, b) => a.at.getTime() - b.at.getTime());
    const open = futureSlots.filter((s) => !s.isBooked).sort((a, b) => a.at.getTime() - b.at.getTime());

    const upcoming: UpcomingSession[] = [...booked, ...open].slice(0, 5).map((s) => ({
      _id: String(s.raw._id),
      title: s.isBooked
        ? t('dashboard.slotSession', { mentor: mentorName(String(s.raw.mentorId)) })
        : t('dashboard.slotOpen', { mentor: mentorName(String(s.raw.mentorId)) }),
      mentor: mentorName(String(s.raw.mentorId)),
      date: s.date,
      time: s.time,
      type: 'ONE_ON_ONE' as const,
      isBooked: s.isBooked,
    }));

    const skillMap = new Map<string, number>();
    mentees.forEach((m) => {
      (m.interests || []).forEach((skill: string) => {
        const key = skill.trim();
        if (key) skillMap.set(key, (skillMap.get(key) || 0) + 1);
      });
    });
    if (skillMap.size === 0) {
      mentors.forEach((m) => {
        (m.expertise || []).forEach((skill: string) => {
          const key = skill.trim();
          if (key) skillMap.set(key, (skillMap.get(key) || 0) + 1);
        });
      });
    }
    const topSkills = [...skillMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxCount = topSkills[0]?.[1] || 1;

    return {
      stats: {
        totalMentors: mentors.length,
        totalMentees: mentees.length,
        totalGroups: groupsList.length,
        mentorsAtCapacity: mentors.filter(
          (m) => m.maxMentees && m.mentees && m.mentees.length >= m.maxMentees
        ).length,
        menteesCompleted: mentees.filter((m) => m.progress === 100).length,
        menteesInProgress: mentees.filter((m) => m.progress && m.progress > 0 && m.progress < 100)
          .length,
        menteesJustStarted: mentees.filter((m) => !m.progress || m.progress === 0).length,
      },
      upcomingSessions: upcoming,
      trendingSkills: topSkills.map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / maxCount) * 100),
      })),
    };
  }, [mentorsList, menteesData, groupsList, slots, t]);

  const statCards = [
    {
      label: t('dashboard.totalMentors'),
      value: stats.totalMentors,
      icon: HiOutlineAcademicCap,
      href: '/mentors',
    },
    {
      label: t('dashboard.totalMentees'),
      value: stats.totalMentees,
      icon: HiOutlineUserGroup,
      href: '/mentees',
    },
    {
      label: t('dashboard.activeGroups'),
      value: stats.totalGroups,
      icon: HiOutlineUsers,
      href: '/groups',
    },
    {
      label: t('dashboard.completedSessions'),
      value: stats.menteesCompleted,
      icon: HiOutlineTrophy,
      href: '/mentees',
    },
  ];

  const quickActions = [
    { label: t('mentor.addMentor'), href: '/mentors/add', icon: HiOutlinePlus },
    { label: t('mentee.addMentee'), href: '/mentees/add', icon: HiOutlinePlus },
    { label: t('nav.analytics'), href: '/analytics', icon: HiOutlineChartBar },
    { label: t('nav.sessions'), href: '/session-logs', icon: HiOutlineCalendarDays },
  ];

  const progressItems = [
    { label: t('dashboard.progressCompleted'), value: stats.menteesCompleted, pct: stats.totalMentees },
    { label: t('dashboard.progressInProgress'), value: stats.menteesInProgress, pct: stats.totalMentees },
    { label: t('dashboard.progressJustStarted'), value: stats.menteesJustStarted, pct: stats.totalMentees },
    { label: t('dashboard.mentorsAtCapacity'), value: stats.mentorsAtCapacity, pct: stats.totalMentors },
  ];

  return (
    <PageShell>
      <DashboardHero />

      <div className="dashboard-promo-grid">
      <Link to="/analytics" className="analytics-insights-banner group">
        <span className="analytics-insights-banner__icon">
          <HiOutlineChartBar className="h-5 w-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-primary">{t('dashboard.analyticsBannerTitle')}</span>
          <span className="block text-xs text-muted mt-0.5">{t('dashboard.analyticsBannerDesc')}</span>
        </span>
        <span className="text-sm font-medium shrink-0" style={{ color: 'var(--accent)' }}>
          {t('dashboard.viewAnalytics')} →
        </span>
      </Link>
        <Link to="/insights" className="analytics-insights-banner analytics-insights-banner--insights group">
          <span className="analytics-insights-banner__icon">
            <HiOutlineSparkles className="h-5 w-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-primary">{t('dashboard.insightsBannerTitle')}</span>
            <span className="block text-xs text-muted mt-0.5">{t('dashboard.insightsBannerDesc')}</span>
          </span>
          <span className="text-sm font-medium shrink-0" style={{ color: 'var(--accent)' }}>
            {t('dashboard.viewInsights')} →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-3 card card-hover px-4 py-3.5"
          >
            <span className="icon-chip">
              <action.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-primary">{action.label}</span>
            <HiOutlineArrowRight className="ml-auto h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card">
                <Skeleton count={2} />
              </div>
            ))
          : statCards.map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="analytics-kpi analytics-kpi--default card-hover group no-underline"
              >
                <div className="analytics-kpi__icon">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="analytics-kpi__body">
                  <p className="analytics-kpi__label">{card.label}</p>
                  <p className="analytics-kpi__value">{card.value}</p>
                </div>
              </Link>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <HiOutlineCalendarDays className="h-5 w-5 text-muted" />
              {t('dashboard.upcomingEvents')}
            </h2>
            <Link to="/schedule" className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }}>
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <ul className="space-y-2">
            {upcomingSessions.length === 0 && (
              <li className="text-sm text-muted py-4 text-center">{t('dashboard.noUpcoming')}</li>
            )}
            {upcomingSessions.map((session) => (
              <li
                key={session._id}
                className="list-row flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{session.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {session.mentor} · {session.date} · {session.time}
                  </p>
                </div>
                <span
                  className={`badge-pill shrink-0 ${
                    session.isBooked
                      ? session.type === 'GROUP'
                        ? 'badge-accent'
                        : 'badge-neutral'
                      : 'badge-success'
                  }`}
                >
                  {session.isBooked
                    ? session.type === 'GROUP'
                      ? t('dashboard.sessionTypeGroup')
                      : t('dashboard.sessionTypeOneOnOne')
                    : t('dashboard.sessionOpenBadge')}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2 mb-5">
            <HiOutlineChartBar className="h-5 w-5 text-muted" />
            {t('dashboard.skillsInDemand')}
          </h2>
          <ul className="space-y-4">
            {trendingSkills.length === 0 && (
              <li className="text-sm text-muted py-4 text-center">{t('dashboard.skillsEmpty')}</li>
            )}
            {trendingSkills.map((skill, i) => (
              <li key={skill.skill} className="analytics-skill-row">
                <span className="analytics-skill-row__rank">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="font-medium text-primary truncate">{skill.skill}</span>
                    <span className="text-muted tabular-nums shrink-0">{skill.count}</span>
                  </div>
                  <div className="analytics-skill-bar">
                    <div className="analytics-skill-bar__fill" style={{ width: `${skill.percentage}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SmartMatchPanel compact />
        <LiveActivityFeed />
      </div>

      <section className="card p-6 mb-8">
        <h2 className="text-base font-semibold text-primary mb-5">{t('dashboard.overview')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {progressItems.map((item) => (
            <div key={item.label} className="surface-muted rounded-lg p-4">
              <p className="text-xs font-medium text-muted mb-1">{item.label}</p>
              <p className="text-2xl font-semibold tabular-nums text-primary">{item.value}</p>
              <p className="text-xs text-muted mt-1">
                {item.pct > 0 ? `${Math.round((item.value / item.pct) * 100)}%` : '—'}
              </p>
              <div className="mt-3 h-1 rounded-full surface-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: item.pct > 0 ? `${Math.min(100, (item.value / item.pct) * 100)}%` : '0%',
                    backgroundColor: 'var(--accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {!loading && !error && (
        <section className="card px-6 py-5 text-sm text-secondary leading-relaxed">
          <strong className="text-primary font-medium">{t('dashboard.statistics')}:</strong>{' '}
          {t('dashboard.summaryLine', {
            mentors: stats.totalMentors,
            mentees: stats.totalMentees,
            groups: stats.totalGroups,
            completed: stats.menteesCompleted,
            inProgress: stats.menteesInProgress,
          })}
        </section>
      )}

      {error && (
        <Alert variant="error" title={t('common.loadError')} className="mt-4">
          {error}
        </Alert>
      )}
    </PageShell>
  );
};

export default Dashboard;
