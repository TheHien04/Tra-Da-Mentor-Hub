import {
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineChartPie,
  HiOutlineExclamationTriangle,
  HiOutlineStar,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from 'react-icons/hi2';
import type { AnalyticsSnapshot } from '../../lib/analyticsCompute';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { AnalyticsKpiCard } from './AnalyticsKpiCard';

export function AnalyticsKpiGrid({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const { t } = useAppTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AnalyticsKpiCard
        label={t('pages.analytics.statMentors')}
        value={snapshot.kpis.mentors}
        hint={t('pages.analytics.hintMentors', { util: snapshot.kpis.mentorUtilization })}
        icon={HiOutlineAcademicCap}
      />
      <AnalyticsKpiCard
        label={t('pages.analytics.statMentees')}
        value={snapshot.kpis.mentees}
        hint={t('pages.analytics.hintMentees', { rate: snapshot.kpis.completionRate })}
        icon={HiOutlineUserGroup}
        accent="success"
      />
      <AnalyticsKpiCard label={t('pages.analytics.statGroups')} value={snapshot.kpis.groups} icon={HiOutlineUsers} accent="info" />
      <AnalyticsKpiCard
        label={t('pages.analytics.statCompletionRate')}
        value={`${snapshot.kpis.completionRate}%`}
        hint={t('pages.analytics.hintAvgProgress', { avg: snapshot.kpis.avgProgress })}
        icon={HiOutlineChartPie}
        accent="success"
      />
      <AnalyticsKpiCard
        label={t('pages.analytics.statSessions')}
        value={snapshot.kpis.sessionsLogged}
        hint={t('pages.analytics.hintPeriod')}
        icon={HiOutlineCalendarDays}
      />
      <AnalyticsKpiCard
        label={t('pages.analytics.statBookedSlots')}
        value={snapshot.kpis.bookedSlots}
        hint={t('pages.analytics.hintOpenSlots', { open: snapshot.kpis.openSlots })}
        icon={HiOutlineCalendarDays}
        accent="info"
      />
      <AnalyticsKpiCard
        label={t('pages.analytics.statSatisfaction')}
        value={snapshot.satisfactionAvg ?? '—'}
        hint={snapshot.satisfactionAvg != null ? t('pages.analytics.hintSatisfaction') : t('pages.analytics.hintNoScores')}
        icon={HiOutlineStar}
        accent="warning"
      />
      <AnalyticsKpiCard
        label={t('pages.analytics.statNeedsSupport')}
        value={snapshot.kpis.needsSupport}
        hint={t('pages.analytics.hintActivities', { count: snapshot.activitiesInPeriod })}
        icon={HiOutlineExclamationTriangle}
        accent={snapshot.kpis.needsSupport > 0 ? 'warning' : 'default'}
      />
    </div>
  );
}
