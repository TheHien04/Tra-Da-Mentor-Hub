import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineArrowRight, HiOutlineLightBulb } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useMatchSuggestions, useMatchExplain } from '../../hooks/queries/useMatching';
import type { MatchSuggestion } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiHelpers';
import { skillLabel } from '../../lib/skillLabel';
import { Alert } from '../ui/Alert';
import { LaunchBadge } from '../ui/LaunchBadge';
import Skeleton from '../Skeleton';

function formatMatchReason(
  match: MatchSuggestion,
  t: (key: string, options?: Record<string, unknown>) => string,
  lang: string
) {
  const reason = match.reasonCodes?.[0];
  if (!reason) return match.reasons[0];
  if (reason.code === 'skills') {
    return t('dashboard.matchReasonSkills', {
      skills: (reason.skills || []).map((skill) => skillLabel(skill, lang)).join(', '),
    });
  }
  if (reason.code === 'track') return t('dashboard.matchReasonTrack');
  if (reason.code === 'capacity') return t('dashboard.matchReasonCapacity');
  return t('dashboard.matchReasonProfile');
}

interface SmartMatchPanelProps {
  menteeId?: string;
  mentorId?: string;
  compact?: boolean;
}

export function SmartMatchPanel({ menteeId, mentorId, compact }: SmartMatchPanelProps) {
  const { t, lang } = useAppTranslation();
  const [explainPair, setExplainPair] = useState<{ mentorId: string; menteeId: string } | null>(
    null
  );

  const { data: matches = [], isLoading, error } = useMatchSuggestions({
    menteeId,
    mentorId,
    limit: compact ? 2 : 8,
  });

  const explainQuery = useMatchExplain(
    explainPair?.mentorId,
    explainPair?.menteeId,
    Boolean(explainPair),
    lang
  );
  const explained = explainPair
    ? matches.find((item) => item.mentorId === explainPair.mentorId && item.menteeId === explainPair.menteeId)
    : undefined;

  return (
    <section className={`card p-6${compact ? ' h-full' : ''}`}>
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

      {isLoading && <Skeleton count={3} />}
      {error && (
        <Alert variant="error" className="mb-3">
          {getApiErrorMessage(error)}
        </Alert>
      )}

      {!isLoading && !error && matches.length === 0 && (
        <p className="text-sm text-muted">{t('dashboard.smartMatchNoMatches')}</p>
      )}

      {explainPair && (
        <div className="mb-4 p-4 rounded-lg border text-sm" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-inset)' }}>
          <p className="font-medium text-primary mb-2 flex items-center gap-2">
            <HiOutlineLightBulb className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            {t('dashboard.smartMatchAiInsight')}
            {explainQuery.data?.source === 'openai' && (
              <span className="badge-pill badge-accent text-[10px]">AI</span>
            )}
          </p>
          {explained?.factors && (
            <div className="grid gap-2 mb-3">
              {(
                [
                  ['skills', explained.factors.skills, 'dashboard.matchFactorSkills'],
                  ['track', explained.factors.track, 'dashboard.matchFactorTrack'],
                  ['capacity', explained.factors.capacity, 'dashboard.matchFactorCapacity'],
                ] as const
              ).map(([key, value, label]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{t(label)}</span>
                    <span className="tabular-nums">{value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface-muted)' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: 'var(--accent)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {explainQuery.isLoading ? (
            <p className="text-muted">{t('common.loading')}</p>
          ) : (
            <p className="text-secondary leading-relaxed">{explainQuery.data?.explanation}</p>
          )}
          <button
            type="button"
            className="mt-2 text-xs font-medium"
            style={{ color: 'var(--accent)' }}
            onClick={() => setExplainPair(null)}
          >
            {t('common.close')}
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {matches.map((m: MatchSuggestion) => (
          <li key={`${m.mentorId}-${m.menteeId}`} className="list-row">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">
                  {menteeId ? m.mentorName : mentorId ? m.menteeName : `${m.mentorName} ↔ ${m.menteeName}`}
                </p>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">{formatMatchReason(m, t, lang)}</p>
                {m.matchedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.matchedSkills.slice(0, 3).map((s: string) => (
                      <span key={s} className="badge-pill badge-accent text-[10px]">
                        {skillLabel(s, lang)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {m.score}%
                </span>
                <p className="text-[10px] text-muted">{t('dashboard.matchScore')}</p>
                <p className="text-[10px] text-muted">
                  {t('dashboard.smartMatchCapacity', {
                    active: m.capacity.active,
                    max: m.capacity.max,
                  })}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to={menteeId ? `/mentors/${m.mentorId}` : `/mentees/${m.menteeId}`}
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                {t('dashboard.smartMatchViewProfile')} <HiOutlineArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--accent)' }}
                onClick={() =>
                  setExplainPair({ mentorId: m.mentorId, menteeId: m.menteeId })
                }
              >
                <HiOutlineLightBulb className="h-3 w-3" />
                {t('dashboard.smartMatchExplain')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
