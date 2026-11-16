import { useEffect, useMemo, useState } from 'react';
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
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineBolt,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Skeleton from '../components/Skeleton';
import { Alert } from '../components/ui/Alert';
import { LiveActivityFeed } from '../components/features/LiveActivityFeed';
import { DashboardHero } from '../components/features/DashboardHero';
import { PageShell } from '../components/ui/PageShell';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { slotInstant } from '../lib/slotClock';
import { skillLabel } from '../lib/skillLabel';

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
  isBooked: boolean;
}

function parseSlotDateTime(date: string, time?: string) {
  return slotInstant(date, time);
}

const Dashboard = () => {
  const { t, i18n, lang, formatDate } = useAppTranslation();
  const { state } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
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
  const error = slotsError
    ? getApiErrorMessage(slotsQueryError)
    : isOps && summaryError
      ? getApiErrorMessage(summaryQueryError)
      : null;

  const { stats, upcomingSessions, trendingSkills } = useMemo((): {
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    trendingSkills: { skill: string; count: number; percentage: number }[];
  } => {
    const mentorName = (slot: (typeof slots)[number]) =>
      slot.mentorName || t('dashboard.unnamedMentor');
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
        ? t('dashboard.slotSession', { mentor: mentorName(s.raw) })
        : t('dashboard.slotOpen', { mentor: mentorName(s.raw) }),
      mentor: mentorName(s.raw),
      date: s.date,
      time: s.time,
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
          label: t('dashboard.mentorsAtCapacity'),
          value: stats.mentorsAtCapacity,
          icon: HiOutlineTrophy,
          href: '/mentors',
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

  const next = upcomingSessions[0];
  const laterSessions = upcomingSessions.slice(1);
  const formatSlotDay = (date: string) => formatDate(`${date}T12:00:00`);
  const nextHref = next ? '/schedule' : role === 'mentee' ? '/slots' : role === 'admin' ? '/insights' : '/slots';
  const nextLabel = next
    ? t('dashboard.nextUpOpen')
    : role === 'mentee'
      ? t('dashboard.bookSession')
      : role === 'admin'
        ? t('dashboard.reviewMatch')
        : t('dashboard.openSlot');
  const nextHint = next
    ? null
    : role === 'mentee'
      ? t('dashboard.nextUpHintMentee')
      : role === 'admin'
        ? t('dashboard.nextUpHintAdmin')
        : t('dashboard.nextUpHintMentor');

  const progressItems = [
    { label: t('dashboard.progressCompleted'), value: stats.menteesCompleted, pct: stats.totalMentees },
    { label: t('dashboard.progressInProgress'), value: stats.menteesInProgress, pct: stats.totalMentees },
    { label: t('dashboard.progressJustStarted'), value: stats.menteesJustStarted, pct: stats.totalMentees },
    { label: t('dashboard.mentorsAtCapacity'), value: stats.mentorsAtCapacity, pct: stats.totalMentors },
  ];

  const actionItems = isOps
    ? [
        {
          label: t('nav.schedule'),
          detail: upcomingSessions.length > 0
            ? t('dashboard.upcomingSessions')
            : t('dashboard.nextUpEmpty'),
          href: upcomingSessions.length > 0 ? '/schedule' : '/slots',
          icon: HiOutlineBolt,
          tone: 'accent',
        },
        {
          label: t('nav.analytics'),
          detail: t('dashboard.analyticsBannerDesc'),
          href: '/analytics',
          icon: HiOutlineChartBar,
          tone: 'neutral',
        },
      ]
    : [
        {
          label: role === 'mentee'
            ? t('dashboard.bookSession')
            : t('dashboard.openSlot'),
          detail: role === 'mentee'
            ? t('dashboard.nextUpHintMentee')
            : t('dashboard.nextUpHintMentor'),
          href: '/slots',
          icon: HiOutlineBolt,
          tone: 'accent',
        },
        {
          label: t('nav.schedule'),
          detail: upcomingSessions.length > 0
            ? t('dashboard.nextUp')
            : t('dashboard.nextUpEmpty'),
          href: '/schedule',
          icon: upcomingSessions.length > 0 ? HiOutlineCheckCircle : HiOutlineExclamationTriangle,
          tone: upcomingSessions.length > 0 ? 'success' : 'warning',
        },
      ];

  if (error) {
    return (
      <PageShell>
        <DashboardHero />
        <Alert variant="error" title={t('common.loadError')}>
          {error}
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <DashboardHero />
      {!loading && isOps && stats.mentorsAtCapacity > 0 && (
        <Link to="/mentors" className="dashboard-alert">
          <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <span>
            <strong>{t('dashboard.capacityAlert', { count: stats.mentorsAtCapacity })}</strong>
            <span>{t('dashboard.capacityAlertHint')}</span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

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

      <div className="work-grid work-grid--single">
        <section className="next-up" aria-labelledby="next-up-title">
          <div className="min-w-0">
            <p className="next-up__kicker">{t('dashboard.nextUp')}</p>
            {loading ? <Skeleton count={2} /> : (
              <>
                <h2 id="next-up-title" className="next-up__title">
                  {next ? next.title : t('dashboard.nextUpEmpty')}
                </h2>
                <p className="next-up__meta">
                  {next ? `${formatSlotDay(next.date)} · ${next.time}` : nextHint}
                </p>
              </>
            )}
          </div>
          {!loading && (
            <Link to={nextHref} className="btn btn-primary shrink-0">
              {nextLabel}
            </Link>
          )}
        </section>
      </div>

      <details className="dashboard-details card mb-8" onToggle={(event) => setDetailsOpen(event.currentTarget.open)}>
        <summary>{t('dashboard.moreDetails')}</summary>
        <div className="dashboard-details__body">
          <section className="action-center card p-5 mb-8" aria-labelledby="action-center-title">
            <h2 id="action-center-title" className="text-xl font-semibold text-primary mb-4">
              {t('dashboard.quickActions')}
            </h2>
            <div className="action-center__grid">
              {actionItems.map((item) => (
                <Link key={item.label} to={item.href} className={`action-card action-card--${item.tone}`}>
                  <span className="action-card__icon"><item.icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </span>
                  <span className="action-card__arrow" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </section>

          <div className={`grid grid-cols-1 gap-6 mb-8 ${laterSessions.length ? 'lg:grid-cols-2' : ''}`} data-reveal>
            {laterSessions.length > 0 && (
              <section className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-primary flex items-center gap-2">
                    <HiOutlineCalendarDays className="h-5 w-5 text-muted" />
                    {t('dashboard.laterSessions')}
                  </h2>
                  <Link to="/schedule" className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }}>
                    {t('dashboard.viewAll')}
                  </Link>
                </div>
                <ul className="space-y-2">
                  {laterSessions.map((session) => (
                    <li key={session._id} className="list-row flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary truncate">{session.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {session.mentor} · {formatSlotDay(session.date)} · {session.time}
                        </p>
                      </div>
                      <span className={`badge-pill shrink-0 ${session.isBooked ? 'badge-neutral' : 'badge-success'}`}>
                        {session.isBooked ? t('dashboard.sessionTypeOneOnOne') : t('dashboard.sessionOpenBadge')}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
                        <span className="font-medium text-primary truncate">{skillLabel(skill.skill, lang)}</span>
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

          <div className="mb-8" data-reveal>
            {detailsOpen && <LiveActivityFeed />}
          </div>

          {isOps && <section className="card p-6 mb-8" data-reveal>
            <h2 className="text-base font-semibold text-primary mb-5">{t('dashboard.overview')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {progressItems.map((item) => (
                <div key={item.label} className="surface-muted rounded-lg p-4">
                  <p className="text-xs font-medium text-muted mb-1">{item.label}</p>
                  <p className="text-2xl font-semibold tabular-nums text-primary">{item.value}</p>
                  <p className="text-xs text-muted mt-1">
                    {item.pct > 0 ? t('dashboard.progressShare', { value: item.value, total: item.pct }) : '—'}
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
        </div>
      </details>
    </PageShell>
  );
};

export default Dashboard;
