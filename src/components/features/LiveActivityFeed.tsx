import { HiOutlineBolt } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useActivities } from '../../hooks/queries/useActivities';
import Skeleton from '../Skeleton';
import { Alert } from '../ui';

export function LiveActivityFeed({ limit = 6 }: { limit?: number }) {
  const { t, formatDateTime } = useAppTranslation();
  const { data: items = [], isLoading, isError, refetch } = useActivities(limit);

  return (
    <section className="card p-6">
      <h2 className="text-base font-semibold text-primary flex items-center gap-2 mb-4">
        <HiOutlineBolt className="h-5 w-5 text-muted" />
        {t('dashboard.liveActivity')}
      </h2>
      {isError ? (
        <Alert variant="error">
          <p className="text-sm">{t('common.loadError')}</p>
          <button type="button" className="btn btn-secondary text-sm mt-2" onClick={() => void refetch()}>
            {t('common.retry')}
          </button>
        </Alert>
      ) : isLoading ? (
        <Skeleton count={4} />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">{t('dashboard.liveActivityEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a._id} className="list-row text-sm">
              <p className="text-primary font-medium">
                {a.message || a.type || t('dashboard.liveActivityFallback')}
              </p>
              {a.description && <p className="text-xs text-muted mt-0.5">{a.description}</p>}
              {(a.createdAt || a.timestamp) && (
                <p className="text-[10px] text-muted mt-1">
                  {formatDateTime(String(a.createdAt || a.timestamp))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
