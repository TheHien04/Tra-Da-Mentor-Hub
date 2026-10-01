import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useSlots } from '../hooks/queries/useSlots';
import { useAnalyticsSummary } from '../hooks/queries/useAnalytics';
import { useAuth } from '../context/AuthContext';
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
import { SceneStrip } from './motion/SceneStrip';
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
  const { t, i18n } = useAppTranslation();
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const isOps = role === 'admin' || role === 'mentor';
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
  const slotParams =
    role === 'mentor' && state.user?.mentorId
      ? { mentorId: state.user.mentorId }
      : role === 'mentee' && state.user?.menteeId
        ? { menteeId: state.user.menteeId }
        : undefined;
  const {
    data: slots = [],
    isLoading: slotsLoading,
    isError: slotsError,
    error: slotsQueryError,
  } = useSlots(slotParams);
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryQueryError,
  } = useAnalyticsSummary('90d', i18n.language || 'en', isOps);

  const loading = slotsLoading || (isOps && summaryLoading);
  const error = isOps
    ? summaryError
      ? getApiErrorMessage(summaryQueryError)
      : null
    : slotsError
      ? getApiErrorMessage(slotsQueryError)
      : null;

  const { stats, upcomingSessions, trendingSkills } = useMemo((): {
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    trendingSkills: { skill: string; count: number; percentage: number }[];
  } => {
    const mentorName = (id: string) => id;
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

    const topSkills = (summary?.topSkills || []).slice(0, 5).map((skill) => [skill.skill, skill.count] as const);
    const maxCount = topSkills[0]?.[1] || 1;
    const completed = summary?.progressSegments.find((s) => s.key === 'completed')?.value || 0;
    const inProgress = summary?.progressSegments.find((s) => s.key === 'inProgress')?.value || 0;
    const justStarted = summary?.progressSegments.find((s) => s.key === 'justStarted')?.value || 0;
    const myBooked = slots.filter((s) => s.bookedBy || s.menteeId).length;
    const myOpen = slots.length - myBooked;

    return {
      stats: {
        totalMentors: isOps ? summary?.kpis.mentors || 0 : myOpen,
        totalMentees: isOps ? summary?.kpis.mentees || 0 : myBooked,
        totalGroups: isOps ? summary?.kpis.groups || 0 : 0,
        mentorsAtCapacity: isOps ? summary?.kpis.mentorsAtCapacity || 0 : 0,
        menteesCompleted: isOps ? completed : myBooked,
        menteesInProgress: isOps ? inProgress : myOpen,
        menteesJustStarted: justStarted,
      },
      upcomingSessions: upcoming,
      trendingSkills: topSkills.map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / maxCount) * 100),
      })),
    };
  }, [slots, t, summary, isOps]);

  const statCards = isOps
    ? [
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
          href: '/analytics',
        },
      ]
    : [
        {
          label: t('dashboard.openSlots'),
          value: stats.totalMentors,
          icon: HiOutlineCalendarDays,
          href: '/slots',
        },
        {
          label: t('dashboard.myBookings'),
          value: stats.totalMentees,
          icon: HiOutlineTrophy,
          href: '/schedule',
        },
      ];

  const quickActions = [
    role === 'admin'
      ? { label: t('mentor.addMentor'), href: '/mentors/add', icon: HiOutlinePlus }
      : null,
    role === 'admin'
      ? { label: t('mentee.addMentee'), href: '/mentees/add', icon: HiOutlinePlus }
      : null,
    isOps ? { label: t('nav.analytics'), href: '/analytics', icon: HiOutlineChartBar } : null,
    role === 'mentee'
      ? { label: t('nav.slots'), href: '/slots', icon: HiOutlineCalendarDays }
      : { label: t('nav.sessions'), href: '/session-logs', icon: HiOutlineCalendarDays },
  ].filter((action): action is { label: string; href: string; icon: typeof HiOutlinePlus } => Boolean(action));

  const progressItems = [
    { label: t('dashboard.progressCompleted'), value: stats.menteesCompleted, pct: stats.totalMentees },
    { label: t('dashboard.progressInProgress'), value: stats.menteesInProgress, pct: stats.totalMentees },
    { label: t('dashboard.progressJustStarted'), value: stats.menteesJustStarted, pct: stats.totalMentees },
    { label: t('dashboard.mentorsAtCapacity'), value: stats.mentorsAtCapacity, pct: stats.totalMentors },
  ];

  return (
    <PageShell>
      <DashboardHero />
      <SceneStrip />

      {isOps && <div className="dashboard-promo-grid" data-reveal>
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
      </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8" data-reveal>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8" data-reveal>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" data-reveal>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" data-reveal>
        <SmartMatchPanel compact />
        <LiveActivityFeed />
      </div>

      {isOps && <section className="card p-6 mb-8" data-reveal>
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
      </section>}

      {!loading && !error && isOps && (
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
