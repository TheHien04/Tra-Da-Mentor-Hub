import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useMentors } from '../hooks/queries/useMentors';
import { useMentees } from '../hooks/queries/useMentees';
import { useMatchSuggestions } from '../hooks/queries/useMatching';
import type { Mentor, Mentee } from '../types/models';
import { PageShell, PageHeader, Alert } from '../components/ui';
import { SmartMatchPanel } from '../components/features/SmartMatchPanel';
import Skeleton from '../components/Skeleton';

const InsightsPage = () => {
  const { t } = useAppTranslation();
  const {
    data: mentors = [],
    isLoading: mentorsLoading,
    isError: mentorsError,
    refetch: refetchMentors,
  } = useMentors();
  const {
    data: mentees = [],
    isLoading: menteesLoading,
    isError: menteesError,
    refetch: refetchMentees,
  } = useMentees();
  const {
    data: matches = [],
    isLoading: matchesLoading,
    isError: matchesError,
    refetch: refetchMatches,
  } = useMatchSuggestions({ limit: 50 });

  const loading = mentorsLoading || menteesLoading || matchesLoading;
  const loadError = mentorsError || menteesError || matchesError;

  const stats = useMemo(() => {
    const mentorList = mentors as Mentor[];
    const menteeList = mentees as Mentee[];
    const unassigned = menteeList.filter((m) => !m.mentorId).length;
    const openCapacity = mentorList.filter((m) => {
      const cap = m.maxMentees || 10;
      const filled = m.mentees?.length || 0;
      return filled < cap;
    }).length;
    const highMatchCount = matches.filter((m) => m.score >= 80).length;
    return {
      unassigned,
      openCapacity,
      matchCount: matches.length,
      highMatchCount,
    };
  }, [mentors, mentees, matches]);

  const statCards = [
    {
      value: stats.unassigned,
      label: t('pages.insights.statUnassigned'),
      hint: t('pages.insights.unassignedHint'),
      icon: HiOutlineUserGroup,
    },
    {
      value: stats.openCapacity,
      label: t('pages.insights.statOpenCapacity'),
      hint: t('pages.insights.capacityHint'),
      icon: HiOutlineAcademicCap,
    },
    {
      value: stats.matchCount,
      label: t('pages.insights.statMatches'),
      hint: t('pages.insights.matchesHint'),
      icon: HiOutlineSparkles,
    },
    {
      value: stats.highMatchCount,
      label: t('pages.insights.statHighMatch'),
      hint: t('pages.insights.highMatchHint'),
      icon: HiOutlineUsers,
    },
  ];

  const retryAll = () => {
    void refetchMentors();
    void refetchMentees();
    void refetchMatches();
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.insights.title')}
        description={t('pages.insights.description')}
        icon={<HiOutlineSparkles className="h-7 w-7" />}
        badge="beta"
        action={{ label: t('nav.analytics'), href: '/analytics' }}
      />

      {loadError && (
        <Alert variant="error" className="mb-6">
          <p>{t('common.loadError')}</p>
          <button type="button" className="btn btn-secondary text-sm mt-3" onClick={retryAll}>
            {t('common.retry')}
          </button>
        </Alert>
      )}

      <div className="insights-stat-grid">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="insights-stat-card">
                <Skeleton count={2} />
              </div>
            ))
          : statCards.map((card) => (
              <div key={card.label} className="insights-stat-card card-hover group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="icon-chip">
                    <card.icon className="h-4 w-4" />
                  </span>
                  <Link
                    to="/analytics"
                    className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent)' }}
                  >
                    <HiOutlineChartBar className="h-4 w-4" />
                  </Link>
                </div>
                <p className="insights-stat-card__value">{card.value}</p>
                <p className="insights-stat-card__label">{card.label}</p>
                <p className="insights-stat-card__hint">{card.hint}</p>
              </div>
            ))}
      </div>

      <SmartMatchPanel />
    </PageShell>
  );
};

export default InsightsPage;
