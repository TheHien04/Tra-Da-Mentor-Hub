import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi2';
import { groupApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import { ProfileHero } from './ui';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { useAuth } from '../context/AuthContext';

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
  mentorId?: string;
  mentor?: { _id?: string; name: string; email?: string };
  mentees?: Mentee[];
  maxSize?: number;
  meetingSchedule?: { frequency: string; dayOfWeek: string; time: string };
}

function readGroupDetail(data: unknown): Group | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  if (typeof row._id !== 'string' || typeof row.name !== 'string') return null;
  const mentor = row.mentor && typeof row.mentor === 'object'
    ? {
        _id: typeof (row.mentor as { _id?: unknown })._id === 'string' ? (row.mentor as { _id: string })._id : undefined,
        name: typeof (row.mentor as { name?: unknown }).name === 'string' ? (row.mentor as { name: string }).name : '',
        email: typeof (row.mentor as { email?: unknown }).email === 'string' ? (row.mentor as { email: string }).email : undefined,
      }
    : undefined;
  const mentees = Array.isArray(row.mentees)
    ? row.mentees.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mentee = item as Record<string, unknown>;
        if (typeof mentee._id !== 'string' || typeof mentee.name !== 'string') return [];
        return [{
          _id: mentee._id,
          name: mentee.name,
          email: typeof mentee.email === 'string' ? mentee.email : undefined,
          progress: typeof mentee.progress === 'number' ? mentee.progress : undefined,
        }];
      })
    : [];
  const schedule = row.meetingSchedule && typeof row.meetingSchedule === 'object'
    ? row.meetingSchedule as Group['meetingSchedule']
    : undefined;
  return {
    _id: row._id,
    name: row.name,
    description: typeof row.description === 'string' ? row.description : undefined,
    mentorId: typeof row.mentorId === 'string' ? row.mentorId : mentor?._id,
    mentor,
    mentees,
    maxSize: typeof row.maxSize === 'number' ? row.maxSize : undefined,
    meetingSchedule: schedule,
  };
}

const GroupDetail = () => {
  const { t } = useAppTranslation();
  const { confirm } = useConfirm();
  const { state } = useAuth();
  const role = state.user?.role;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    groupApi
      .getByIdFull(id)
      .then((res) => setGroup(readGroupDetail(res.data)))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!group) return;
    const ok = await confirm({
      title: t('common.delete'),
      message: t('detail.deleteConfirm', { name: group.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
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
  const pct = Math.min(100, (count / max) * 100);

  const hero = group ? (
    <ProfileHero name={group.name} subtitle={group.description} avatarSize="lg">
      <span className="badge-pill badge-accent inline-flex items-center gap-1.5">
        <HiOutlineUsers className="h-3.5 w-3.5" />
        {t('detail.menteesSlot', { count, max })}
      </span>
      <p className="text-sm text-secondary mt-3">{scheduleText}</p>
      <div className="analytics-load-bar mt-4 max-w-md">
        <div
          className={`analytics-load-bar__fill ${pct >= 100 ? 'analytics-load-bar__fill--full' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </ProfileHero>
  ) : null;

  return (
    <DetailShell
      backHref="/groups"
      backLabel={t('group.title')}
      title={group?.name || t('common.group')}
      hero={hero}
      loading={loading}
      error={error}
      notFound={!loading && !group}
      actions={
        group && (role === 'admin' || (role === 'mentor' && state.user?.mentorId === group.mentorId)) ? (
          <>
            <Link to={`/groups/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            {role === 'admin' && (
              <button type="button" className="btn btn-ghost-danger" onClick={handleDelete} aria-label={t('common.delete')}>
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            )}
          </>
        ) : null
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
            </DetailGrid>
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
