import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
import { adminApi } from '../services/api';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { PageShell, PageHeader, Alert } from '../components/ui';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useQuery } from '@tanstack/react-query';

export default function AdminAuditPage() {
  const { t, formatDate } = useAppTranslation();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: async () => {
      const res = await adminApi.audit();
      return res.data.data;
    },
  });

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
        <EmptyState title={t('pages.audit.emptyTitle')} description={t('pages.audit.emptyBody')} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--border-default)' }}>
                <th className="px-4 py-3 font-medium">{t('pages.audit.when')}</th>
                <th className="px-4 py-3 font-medium">{t('pages.audit.action')}</th>
                <th className="px-4 py-3 font-medium">{t('pages.audit.actor')}</th>
                <th className="px-4 py-3 font-medium">{t('pages.audit.record')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row._id} className="border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.at)}</td>
                  <td className="px-4 py-3 font-medium text-primary">{row.action}</td>
                  <td className="px-4 py-3 text-secondary">{row.actorRole || '—'}</td>
                  <td className="px-4 py-3 text-secondary">{row.entityId || row.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
