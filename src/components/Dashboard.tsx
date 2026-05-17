import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { mentorApi, menteeApi, groupApi, slotsApi } from '../services/api';
import type { Mentor, Mentee } from '../types/models';
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
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';

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
}

const Dashboard = () => {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = state.user?.role || 'user';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalMentors: 0,
    totalMentees: 0,
    totalGroups: 0,
    mentorsAtCapacity: 0,
    menteesCompleted: 0,
    menteesInProgress: 0,
    menteesJustStarted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<
    { skill: string; count: number; percentage: number }[]
  >([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [mentorsRes, menteesRes, groupsRes, slotsRes] = await Promise.all([
          mentorApi.getAll(),
          menteeApi.getAll(),
          groupApi.getAll(),
          slotsApi.getAll(),
        ]);

        const mentorsList = unwrapList<Mentor>(mentorsRes);
        const menteesData = unwrapList<Mentee>(menteesRes);
        const groupsList = unwrapList(groupsRes);

        const mentorName = (id: string) =>
          mentorsList.find((m) => m._id === id)?.name || id;

        const slots = Array.isArray(slotsRes.data) ? slotsRes.data : [];
        const today = new Date().toISOString().split('T')[0];
        const upcoming = (slots as Record<string, unknown>[])
          .filter((s) => String(s.date || '') >= today && (s.bookedBy || s.menteeId))
          .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
          .slice(0, 5)
          .map((s) => ({
            _id: String(s._id),
            title: t('dashboard.slotSession', { mentor: mentorName(String(s.mentorId)) }),
            mentor: mentorName(String(s.mentorId)),
            date: String(s.date),
            time: String(s.time || ''),
            type: 'ONE_ON_ONE' as const,
          }));
        setUpcomingSessions(upcoming);

        const mentorsAtCapacity = mentorsList.filter(
          (m) => m.maxMentees && m.mentees && m.mentees.length >= m.maxMentees
        ).length;
        const menteesCompleted = menteesData.filter((m) => m.progress === 100).length;
        const menteesInProgress = menteesData.filter(
          (m) => m.progress && m.progress > 0 && m.progress < 100
        ).length;
        const menteesJustStarted = menteesData.filter((m) => !m.progress || m.progress === 0).length;

        const skillMap = new Map<string, number>();
        menteesData.forEach((m) => {
          (m.interests || []).forEach((skill: string) => {
            const key = skill.trim();
            if (key) skillMap.set(key, (skillMap.get(key) || 0) + 1);
          });
        });
        if (skillMap.size === 0) {
          mentorsList.forEach((m) => {
            (m.expertise || []).forEach((skill: string) => {
              const key = skill.trim();
              if (key) skillMap.set(key, (skillMap.get(key) || 0) + 1);
            });
          });
        }
        const topSkills = [...skillMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const maxCount = topSkills[0]?.[1] || 1;
        setTrendingSkills(
          topSkills.map(([skill, count]) => ({
            skill,
            count,
            percentage: Math.round((count / maxCount) * 100),
          }))
        );

        setStats({
          totalMentors: mentorsList.length,
          totalMentees: menteesData.length,
          totalGroups: groupsList.length,
          mentorsAtCapacity,
          menteesCompleted,
          menteesInProgress,
          menteesJustStarted,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const roleSubtitle =
    role === 'mentor'
      ? t('dashboard.mentorSubtitle', 'Your mentoring sessions and mentee capacity')
      : role === 'mentee'
        ? t('dashboard.menteeSubtitle', 'Your sessions and connected mentor')
        : role === 'admin'
          ? t('dashboard.adminSubtitle', 'Platform overview across mentors and mentees')
          : t('dashboard.defaultSubtitle', 'Guide the future, unlock potential');

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
    { label: t('nav.sessions'), href: '/session-logs', icon: HiOutlineCalendarDays },
  ];

  const progressItems = [
    { label: t('dashboard.progressCompleted'), value: stats.menteesCompleted, pct: stats.totalMentees },
    { label: t('dashboard.progressInProgress'), value: stats.menteesInProgress, pct: stats.totalMentees },
    { label: t('dashboard.progressJustStarted'), value: stats.menteesJustStarted, pct: stats.totalMentees },
    { label: t('dashboard.mentorsAtCapacity'), value: stats.mentorsAtCapacity, pct: stats.totalMentors },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">
          {t('dashboard.welcome')}
          {state.user?.name ? `, ${state.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="page-subtitle">{roleSubtitle}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
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
              <Link key={card.label} to={card.href} className="stat-card card-hover group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="stat-label">{card.label}</p>
                    <p className="stat-value mt-1">{card.value}</p>
                  </div>
                  <span className="stat-icon-box">
                    <card.icon className="h-5 w-5" />
                  </span>
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
                  className={`badge-pill shrink-0 ${session.type === 'GROUP' ? 'badge-accent' : 'badge-neutral'}`}
                >
                  {session.type === 'GROUP' ? t('dashboard.sessionTypeGroup') : t('dashboard.sessionTypeOneOnOne')}
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
            {trendingSkills.map((skill) => (
              <li key={skill.skill}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-secondary">{skill.skill}</span>
                  <span className="text-muted tabular-nums">{skill.count}</span>
                </div>
                <div className="h-1.5 rounded-full surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.percentage}%`, backgroundColor: 'var(--accent)' }}
                  />
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
    </div>
  );
};

export default Dashboard;
