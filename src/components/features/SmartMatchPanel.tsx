import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi2';
import { matchingApi, type MatchSuggestion } from '../../services/api';
import { unwrapList, getApiErrorMessage } from '../../lib/apiHelpers';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { Alert } from '../ui/Alert';
import { LaunchBadge } from '../ui/LaunchBadge';
import Skeleton from '../Skeleton';

interface SmartMatchPanelProps {
  menteeId?: string;
  mentorId?: string;
  compact?: boolean;
}

export function SmartMatchPanel({ menteeId, mentorId, compact }: SmartMatchPanelProps) {
  const { t } = useAppTranslation();
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await matchingApi.suggestions({
          menteeId,
          mentorId,
          limit: compact ? 4 : 8,
        });
        const data = res.data?.data ?? unwrapList<MatchSuggestion>(res);
        setMatches(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e) {
        setError(getApiErrorMessage(e));
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [menteeId, mentorId, compact]);

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="icon-chip">
            <HiOutlineSparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-primary flex items-center gap-2 flex-wrap">
              {t('dashboard.smartMatchTitle')}
              <LaunchBadge variant="beta" />
            </h2>
            <p className="text-xs text-muted mt-0.5">{t('dashboard.smartMatchSubtitle')}</p>
          </div>
        </div>
        {!compact && (
          <Link to="/insights" className="text-sm font-medium shrink-0" style={{ color: 'var(--accent)' }}>
            {t('dashboard.smartMatchViewAll')}
          </Link>
        )}
      </div>

      {loading && <Skeleton count={3} />}
      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}

      {!loading && !error && matches.length === 0 && (
        <p className="text-sm text-muted">{t('dashboard.smartMatchNoMatches')}</p>
      )}

      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={`${m.mentorId}-${m.menteeId}`} className="list-row">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">
                  {menteeId ? m.mentorName : mentorId ? m.menteeName : `${m.mentorName} ↔ ${m.menteeName}`}
                </p>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">{m.reasons[0]}</p>
                {m.matchedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.matchedSkills.slice(0, 3).map((s) => (
                      <span key={s} className="badge-pill badge-accent text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {m.score}%
                </span>
                <p className="text-[10px] text-muted">
                  {t('dashboard.smartMatchCapacity', {
                    active: m.capacity.active,
                    max: m.capacity.max,
                  })}
                </p>
              </div>
            </div>
            <Link
              to={menteeId ? `/mentors/${m.mentorId}` : `/mentees/${m.menteeId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {t('dashboard.smartMatchViewProfile')} <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
