/**
 * Session Log – CRM after each mentoring session
 */

import { useState, useEffect } from 'react';
import { sessionLogsApi, mentorApi, menteeApi } from '../services/api';
import { unwrapList } from '../lib/apiHelpers';
import { HiOutlineClipboardDocumentList, HiOutlinePlus } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from '../components/ui';
import { FormField, FormActions } from '../components/ui/FormShell';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface SessionLogItem {
  _id: string;
  mentorId: string;
  menteeId: string;
  sessionDate: string;
  topic: string;
  mentorScore?: number | null;
  menteeScore?: number | null;
  mentorNeedsSupport?: boolean;
  menteeNeedsSupport?: boolean;
}

const SessionLogPage = () => {
  const { t, formatDate } = useAppTranslation();
  const [logs, setLogs] = useState<SessionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mentors, setMentors] = useState<{ _id: string; name?: string; email?: string }[]>([]);
  const [mentees, setMentees] = useState<{ _id: string; name?: string; email?: string }[]>([]);
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

  const fetchLogs = async () => {
    try {
      const res = await sessionLogsApi.getAll();
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    Promise.all([mentorApi.getAll(), menteeApi.getAll()])
      .then(([mRes, meRes]) => {
        setMentors(unwrapList(mRes));
        setMentees(unwrapList(meRes));
      })
      .catch(() => {});
  }, []);

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
      fetchLogs();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.sessionLog.saveFailed'));
    }
  };

  const nameOf = (list: { _id: string; name?: string; email?: string }[], id: string) =>
    list.find((x) => x._id === id)?.name || list.find((x) => x._id === id)?.email || id;

  return (
    <PageShell>
      <PageHeader
        title={t('pages.sessionLog.title')}
        description={t('pages.sessionLog.description')}
        icon={<HiOutlineClipboardDocumentList className="h-7 w-7" />}
      >
        <button type="button" className="btn btn-primary mt-3" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlus className="h-4 w-4" />
          {showForm ? t('pages.sessionLog.closeForm') : t('pages.sessionLog.newLog')}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
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

      {loading ? (
        <Skeleton count={4} />
      ) : logs.length === 0 ? (
        <EmptyState
          title={t('pages.sessionLog.emptyTitle')}
          description={t('pages.sessionLog.emptyDesc')}
          actionLabel={t('pages.sessionLog.newLog')}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted" style={{ borderColor: 'var(--border-default)' }}>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.dateCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.mentorCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.menteeCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.topicCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.scoresCol')}</th>
                  <th className="px-4 py-3 font-medium">{t('pages.sessionLog.supportCol')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <td className="px-4 py-3 text-secondary whitespace-nowrap">
                      {log.sessionDate ? formatDate(log.sessionDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-primary">{nameOf(mentors, log.mentorId)}</td>
                    <td className="px-4 py-3 text-primary">{nameOf(mentees, log.menteeId)}</td>
                    <td className="px-4 py-3 text-secondary max-w-[200px] truncate">{log.topic}</td>
                    <td className="px-4 py-3 text-muted tabular-nums">
                      {log.mentorScore ?? '—'} / {log.menteeScore ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {log.mentorNeedsSupport || log.menteeNeedsSupport ? (
                        <span className="badge-pill badge-warning">{t('common.yes')}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Alert variant="info" className="mt-6">
        {t('pages.sessionLog.realtimeNote')}
      </Alert>
    </PageShell>
  );
};

export default SessionLogPage;
