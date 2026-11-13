import {
  HiOutlineBellAlert,
  HiOutlineCalendar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCreditCard,
  HiOutlineEnvelope,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import type { AdminIntegrations } from '../../services/api';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import Skeleton from '../Skeleton';

type IntegrationDefinition = {
  id: string;
  icon: typeof HiOutlineBellAlert;
  labelKey: string;
  descKey: string;
  ready: (integrations?: AdminIntegrations) => boolean;
  partial?: (integrations?: AdminIntegrations) => boolean;
  demoCapable?: boolean;
};

const notificationChannels: IntegrationDefinition[] = [
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
    ready: (item) => Boolean(item?.email),
    demoCapable: true,
  },
  {
    id: 'zalo',
    icon: HiOutlineChatBubbleLeftRight,
    labelKey: 'pages.admin.notifications.channelZaloLabel',
    descKey: 'pages.admin.notifications.channelZaloDesc',
    ready: (item) => Boolean(item?.zalo),
    partial: (item) => Boolean(item?.zaloToken) && !item?.zalo,
    demoCapable: true,
  },
];

const platformServices: IntegrationDefinition[] = [
  {
    id: 'googleCalendar',
    icon: HiOutlineCalendar,
    labelKey: 'pages.admin.notifications.serviceGoogleCalendar',
    descKey: 'pages.admin.notifications.serviceGoogleCalendarDesc',
    ready: (item) => Boolean(item?.googleCalendar),
    demoCapable: true,
  },
  {
    id: 'openai',
    icon: HiOutlineSparkles,
    labelKey: 'pages.admin.notifications.serviceOpenai',
    descKey: 'pages.admin.notifications.serviceOpenaiDesc',
    ready: (item) => Boolean(item?.openai),
    demoCapable: true,
  },
  {
    id: 'stripe',
    icon: HiOutlineCreditCard,
    labelKey: 'pages.admin.notifications.serviceStripe',
    descKey: 'pages.admin.notifications.serviceStripeDesc',
    ready: (item) => Boolean(item?.stripe),
    demoCapable: true,
  },
];

function IntegrationTile({
  definition,
  integrations,
}: {
  definition: IntegrationDefinition;
  integrations?: AdminIntegrations;
}) {
  const { t } = useAppTranslation();
  const { icon: Icon, labelKey, descKey, ready, partial, demoCapable } = definition;
  const isReady = ready(integrations);
  const isPartial = !isReady && partial?.(integrations);
  const isDemo = !isReady && !isPartial && Boolean(integrations?.demo && demoCapable);
  const status = isReady ? 'ready' : isPartial ? 'partial' : isDemo ? 'demo' : 'off';
  const badgeClass = status === 'ready' ? 'badge-success' : status === 'partial' || status === 'demo' ? 'badge-warning' : 'badge-neutral';
  const statusLabel = t(`pages.admin.notifications.status${status === 'ready' ? 'Ready' : status === 'partial' ? 'Partial' : status === 'demo' ? 'Demo' : 'Off'}`);

  return (
    <div className={`admin-integration-tile admin-integration-tile--${status}`}>
      <div className="flex items-start gap-2 mb-2">
        <Icon className="h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} />
        <p className="admin-integration-tile__label !mb-0">{t(labelKey)}</p>
      </div>
      <span className={`badge-pill ${badgeClass}`}>{statusLabel}</span>
      <p className="text-xs text-muted mt-2 leading-relaxed">{t(descKey)}</p>
    </div>
  );
}

export function AdminIntegrationStatus({
  integrations,
  loading,
}: {
  integrations?: AdminIntegrations;
  loading: boolean;
}) {
  const { t } = useAppTranslation();

  return (
    <section aria-labelledby="admin-integrations-title">
      <h2 id="admin-integrations-title" className="text-sm font-semibold text-primary mb-3">
        {t('pages.admin.notifications.integrationsTitle')}
      </h2>
      {integrations?.demo && (
        <p className="text-sm text-secondary mb-4">{t('pages.admin.notifications.demoNote')}</p>
      )}
      {loading ? (
        <div className="mb-6"><Skeleton count={3} /></div>
      ) : (
        <>
          <div className="admin-integration-grid admin-integration-grid--channels mb-6">
            {notificationChannels.map((definition) => (
              <IntegrationTile key={definition.id} definition={definition} integrations={integrations} />
            ))}
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
            {t('pages.admin.notifications.platformServicesTitle')}
          </h3>
          <div className="admin-integration-grid mb-8">
            {platformServices.map((definition) => (
              <IntegrationTile key={definition.id} definition={definition} integrations={integrations} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
