import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Mentee {
  _id: string;
  name: string;
  email?: string;
  progress?: number;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  mentor?: { _id?: string; name: string; email?: string };
  mentees?: Mentee[];
  maxSize?: number;
  meetingSchedule?: { frequency: string; dayOfWeek: string; time: string };
}

const GroupDetail = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    groupApi
      .getByIdFull(id)
      .then((res) => setGroup(res.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!group || !window.confirm(t('detail.deleteConfirm', { name: group.name }))) return;
    try {
      await groupApi.delete(id!);
      toast.success(t('messages.deleteSuccess'));
      navigate('/groups');
    } catch {
      toast.error(t('detail.deleteFailed'));
    }
  };

  const schedule = group?.meetingSchedule;
  const scheduleText = schedule
    ? `${schedule.frequency} · ${schedule.dayOfWeek} · ${schedule.time}`
    : t('detail.notAvailable');
  const menteeList = group?.mentees || [];
  const count = menteeList.length;
  const max = group?.maxSize || 10;

  return (
    <DetailShell
      backHref="/groups"
      backLabel={t('group.title')}
      title={group?.name || t('common.group')}
      subtitle={group?.description}
      loading={loading}
      error={error}
      notFound={!loading && !group}
      actions={
        group && (
          <>
            <Link to={`/groups/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            <button type="button" className="btn btn-secondary text-red-600" onClick={handleDelete}>
              {t('common.delete')}
            </button>
          </>
        )
      }
    >
      {group && (
        <>
          <DetailCard title={t('detail.overview')}>
            <DetailGrid>
              <DetailItem label={t('roles.mentor')}>
                {group.mentor?.name ? (
                  group.mentor._id ? (
                    <Link to={`/mentors/${group.mentor._id}`} style={{ color: 'var(--accent)' }}>
                      {group.mentor.name}
                    </Link>
                  ) : (
                    group.mentor.name
                  )
                ) : (
                  t('detail.notAvailable')
                )}
              </DetailItem>
              <DetailItem label={t('session.schedule')}>{scheduleText}</DetailItem>
              <DetailItem label={t('detail.capacity')}>
                <span className="badge-pill badge-accent">
                  {t('detail.menteesSlot', { count, max })}
                </span>
              </DetailItem>
            </DetailGrid>
            <div className="mt-4 h-1.5 rounded-full surface-muted overflow-hidden max-w-md">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (count / max) * 100)}%`,
                  backgroundColor: 'var(--accent)',
                }}
              />
            </div>
          </DetailCard>

          <DetailCard title={t('detail.menteesTitle', { count })}>
            {menteeList.length === 0 ? (
              <p className="text-sm text-muted">{t('detail.noMenteesInGroup')}</p>
            ) : (
              <ul className="space-y-2">
                {menteeList.map((m) => (
                  <li key={m._id} className="list-row flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{m.name}</p>
                      {m.email && <p className="text-xs text-muted">{m.email}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {m.progress != null && (
                        <span className="text-xs text-muted tabular-nums">
                          {t('detail.progressPercent', { progress: m.progress })}
                        </span>
                      )}
                      <Link
                        to={`/mentees/${m._id}`}
                        className="text-xs font-medium"
                        style={{ color: 'var(--accent)' }}
                      >
                        {t('detail.view')}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </>
      )}
    </DetailShell>
  );
};

export default GroupDetail;
