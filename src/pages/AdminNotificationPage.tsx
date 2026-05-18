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
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineCreditCard,
} from 'react-icons/hi2';
import type { AdminIntegrations } from '../services/api';
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

type Audience = 'mentors' | 'mentees' | 'all';

type ChannelId = 'inApp' | 'email' | 'zalo';
type PlatformId = 'googleCalendar' | 'openai' | 'stripe';

const NOTIFICATION_CHANNELS: {
  id: ChannelId;
  icon: typeof HiOutlineBellAlert;
  labelKey: string;
  descKey: string;
  ready: (i?: AdminIntegrations) => boolean;
  partial?: (i?: AdminIntegrations) => boolean;
}[] = [
  {
    id: 'inApp',
    icon: HiOutlineBellAlert,
    labelKey: 'pages.admin.notifications.channelInApp',
    descKey: 'pages.admin.notifications.channelInAppDesc',
    ready: () => true,
  },
  {
    id: 'email',
    icon: HiOutlineEnvelope,
    labelKey: 'pages.admin.notifications.channelEmailLabel',
    descKey: 'pages.admin.notifications.channelEmailDesc',
    ready: (i) => Boolean(i?.email),
  },
  {
    id: 'zalo',
    icon: HiOutlineChatBubbleLeftRight,
    labelKey: 'pages.admin.notifications.channelZaloLabel',
    descKey: 'pages.admin.notifications.channelZaloDesc',
    ready: (i) => Boolean(i?.zalo),
    partial: (i) => Boolean(i?.zaloToken) && !i?.zalo,
  },
];

const PLATFORM_SERVICES: {
  id: PlatformId;
  icon: typeof HiOutlineCalendar;
  labelKey: string;
  descKey: string;
  ready: (i?: AdminIntegrations) => boolean;
}[] = [
  {
    id: 'googleCalendar',
    icon: HiOutlineCalendar,
    labelKey: 'pages.admin.notifications.serviceGoogleCalendar',
    descKey: 'pages.admin.notifications.serviceGoogleCalendarDesc',
    ready: (i) => Boolean(i?.googleCalendar),
  },
  {
    id: 'openai',
    icon: HiOutlineSparkles,
    labelKey: 'pages.admin.notifications.serviceOpenai',
    descKey: 'pages.admin.notifications.serviceOpenaiDesc',
    ready: (i) => Boolean(i?.openai),
  },
  {
    id: 'stripe',
    icon: HiOutlineCreditCard,
    labelKey: 'pages.admin.notifications.serviceStripe',
    descKey: 'pages.admin.notifications.serviceStripeDesc',
    ready: (i) => Boolean(i?.stripe),
  },
];

function IntegrationTile({
  icon: Icon,
  label,
  description,
  status,
  statusLabel,
}: {
  icon: typeof HiOutlineBellAlert;
  label: string;
  description: string;
  status: 'ready' | 'partial' | 'off';
  statusLabel: string;
}) {
  const badgeClass =
    status === 'ready' ? 'badge-success' : status === 'partial' ? 'badge-warning' : 'badge-neutral';
  return (
    <div className={`admin-integration-tile admin-integration-tile--${status}`}>
      <div className="flex items-start gap-2 mb-2">
        <Icon className="h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} />
        <p className="admin-integration-tile__label !mb-0">{label}</p>
      </div>
      <span className={`badge-pill ${badgeClass}`}>{statusLabel}</span>
      <p className="text-xs text-muted mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

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

  const extraChannelsAvailable = Boolean(integrations?.email || integrations?.zalo);

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

    const sendChannel =
      channel === 'email' && !integrations?.email
        ? 'in_app'
        : channel === 'zalo' && !integrations?.zalo
          ? 'in_app'
          : channel === 'email_zalo' && !integrations?.email && !integrations?.zalo
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

      <h2 className="text-sm font-semibold text-primary mb-3">
        {t('pages.admin.notifications.integrationsTitle')}
      </h2>
      {integrationsLoading ? (
        <div className="mb-6">
          <Skeleton count={3} />
        </div>
      ) : (
        <>
          <div className="admin-integration-grid admin-integration-grid--channels mb-6">
            {NOTIFICATION_CHANNELS.map(({ id, icon, labelKey, descKey, ready, partial }) => {
              const isReady = ready(integrations);
              const isPartial = !isReady && partial?.(integrations);
              const status = isReady ? 'ready' : isPartial ? 'partial' : 'off';
              const statusLabel = isReady
                ? t('pages.admin.notifications.statusReady')
                : isPartial
                  ? t('pages.admin.notifications.statusPartial')
                  : t('pages.admin.notifications.statusOff');
              return (
                <IntegrationTile
                  key={id}
                  icon={icon}
                  label={t(labelKey)}
                  description={t(descKey)}
                  status={status}
                  statusLabel={statusLabel}
                />
              );
            })}
          </div>

          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
            {t('pages.admin.notifications.platformServicesTitle')}
          </h3>
          <div className="admin-integration-grid mb-8">
            {PLATFORM_SERVICES.map(({ id, icon, labelKey, descKey, ready }) => {
              const isReady = ready(integrations);
              return (
                <IntegrationTile
                  key={id}
                  icon={icon}
                  label={t(labelKey)}
                  description={t(descKey)}
                  status={isReady ? 'ready' : 'off'}
                  statusLabel={
                    isReady
                      ? t('pages.admin.notifications.statusReady')
                      : t('pages.admin.notifications.statusOff')
                  }
                />
              );
            })}
          </div>
        </>
      )}

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
                {integrations?.email && (
                  <option value="email">{t('pages.admin.notifications.sendChannelEmail')}</option>
                )}
                {integrations?.zalo && (
                  <option value="zalo">{t('pages.admin.notifications.sendChannelZalo')}</option>
                )}
                {integrations?.email && integrations?.zalo && (
                  <option value="email_zalo">{t('pages.admin.notifications.sendChannelEmailZalo')}</option>
                )}
              </select>
            </FormField>
          )}

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
