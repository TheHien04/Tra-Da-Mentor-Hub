import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
import { adminApi } from '../services/api';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { PageShell, PageHeader, Alert } from '../components/ui';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useQuery } from '@tanstack/react-query';

type AuditRow = {
  _id: string;
  at: string;
  action: string;
  entity: string;
  entityId: string | null;
  actorRole: string | null;
  summary?: string | null;
};

const FILTERS = [
  { id: 'all', labelKey: 'pages.audit.filterAll' },
  { id: 'invites', labelKey: 'pages.audit.filterInvites' },
  { id: 'session-logs', labelKey: 'pages.audit.filterSessions' },
  { id: 'testimonials', labelKey: 'pages.audit.filterTestimonials' },
] as const;

function actionLabel(action: string, t: (key: string) => string) {
  const known: Record<string, string> = {
    'invites.post': 'pages.audit.inviteCreated',
    'session-logs.post': 'pages.audit.sessionLogged',
    'testimonials.post': 'pages.audit.testimonialAdded',
    'admin.post': 'pages.audit.notificationSent',
  };
  return known[action] ? t(known[action]) : action.replace(/\./g, ' · ');
}

function recordHref(row: AuditRow) {
  if (row.entity === 'invites') return '/admin/invite';
  if (row.entity === 'session-logs') return '/session-logs';
  if (row.entity === 'testimonials') return '/testimonials';
  if (row.entity === 'admin') return '/admin/notifications';
  if (row.entity === 'slots') return '/slots';
  if (row.entity === 'mentees' && row.entityId) return `/mentees/${row.entityId}`;
  if (row.entity === 'mentors' && row.entityId) return `/mentors/${row.entityId}`;
  if (row.entity === 'groups' && row.entityId) return `/groups/${row.entityId}`;
  return null;
}

export default function AdminAuditPage() {
  const { t, formatDateTime } = useAppTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: async () => {
      const res = await adminApi.audit();
      return res.data.data as AuditRow[];
    },
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      if (filter !== 'all' && row.entity !== filter) return false;
      if (!q) return true;
      const haystack = [row.summary, row.action, row.entity, row.entityId, row.actorRole]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, filter, query]);

  return (
    <PageShell>
      <PageHeader
        title={t('pages.audit.title')}
        description={t('pages.audit.description')}
        icon={<HiOutlineClipboardDocumentCheck className="h-7 w-7" />}
      />
      {isError && (
        <Alert variant="error" title={t('common.loadError')} className="mb-4">
          {t('pages.audit.loadFailed')}
        </Alert>
      )}
      {isLoading ? (
        <Skeleton count={6} />
      ) : data.length === 0 ? (
        <EmptyState
          title={t('pages.audit.emptyTitle')}
          description={t('pages.audit.emptyBody')}
          actionLabel={t('pages.audit.emptyAction')}
          actionHref="/admin/invite"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? 'btn btn-primary text-sm' : 'btn btn-secondary text-sm'}
                  onClick={() => setFilter(item.id)}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
            <input
              className="input sm:max-w-xs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('pages.audit.search')}
              aria-label={t('pages.audit.search')}
            />
          </div>
          {rows.length === 0 ? (
            <EmptyState title={t('pages.audit.noMatchTitle')} description={t('pages.audit.noMatchBody')} />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--border-default)' }}>
                    <th className="px-4 py-3 font-medium">{t('pages.audit.when')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.audit.action')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.audit.summary')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.audit.actor')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const href = recordHref(row);
                    return (
                      <tr
                        key={row._id}
                        className="border-b"
                        style={{ borderColor: 'var(--border-default)', cursor: href ? 'pointer' : undefined }}
                        onClick={() => {
                          if (href) navigate(href);
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.at)}</td>
                        <td className="px-4 py-3 font-medium text-primary">{actionLabel(row.action, t)}</td>
                        <td className="px-4 py-3 text-secondary">
                          {href ? (
                            <a
                              href={href}
                              className="underline-offset-2 hover:underline"
                              onClick={(event) => {
                                event.preventDefault();
                                navigate(href);
                              }}
                            >
                              {row.summary || row.entityId || row.entity}
                            </a>
                          ) : (
                            row.summary || row.entityId || row.entity
                          )}
                        </td>
                        <td className="px-4 py-3 text-secondary">{row.actorRole || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
