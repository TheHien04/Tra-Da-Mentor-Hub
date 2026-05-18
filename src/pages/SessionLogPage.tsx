/**
 * Session Log – CRM after each mentoring session
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sessionLogsApi } from '../services/api';
import { useMentors } from '../hooks/queries/useMentors';
import { useMentees } from '../hooks/queries/useMentees';
import { useSessionLogs } from '../hooks/queries/useSessionLogs';
import { queryKeys } from '../hooks/queries/keys';
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Avatar from '../components/Avatar';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert, FilterChips } from '../components/ui';
import { FormField, FormActions } from '../components/ui/FormShell';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAppTranslation } from '../hooks/useAppTranslation';

const SessionLogPage = () => {
  const { t, formatDate } = useAppTranslation();
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading: loading } = useSessionLogs();
  const { data: mentors = [] } = useMentors();
  const { data: mentees = [] } = useMentees();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');
  const [supportFilter, setSupportFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [form, setForm] = useState({
    mentorId: '',
    menteeId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    topic: '',
    mentorScore: '' as number | '',
    menteeScore: '' as number | '',
    mentorNeedsSupport: false,
    mentorSupportReason: '',
    menteeNeedsSupport: false,
    menteeSupportReason: '',
  });

  const nameOf = (list: { _id: string; name?: string; email?: string }[], id: string) =>
    list.find((x) => x._id === id)?.name || list.find((x) => x._id === id)?.email || id;

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonth = logs.filter((l) => {
      const d = new Date(l.sessionDate);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    const mentorScores = logs.map((l) => l.mentorScore).filter((s): s is number => typeof s === 'number');
    const menteeScores = logs.map((l) => l.menteeScore).filter((s): s is number => typeof s === 'number');
    const avgMentor =
      mentorScores.length > 0
        ? (mentorScores.reduce((a, b) => a + b, 0) / mentorScores.length).toFixed(1)
        : '—';
    const avgMentee =
      menteeScores.length > 0
        ? (menteeScores.reduce((a, b) => a + b, 0) / menteeScores.length).toFixed(1)
        : '—';
    const support = logs.filter((l) => l.mentorNeedsSupport || l.menteeNeedsSupport).length;
    return { total: logs.length, thisMonth, avgMentor, avgMentee, support };
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      const mentorName = nameOf(mentors, log.mentorId).toLowerCase();
      const menteeName = nameOf(mentees, log.menteeId).toLowerCase();
      const matchQ =
        !q ||
        log.topic.toLowerCase().includes(q) ||
        mentorName.includes(q) ||
        menteeName.includes(q);
      const matchMentor = !mentorFilter || log.mentorId === mentorFilter;
      const needsSupport = Boolean(log.mentorNeedsSupport || log.menteeNeedsSupport);
      const matchSupport =
        supportFilter === 'ALL' ||
        (supportFilter === 'YES' && needsSupport) ||
        (supportFilter === 'NO' && !needsSupport);
      return matchQ && matchMentor && matchSupport;
    });
  }, [logs, search, mentorFilter, supportFilter, mentors, mentees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mentorId || !form.menteeId || !form.sessionDate || !form.topic.trim()) {
      toast.error(t('pages.sessionLog.fillRequired'));
      return;
    }
    try {
      await sessionLogsApi.createOrUpdate({
        mentorId: form.mentorId,
        menteeId: form.menteeId,
        sessionDate: form.sessionDate,
        topic: form.topic.trim(),
        mentorScore: form.mentorScore === '' ? undefined : Number(form.mentorScore),
        menteeScore: form.menteeScore === '' ? undefined : Number(form.menteeScore),
        mentorNeedsSupport: form.mentorNeedsSupport,
        mentorSupportReason: form.mentorSupportReason || undefined,
        menteeNeedsSupport: form.menteeNeedsSupport,
        menteeSupportReason: form.menteeSupportReason || undefined,
        completedByMentor: true,
        completedByMentee: true,
      });
      toast.success(t('pages.sessionLog.saved'));
      setShowForm(false);
      setForm({
        mentorId: '',
        menteeId: '',
        sessionDate: new Date().toISOString().split('T')[0],
        topic: '',
        mentorScore: '',
        menteeScore: '',
        mentorNeedsSupport: false,
        mentorSupportReason: '',
        menteeNeedsSupport: false,
        menteeSupportReason: '',
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessionLogs });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.sessionLog.saveFailed'));
    }
  };

  const renderScores = (log: (typeof logs)[0]) => (
    <div className="session-log-scores">
      <div className="session-log-score">
        <span className="session-log-score__value">{log.mentorScore ?? '—'}</span>
        <span className="session-log-score__label">{t('pages.sessionLog.mentorShort')}</span>
      </div>
      <div className="session-log-score">
        <span className="session-log-score__value">{log.menteeScore ?? '—'}</span>
        <span className="session-log-score__label">{t('pages.sessionLog.menteeShort')}</span>
      </div>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('pages.sessionLog.title')}
        description={t('pages.sessionLog.descriptionStats', {
          total: stats.total,
          support: stats.support,
          avgMentor: stats.avgMentor,
          avgMentee: stats.avgMentee,
        })}
        icon={<HiOutlineClipboardDocumentList className="h-7 w-7" />}
      >
        <button type="button" className="btn btn-primary mt-3" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus className="h-4 w-4" />
          {showForm ? t('pages.sessionLog.closeForm') : t('pages.sessionLog.newLog')}
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('pages.sessionLog.statTotal'), value: stats.total },
          { label: t('pages.sessionLog.statThisMonth'), value: stats.thisMonth },
          { label: t('pages.sessionLog.statAvgMentor'), value: stats.avgMentor },
          { label: t('pages.sessionLog.statNeedsSupport'), value: stats.support },
        ].map((s) => (
          <div key={s.label} className="insights-stat-card">
            <p className="insights-stat-card__value">{s.value}</p>
            <p className="insights-stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-primary">{t('pages.sessionLog.sessionDetails')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('pages.sessionLog.mentor')} required>
              <select
                className="input"
                value={form.mentorId}
                onChange={(e) => setForm((f) => ({ ...f, mentorId: e.target.value }))}
                required
              >
                <option value="">{t('pages.sessionLog.selectMentor')}</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('pages.sessionLog.mentee')} required>
              <select
                className="input"
                value={form.menteeId}
                onChange={(e) => setForm((f) => ({ ...f, menteeId: e.target.value }))}
                required
              >
                <option value="">{t('pages.sessionLog.selectMentee')}</option>
                {mentees.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label={t('common.date')} required>
            <input
              type="date"
              className="input"
              value={form.sessionDate}
              onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('common.topic')} required>
            <input
              className="input"
              placeholder={t('pages.sessionLog.topicPlaceholder')}
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('pages.sessionLog.mentorScoreLabel')}>
              <select
                className="input"
                value={form.mentorScore}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mentorScore: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('pages.sessionLog.menteeScoreLabel')}>
              <select
                className="input"
                value={form.menteeScore}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    menteeScore: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={form.mentorNeedsSupport}
              onChange={(e) => setForm((f) => ({ ...f, mentorNeedsSupport: e.target.checked }))}
              style={{ accentColor: 'var(--accent)' }}
            />
            {t('pages.sessionLog.mentorNeedsSupport')}
          </label>
          {form.mentorNeedsSupport && (
            <textarea
              className="input"
              rows={2}
              placeholder={t('pages.sessionLog.reasonPlaceholder')}
              value={form.mentorSupportReason}
              onChange={(e) => setForm((f) => ({ ...f, mentorSupportReason: e.target.value }))}
            />
          )}
          <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={form.menteeNeedsSupport}
              onChange={(e) => setForm((f) => ({ ...f, menteeNeedsSupport: e.target.checked }))}
              style={{ accentColor: 'var(--accent)' }}
            />
            {t('pages.sessionLog.menteeNeedsSupport')}
          </label>
          {form.menteeNeedsSupport && (
            <textarea
              className="input"
              rows={2}
              placeholder={t('pages.sessionLog.reasonPlaceholder')}
              value={form.menteeSupportReason}
              onChange={(e) => setForm((f) => ({ ...f, menteeSupportReason: e.target.value }))}
            />
          )}
          <FormActions>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {t('pages.sessionLog.saveLog')}
            </button>
          </FormActions>
        </form>
      )}

      <div className="card p-4 mb-6 space-y-3">
        <input
          className="input"
          placeholder={t('pages.sessionLog.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[12rem] flex-1">
            <label className="text-xs font-medium text-muted block mb-1">{t('pages.sessionLog.filterMentor')}</label>
            <select className="input" value={mentorFilter} onChange={(e) => setMentorFilter(e.target.value)}>
              <option value="">{t('pages.sessionLog.filterAllMentors')}</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </div>
          <FilterChips
            options={[
              { value: 'ALL' as const, label: t('pages.sessionLog.filterSupportAll') },
              { value: 'YES' as const, label: t('pages.sessionLog.filterSupportYes') },
              { value: 'NO' as const, label: t('pages.sessionLog.filterSupportNo') },
            ]}
            value={supportFilter}
            onChange={setSupportFilter}
            ariaLabel={t('pages.sessionLog.filterSupport')}
          />
          <div className="flex rounded-lg border p-0.5 ml-auto" style={{ borderColor: 'var(--border-default)' }}>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'cards' ? 'btn-primary' : 'text-muted'}`}
              onClick={() => setViewMode('cards')}
            >
              {t('pages.sessionLog.viewCards')}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'table' ? 'btn-primary' : 'text-muted'}`}
              onClick={() => setViewMode('table')}
            >
              {t('pages.sessionLog.viewTable')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('pages.sessionLog.emptyTitle')}
          description={t('pages.sessionLog.emptyDesc')}
          actionLabel={t('pages.sessionLog.newLog')}
          onAction={() => setShowForm(true)}
        />
      ) : viewMode === 'table' ? (
        <div className="card crm-table-wrap p-0 overflow-hidden mb-6">
          <table className="crm-table">
            <thead>
              <tr>
                <th>{t('pages.sessionLog.dateCol')}</th>
                <th>{t('pages.sessionLog.topicCol')}</th>
                <th>{t('pages.sessionLog.mentorCol')}</th>
                <th>{t('pages.sessionLog.menteeCol')}</th>
                <th>{t('pages.sessionLog.scoresCol')}</th>
                <th>{t('pages.sessionLog.supportCol')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const needsSupport = log.mentorNeedsSupport || log.menteeNeedsSupport;
                return (
                  <tr key={log._id}>
                    <td className="whitespace-nowrap text-muted">
                      {log.sessionDate ? formatDate(log.sessionDate) : '—'}
                    </td>
                    <td className="font-medium text-primary max-w-[14rem]">{log.topic}</td>
                    <td>{nameOf(mentors, log.mentorId)}</td>
                    <td>{nameOf(mentees, log.menteeId)}</td>
                    <td className="tabular-nums">
                      {log.mentorScore ?? '—'} / {log.menteeScore ?? '—'}
                    </td>
                    <td>
                      {needsSupport ? (
                        <span className="badge-pill badge-warning text-xs">{t('pages.sessionLog.supportYes')}</span>
                      ) : (
                        <span className="text-muted">{t('pages.sessionLog.supportNo')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {filtered.map((log) => {
            const mentorName = nameOf(mentors, log.mentorId);
            const menteeName = nameOf(mentees, log.menteeId);
            const needsSupport = log.mentorNeedsSupport || log.menteeNeedsSupport;
            return (
              <article key={log._id} className="card card-hover people-card p-5 h-full">
                <div className="session-log-card h-full">
                  <div className="flex gap-3 min-w-0 flex-1">
                    <Avatar name={mentorName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted mb-1">
                        {log.sessionDate ? formatDate(log.sessionDate) : '—'}
                      </p>
                      <h3 className="text-sm font-semibold text-primary line-clamp-2">{log.topic}</h3>
                      <p className="text-sm text-secondary mt-2">
                        {mentorName} → {menteeName}
                      </p>
                      {needsSupport && (
                        <p className="schedule-meta-item mt-2 text-amber-700 dark:text-amber-400">
                          <HiOutlineExclamationTriangle className="h-4 w-4 shrink-0" />
                          {t('pages.sessionLog.needsSupportBadge')}
                        </p>
                      )}
                    </div>
                  </div>
                  {renderScores(log)}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Alert variant="info">{t('pages.sessionLog.realtimeNote')}</Alert>
    </PageShell>
  );
};

export default SessionLogPage;
