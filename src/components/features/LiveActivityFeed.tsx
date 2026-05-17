import { useEffect, useState } from 'react';
import { HiOutlineBolt } from 'react-icons/hi2';
import { activitiesApi } from '../../services/api';
import { unwrapList } from '../../lib/apiHelpers';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import Skeleton from '../Skeleton';

interface Activity {
  _id: string;
  type?: string;
  message?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string | Date;
}

export function LiveActivityFeed({ limit = 6 }: { limit?: number }) {
  const { t, formatDateTime } = useAppTranslation();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activitiesApi
      .getAll(limit)
      .then((res) => {
        const data = unwrapList<Activity>(res);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="card p-6">
      <h2 className="text-base font-semibold text-primary flex items-center gap-2 mb-4">
        <HiOutlineBolt className="h-5 w-5 text-muted" />
        {t('dashboard.liveActivity')}
      </h2>
      {loading ? (
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
