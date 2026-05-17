import { useEffect, useState } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { mentorApi, menteeApi, groupApi } from '../services/api';
import { unwrapList } from '../lib/apiHelpers';
import type { Mentor, Mentee } from '../types/models';
import { PageShell, PageHeader, Alert } from './ui';
import Skeleton from './Skeleton';

const chartTooltipStyle = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
};

const AnalyticsPage = () => {
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mentors: 0,
    mentees: 0,
    groups: 0,
    completed: 0,
    inProgress: 0,
  });
  const [skillData, setSkillData] = useState<{ skill: string; count: number }[]>([]);
  const [progressData, setProgressData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, meRes, gRes] = await Promise.all([
          mentorApi.getAll(),
          menteeApi.getAll(),
          groupApi.getAll(),
        ]);
        const mentors = unwrapList<Mentor>(mRes);
        const mentees = unwrapList<Mentee>(meRes);
        const groups = unwrapList(gRes);

        const completed = mentees.filter((m) => m.progress === 100).length;
        const inProgress = mentees.filter(
          (m) => m.progress && m.progress > 0 && m.progress < 100
        ).length;
        const justStarted = mentees.length - completed - inProgress;

        setStats({
          mentors: mentors.length,
          mentees: mentees.length,
          groups: groups.length,
          completed,
          inProgress,
        });

        const skillMap = new Map<string, number>();
        mentors.forEach((m) => {
          (m.expertise || []).forEach((s: string) => {
            skillMap.set(s, (skillMap.get(s) || 0) + 1);
          });
        });
        setSkillData(
          [...skillMap.entries()]
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
        );

        setProgressData([
          { name: t('pages.analytics.progressJustStarted'), value: justStarted },
          { name: t('pages.analytics.progressInProgress'), value: inProgress },
          { name: t('pages.analytics.progressCompleted'), value: completed },
        ]);
      } catch {
        /* keep defaults */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const trend = [
    { month: 'T8', sessions: 12 },
    { month: 'T9', sessions: 18 },
    { month: 'T10', sessions: 25 },
    { month: 'T11', sessions: 32 },
    { month: 'T12', sessions: 28 },
  ];

  return (
    <PageShell>
      <PageHeader
        title={t('nav.analytics')}
        description={t('pages.analytics.description')}
        icon={<HiOutlineChartBar className="h-7 w-7" />}
      />

      {loading ? (
        <Skeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('pages.analytics.statMentors'), value: stats.mentors },
              { label: t('pages.analytics.statMentees'), value: stats.mentees },
              { label: t('pages.analytics.statGroups'), value: stats.groups },
              { label: t('pages.analytics.statCompleted'), value: stats.completed },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <p className="stat-label">{s.label}</p>
                <p className="stat-value">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <section className="card p-6">
              <h2 className="text-base font-semibold text-primary mb-4">{t('pages.analytics.chartProgress')}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-base font-semibold text-primary mb-4">{t('pages.analytics.chartTrend')}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="sessions" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="card p-6">
            <h2 className="text-base font-semibold text-primary mb-4">{t('pages.analytics.chartSkills')}</h2>
            <ul className="space-y-3">
              {skillData.map((row) => (
                <li key={row.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary font-medium">{row.skill}</span>
                    <span className="text-muted tabular-nums">{row.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (row.count / (skillData[0]?.count || 1)) * 100)}%`,
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {skillData.length === 0 && (
              <Alert variant="info">{t('pages.analytics.skillsEmpty')}</Alert>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
};

export default AnalyticsPage;
