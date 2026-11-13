/**
 * Admin – Send notifications (in-app; email/Zalo when server is configured)
 */

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  HiOutlinePaperAirplane,
  HiOutlineUsers,
  HiOutlineEnvelope,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineBellAlert,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader } from '../components/ui';
import { useAdminIntegrations } from '../hooks/queries/useAdminIntegrations';
import { useAdminBroadcasts } from '../hooks/queries/useAdminBroadcasts';
import { useMentors } from '../hooks/queries/useMentors';
import { useMentees } from '../hooks/queries/useMentees';
import { DetailCard } from '../components/ui/DetailShell';
import { FormField, FormActions } from '../components/ui/FormShell';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { adminApi, type BroadcastChannel } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { queryKeys } from '../hooks/queries/keys';
import { AdminIntegrationStatus } from '../components/admin/AdminIntegrationStatus';

type Audience = 'mentors' | 'mentees' | 'all';

const AdminNotificationPage = () => {
  const { t, formatDateTime } = useAppTranslation();
  const queryClient = useQueryClient();
  const [audience, setAudience] = useState<Audience>('all');
  const [channel, setChannel] = useState<BroadcastChannel>('in_app');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const { data: integrations, isLoading: integrationsLoading } = useAdminIntegrations();
  const { data: broadcasts = [], isLoading: historyLoading } = useAdminBroadcasts();
  const { data: mentors = [] } = useMentors();
  const { data: mentees = [] } = useMentees();

  const extraChannelsAvailable = Boolean(integrations?.email || integrations?.zalo || integrations?.demo);

  const recipientCount = useMemo(() => {
    if (audience === 'mentors') return mentors.length;
    if (audience === 'mentees') return mentees.length;
    return mentors.length + mentees.length;
  }, [audience, mentors.length, mentees.length]);

  const audienceShort = (userId: string) => {
    if (userId === 'mentors') return t('pages.admin.notifications.audienceMentorsShort');
    if (userId === 'mentees') return t('pages.admin.notifications.audienceMenteesShort');
    return t('pages.admin.notifications.audienceAllShort');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warning(t('pages.admin.notifications.enterMessage'));
      return;
    }

    const emailAvailable = Boolean(integrations?.email || integrations?.demo);
    const zaloAvailable = Boolean(integrations?.zalo || integrations?.demo);
    const sendChannel =
      channel === 'email' && !emailAvailable
        ? 'in_app'
        : channel === 'zalo' && !zaloAvailable
          ? 'in_app'
          : channel === 'email_zalo' && !emailAvailable && !zaloAvailable
            ? 'in_app'
            : channel;

    setSending(true);
    try {
      await adminApi.broadcast({
        audience,
        subject: subject.trim() || undefined,
        message: message.trim(),
        channel: sendChannel,
      });
      toast.success(t('pages.admin.notifications.sent'));
      setSubject('');
      setMessage('');
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBroadcasts });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.admin.notifications.title')}
        description={t('pages.admin.notifications.description')}
        icon={<HiOutlinePaperAirplane className="h-7 w-7" />}
      />

      <AdminIntegrationStatus integrations={integrations} loading={integrationsLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start mb-8">
        <form onSubmit={handleSend} className="card p-6 space-y-4 xl:col-span-2">
          <FormField label={t('pages.admin.notifications.audience')}>
            <select
              className="input"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
            >
              <option value="all">{t('pages.admin.notifications.audienceAll')}</option>
              <option value="mentors">{t('pages.admin.notifications.audienceMentors')}</option>
              <option value="mentees">{t('pages.admin.notifications.audienceMentees')}</option>
            </select>
          </FormField>

          <div className="insights-stat-card">
            <p className="insights-stat-card__label">{t('pages.admin.notifications.recipientPreview')}</p>
            <p className="insights-stat-card__value text-2xl mt-1">{recipientCount}</p>
            <p className="text-xs text-muted mt-1">
              {t('pages.admin.notifications.recipientInApp', { count: recipientCount })}
            </p>
          </div>

          {extraChannelsAvailable && (
            <FormField label={t('pages.admin.notifications.channel')}>
              <select
                className="input"
                value={channel}
                onChange={(e) => setChannel(e.target.value as BroadcastChannel)}
              >
                <option value="in_app">{t('pages.admin.notifications.sendChannelInApp')}</option>
                {(integrations?.email || integrations?.demo) && (
                  <option value="email">{t('pages.admin.notifications.sendChannelEmail')}</option>
                )}
                {(integrations?.zalo || integrations?.demo) && (
                  <option value="zalo">{t('pages.admin.notifications.sendChannelZalo')}</option>
                )}
                {((integrations?.email && integrations?.zalo) || integrations?.demo) && (
                  <option value="email_zalo">{t('pages.admin.notifications.sendChannelEmailZalo')}</option>
                )}
              </select>
            </FormField>
          )}

          <div>
            <p className="text-xs font-medium text-muted mb-2">{t('pages.admin.notifications.templates')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => {
                  setAudience('mentees');
                  setSubject(t('pages.admin.notifications.templateDeadlineSubject'));
                  setMessage(t('pages.admin.notifications.templateDeadlineBody'));
                }}
              >
                {t('pages.admin.notifications.templateDeadline')}
              </button>
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => {
                  setAudience('mentees');
                  setSubject(t('pages.admin.notifications.templateSlotsSubject'));
                  setMessage(t('pages.admin.notifications.templateSlotsBody'));
                }}
              >
                {t('pages.admin.notifications.templateSlots')}
              </button>
              <button
                type="button"
                className="btn btn-secondary text-sm"
                onClick={() => {
                  setAudience('mentors');
                  setSubject(t('pages.admin.notifications.templateSessionSubject'));
                  setMessage(t('pages.admin.notifications.templateSessionBody'));
                }}
              >
                {t('pages.admin.notifications.templateSession')}
              </button>
            </div>
          </div>

          <FormField label={t('pages.admin.notifications.subjectOptional')}>
            <input
              type="text"
              className="input"
              placeholder={t('pages.admin.notifications.subjectPlaceholder')}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormField>

          <FormField label={t('pages.admin.notifications.message')} required>
            <textarea
              className="input min-h-[120px]"
              placeholder={t('pages.admin.notifications.messagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </FormField>
          <FormActions>
            <button type="submit" className="btn btn-primary w-full" disabled={sending}>
              {sending ? t('pages.admin.notifications.sending') : t('pages.admin.notifications.send')}
            </button>
          </FormActions>
        </form>

        <div className="space-y-4">
          <button
            type="button"
            className="card p-4 w-full flex items-center justify-between text-left"
            onClick={() => setTipsOpen((o) => !o)}
          >
            <span className="text-sm font-medium text-primary">
              {t('pages.admin.notifications.aboutCollapsed')}
            </span>
            {tipsOpen ? (
              <HiOutlineChevronUp className="h-4 w-4 text-muted" />
            ) : (
              <HiOutlineChevronDown className="h-4 w-4 text-muted" />
            )}
          </button>
          {tipsOpen && (
            <DetailCard title={t('pages.admin.notifications.aboutTitle')}>
              <InfoRow
                icon={<HiOutlineUsers className="h-5 w-5" />}
                title={t('pages.admin.notifications.aboutWhenTitle')}
                text={t('pages.admin.notifications.aboutWhen')}
              />
              <InfoRow
                icon={<HiOutlineEnvelope className="h-5 w-5" />}
                title={t('pages.admin.notifications.aboutAudienceTitle')}
                text={t('pages.admin.notifications.aboutAudienceSimple')}
              />
              <InfoRow
                icon={<HiOutlineBellAlert className="h-5 w-5" />}
                title={t('pages.admin.notifications.aboutInAppTitle')}
                text={t('pages.admin.notifications.aboutInAppSimple')}
              />
            </DetailCard>
          )}
        </div>
      </div>

      <DetailCard title={t('pages.admin.notifications.historyTitle')}>
        {historyLoading ? (
          <Skeleton count={3} />
        ) : broadcasts.length === 0 ? (
          <EmptyState
            title={t('pages.admin.notifications.historyEmpty')}
            description={t('pages.admin.notifications.aboutWhen')}
          />
        ) : (
          <div className="crm-table-wrap -mx-2">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>{t('pages.admin.notifications.colWhen')}</th>
                  <th>{t('pages.admin.notifications.colAudience')}</th>
                  <th>{t('pages.admin.notifications.colSubject')}</th>
                  <th>{t('pages.admin.notifications.colPreview')}</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((b) => (
                  <tr key={b._id}>
                    <td className="text-muted whitespace-nowrap text-xs">
                      {b.createdAt ? formatDateTime(b.createdAt) : '—'}
                    </td>
                    <td>
                      <span className="badge-pill badge-neutral">{audienceShort(b.userId)}</span>
                    </td>
                    <td className="font-medium text-primary max-w-[10rem] truncate">{b.title}</td>
                    <td className="text-secondary max-w-[16rem] truncate">{b.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailCard>
    </PageShell>
  );
};

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
      <span className="icon-chip shrink-0">{icon}</span>
      <div>
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        <p className="text-sm text-secondary mt-0.5">{text}</p>
      </div>
    </div>
  );
}

export default AdminNotificationPage;
