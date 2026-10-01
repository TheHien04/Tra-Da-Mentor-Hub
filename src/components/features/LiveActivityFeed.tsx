import { Link } from 'react-router-dom';
import { HiOutlineBolt } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useActivities } from '../../hooks/queries/useActivities';
import Skeleton from '../Skeleton';
import { Alert } from '../ui';

const ACTIVITY_KEYS: Record<string, { key: string; href: string }> = {
  mentor_created_group: { key: 'dashboard.activityGroupCreated', href: '/groups' },
  mentee_joined_group: { key: 'dashboard.activityJoinedGroup', href: '/groups' },
  mentee_progress_updated: { key: 'dashboard.activityProgress', href: '/mentees' },
  mentor_assigned: { key: 'dashboard.activityAssigned', href: '/mentees' },
  group_meeting_scheduled: { key: 'dashboard.activityMeeting', href: '/schedule' },
  mentor_created: { key: 'dashboard.activityMentorJoined', href: '/mentors' },
  mentee_created: { key: 'dashboard.activityMenteeJoined', href: '/mentees' },
};

export function LiveActivityFeed({ limit = 6 }: { limit?: number }) {
  const { t, formatDate } = useAppTranslation();
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
          {items.map((a) => {
            const known = a.type ? ACTIVITY_KEYS[a.type] : undefined;
            const name = a.actor?.name || t('dashboard.liveActivityFallback');
            const text = known
              ? t(known.key, { name, target: a.target || '' })
              : a.message || a.description || t('dashboard.liveActivityFallback');
            const when = a.createdAt || a.timestamp;
            const body = (
              <>
                <p className="text-primary font-medium">{text}</p>
                {when && (
                  <p className="text-[10px] text-muted mt-1">
                    {formatDate(String(when), { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </>
            );
            return (
              <li key={a._id} className="list-row text-sm">
                {known ? (
                  <Link to={known.href} className="block no-underline">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
