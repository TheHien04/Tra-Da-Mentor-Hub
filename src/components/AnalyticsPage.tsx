import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from 'react-icons/hi2';
import { exportAnalyticsCsv, type AnalyticsPeriod } from '../lib/analyticsCompute';
import { useAnalyticsSummary } from '../hooks/queries/useAnalytics';
import { PageShell, PageHeader, Alert } from './ui';
import { AnalyticsKpiCard } from './analytics/AnalyticsKpiCard';
import Skeleton from './Skeleton';

const CHART_TOOLTIP = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: 12,
};

const PROGRESS_COLORS = ['#a1a1aa', 'var(--accent)', '#10b981'];

const PERIODS: AnalyticsPeriod[] = ['7d', '30d', '90d', 'all'];

const AnalyticsPage = () => {
  const { t, i18n } = useAppTranslation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('90d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const { data: snapshot, isLoading, isError, refetch, isFetching } = useAnalyticsSummary(period, locale);

  useEffect(() => {
    if (snapshot) setLastUpdated(new Date());
  }, [snapshot]);

  useEffect(() => {
    if (isError) toast.error(t('common.loadError'));
  }, [isError, t]);

  const loading = isLoading || isFetching;

  const progressPie = useMemo(() => {
    if (!snapshot) return [];
    const keys = ['justStarted', 'inProgress', 'completed'] as const;
    const labels = {
      justStarted: t('pages.analytics.progressJustStarted'),
      inProgress: t('pages.analytics.progressInProgress'),
      completed: t('pages.analytics.progressCompleted'),
    };
    return snapshot.progressSegments
      .map((seg, i) => ({
        name: labels[keys[i]],
        value: seg.value,
        fill: PROGRESS_COLORS[i],
        key: keys[i],
      }))
      .filter((d) => d.value > 0);
  }, [snapshot, t]);

  const progressPieTotal = useMemo(
    () => progressPie.reduce((s, d) => s + d.value, 0),
    [progressPie]
  );

  const handleExport = () => {
    if (!snapshot) return;
    const csv = exportAnalyticsCsv(snapshot, {
      exportMetric: t('pages.analytics.exportMetric'),
      exportValue: t('pages.analytics.exportValue'),
      statMentors: t('pages.analytics.statMentors'),
      statMentees: t('pages.analytics.statMentees'),
      statGroups: t('pages.analytics.statGroups'),
      statCompletionRate: t('pages.analytics.statCompletionRate'),
      statAvgProgress: t('pages.analytics.statAvgProgress'),
      statSessions: t('pages.analytics.statSessions'),
      statUtilization: t('pages.analytics.statUtilization'),
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tea-mentor-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodLabel = (p: AnalyticsPeriod) => t(`pages.analytics.period${p}`);

  return (
    <PageShell>
      <PageHeader
        title={t('nav.analytics')}
        description={t('pages.analytics.description')}
        icon={<HiOutlineChartBar className="h-7 w-7" />}
        action={{
          label: t('pages.insights.title'),
          href: '/insights',
        }}
      />

      <div className="analytics-toolbar mb-6">
        <div className="analytics-period" role="tablist" aria-label={t('pages.analytics.periodLabel')}>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`analytics-period__btn ${period === p ? 'analytics-period__btn--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {periodLabel(p)}
            </button>
          ))}
        </div>
        <div className="analytics-toolbar__actions">
          {lastUpdated && (
            <span className="text-xs text-muted hidden sm:inline">
              {t('pages.analytics.lastUpdated', {
                time: lastUpdated.toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              })}
            </span>
          )}
          <button
            type="button"
            className="btn btn-secondary text-sm py-2 px-3"
            onClick={() => void refetch()}
            disabled={loading}
            aria-label={t('pages.analytics.refresh')}
          >
            <HiOutlineArrowPath className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            className="btn btn-secondary text-sm py-2 px-3 gap-1.5"
            onClick={handleExport}
            disabled={!snapshot}
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            <span className="hidden sm:inline">{t('pages.analytics.export')}</span>
          </button>
        </div>
      </div>

      {loading && !snapshot ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="analytics-kpi analytics-kpi--default">
                <Skeleton count={2} />
              </div>
            ))}
          </div>
          <Skeleton count={6} />
        </div>
      ) : !snapshot ? (
        <Alert variant="error">{t('common.loadError')}</Alert>
      ) : (
        <>
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
            <AnalyticsKpiCard
              label={t('pages.analytics.statGroups')}
              value={snapshot.kpis.groups}
              icon={HiOutlineUsers}
              accent="info"
            />
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
              hint={
                snapshot.satisfactionAvg != null
                  ? t('pages.analytics.hintSatisfaction')
                  : t('pages.analytics.hintNoScores')
              }
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

          <Link to="/insights" className="analytics-insights-banner mb-6 group">
            <span className="analytics-insights-banner__icon">
              <HiOutlineSparkles className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-primary">
                {t('pages.analytics.insightsCtaTitle')}
              </span>
              <span className="block text-xs text-muted mt-0.5">{t('pages.analytics.insightsCtaDesc')}</span>
            </span>
            <span className="text-sm font-medium shrink-0" style={{ color: 'var(--accent)' }}>
              {t('pages.analytics.insightsCtaLink')} →
            </span>
          </Link>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <section className="card p-6 xl:col-span-1" aria-labelledby="chart-progress-title">
              <h2 id="chart-progress-title" className="analytics-chart-title">
                {t('pages.analytics.chartProgress')}
              </h2>
              <p className="analytics-chart-sub">{t('pages.analytics.chartProgressSub')}</p>
              <div
                className="analytics-donut-wrap h-64 mt-4"
                role="img"
                aria-label={t('a11y.chartProgress', { avg: snapshot?.kpis.avgProgress ?? 0 })}
              >
                {progressPieTotal === 0 ? (
                  <p className="text-sm text-muted text-center py-16">{t('pages.analytics.noMentees')}</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressPie}
                        cx="50%"
                        cy="46%"
                        innerRadius={56}
                        outerRadius={80}
                        paddingAngle={progressPie.length > 1 ? 2 : 0}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="var(--bg-surface)"
                        strokeWidth={2}
                      >
                        {progressPie.map((entry) => (
                          <Cell key={entry.key} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (!viewBox || !('cx' in viewBox) || viewBox.cx == null || viewBox.cy == null) {
                              return null;
                            }
                            const cx = Number(viewBox.cx);
                            const cy = Number(viewBox.cy);
                            return (
                              <g>
                                <text
                                  x={cx}
                                  y={cy - 6}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="var(--accent-subtle-fg)"
                                  fontSize={26}
                                  fontWeight={600}
                                >
                                  {snapshot.kpis.avgProgress}%
                                </text>
                                <text
                                  x={cx}
                                  y={cy + 16}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="var(--text-muted)"
                                  fontSize={10}
                                  fontWeight={500}
                                >
                                  {t('pages.analytics.avgProgressShort')}
                                </text>
                              </g>
                            );
                          }}
                          position="center"
                        />
                      </Pie>
                      <Tooltip
                        contentStyle={CHART_TOOLTIP}
                        formatter={(value: number, name: string) => [
                          `${value} (${progressPieTotal > 0 ? Math.round((Number(value) / progressPieTotal) * 100) : 0}%)`,
                          name,
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {progressPieTotal > 0 && snapshot && (
                <ul className="analytics-donut-legend">
                  {(
                    [
                      { key: 'justStarted', label: t('pages.analytics.progressJustStarted'), color: PROGRESS_COLORS[0] },
                      { key: 'inProgress', label: t('pages.analytics.progressInProgress'), color: PROGRESS_COLORS[1] },
                      { key: 'completed', label: t('pages.analytics.progressCompleted'), color: PROGRESS_COLORS[2] },
                    ] as const
                  ).map((item, i) => {
                    const seg = snapshot.progressSegments[i];
                    return (
                      <li key={item.key} className="analytics-donut-legend__item">
                        <span className="analytics-donut-legend__dot" style={{ background: item.color }} />
                        <span className="analytics-donut-legend__label">{item.label}</span>
                        <span className="analytics-donut-legend__value tabular-nums">{seg?.value ?? 0}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="card p-6 xl:col-span-2" aria-labelledby="chart-trend-title">
              <h2 id="chart-trend-title" className="analytics-chart-title">
                {t('pages.analytics.chartTrend')}
              </h2>
              <p className="analytics-chart-sub">{t('pages.analytics.chartTrendSub')}</p>
              <div className="h-64 mt-4" role="img" aria-label={t('a11y.chartTrend')}>
                {snapshot.sessionTrend.every((r) => r.sessions === 0 && r.bookings === 0) ? (
                  <p className="text-sm text-muted text-center py-20">{t('pages.analytics.trendEmpty')}</p>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={snapshot.sessionTrend}>
                    <defs>
                      <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      domain={[0, 'auto']}
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>
                      )}
                    />
                    <Area
                      type="linear"
                      dataKey="sessions"
                      name={t('pages.analytics.legendSessions')}
                      stroke="var(--accent)"
                      strokeWidth={2}
                      fill="url(#sessionsGrad)"
                      connectNulls
                      dot={{
                        r: 3,
                        stroke: 'var(--accent)',
                        strokeWidth: 2,
                        fill: 'var(--bg-surface)',
                      }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                      type="linear"
                      dataKey="bookings"
                      name={t('pages.analytics.legendBookings')}
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#bookingsGrad)"
                      connectNulls
                      dot={{
                        r: 3,
                        stroke: '#6366f1',
                        strokeWidth: 2,
                        fill: 'var(--bg-surface)',
                      }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <section className="card p-6">
              <h2 className="analytics-chart-title">{t('pages.analytics.chartTracks')}</h2>
              <p className="analytics-chart-sub">{t('pages.analytics.chartTracksSub')}</p>
              <div className="h-64 mt-4">
                {snapshot.trackDistribution.length === 0 ? (
                  <Alert variant="info">{t('pages.analytics.tracksEmpty')}</Alert>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot.trackDistribution} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={100}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={CHART_TOOLTIP} />
                      <Bar dataKey="count" fill="var(--accent)" radius={[0, 6, 6, 0]} name={t('pages.analytics.legendPeople')} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="card p-6">
              <h2 className="analytics-chart-title">{t('pages.analytics.chartMentorLoad')}</h2>
              <p className="analytics-chart-sub">{t('pages.analytics.chartMentorLoadSub')}</p>
              <ul className="mt-4 space-y-4">
                {snapshot.topMentors.length === 0 ? (
                  <li className="text-sm text-muted py-8 text-center">{t('pages.analytics.mentorsEmpty')}</li>
                ) : (
                  snapshot.topMentors.map((m) => {
                    const pct = m.capacity > 0 ? Math.round((m.filled / m.capacity) * 100) : 0;
                    return (
                      <li key={m.name}>
                        <div className="flex justify-between text-sm mb-1.5 gap-2">
                          <span className="font-medium text-primary truncate">{m.name}</span>
                          <span className="text-muted tabular-nums shrink-0">
                            {m.filled}/{m.capacity}
                          </span>
                        </div>
                        <div className="analytics-load-bar">
                          <div
                            className={`analytics-load-bar__fill ${pct >= 100 ? 'analytics-load-bar__fill--full' : ''}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </div>

          <section className="card p-6">
            <h2 className="analytics-chart-title">{t('pages.analytics.chartSkills')}</h2>
            <p className="analytics-chart-sub">{t('pages.analytics.chartSkillsSub')}</p>
            <ul className="mt-5 space-y-3">
              {snapshot.topSkills.length === 0 ? (
                <Alert variant="info">{t('pages.analytics.skillsEmpty')}</Alert>
              ) : (
                snapshot.topSkills.map((row, i) => {
                  const max = snapshot.topSkills[0]?.count || 1;
                  const pct = Math.round((row.count / max) * 100);
                  return (
                    <li key={row.skill} className="analytics-skill-row">
                      <span className="analytics-skill-row__rank">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1 gap-2">
                          <span className="font-medium text-primary truncate">{row.skill}</span>
                          <span className="text-muted tabular-nums shrink-0">{row.count}</span>
                        </div>
                        <div className="analytics-skill-bar">
                          <div className="analytics-skill-bar__fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </>
      )}
    </PageShell>
  );
};

export default AnalyticsPage;
