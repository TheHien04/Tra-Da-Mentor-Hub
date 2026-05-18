import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { HiOutlineTrash } from 'react-icons/hi2';
import { menteeApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import TrackBadge from './TrackBadge';
import { SkillTags, ProfileHero } from './ui';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { useMentee } from '../hooks/queries/useMentee';
import { useMentor } from '../hooks/queries/useMentor';
import { queryKeys } from '../hooks/queries/keys';

const MenteeDetail = () => {
  const { t } = useAppTranslation();
  const { confirm } = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: mentee, isLoading: loading, isError, error: queryError } = useMentee(id);
  const error = isError ? getApiErrorMessage(queryError) : null;

  const mentorId =
    typeof mentee?.mentorId === 'string'
      ? mentee.mentorId
      : typeof mentee?.mentor === 'string'
        ? mentee.mentor
        : undefined;
  const { data: mentor } = useMentor(mentorId);

  const handleDelete = async () => {
    if (!mentee) return;
    const ok = await confirm({
      title: t('common.delete'),
      message: t('detail.deleteConfirm', { name: mentee.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await menteeApi.delete(id!);
      void queryClient.invalidateQueries({ queryKey: queryKeys.mentees });
      toast.success(t('messages.deleteSuccess'));
      navigate('/mentees');
    } catch {
      toast.error(t('detail.deleteFailed'));
    }
  };

  const progress = mentee?.progress ?? 0;
  const progressFillClass =
    progress === 100
      ? 'progress-track__fill progress-track__fill--complete'
      : progress > 0
        ? 'progress-track__fill'
        : 'progress-track__fill progress-track__fill--idle';

  const hero = mentee ? (
    <ProfileHero
      name={mentee.name}
      track={mentee.track}
      subtitle={mentee.school || mentee.email}
      avatarUrl={mentee.avatarUrl}
      badges={
        <>
          {mentee.track && <TrackBadge track={mentee.track as never} size="small" />}
          <span className="badge-pill badge-accent">{t('detail.progressPercent', { progress })}</span>
        </>
      }
    >
      {mentee.interests && mentee.interests.length > 0 && <SkillTags skills={mentee.interests} />}
      <div className="progress-track mt-4 max-w-md">
        <div className={progressFillClass} style={{ width: `${progress}%` }} />
      </div>
    </ProfileHero>
  ) : null;

  return (
    <DetailShell
      backHref="/mentees"
      backLabel={t('mentee.title')}
      title={mentee?.name || t('roles.mentee')}
      hero={hero}
      loading={loading}
      error={error}
      notFound={!loading && !mentee}
      actions={
        mentee && (
          <>
            <Link to={`/mentees/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            <button type="button" className="btn btn-ghost-danger" onClick={handleDelete} aria-label={t('common.delete')}>
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </>
        )
      }
    >
      {mentee && (
        <DetailCard title={t('detail.contactAssignment')}>
          <DetailGrid>
            <DetailItem label={t('auth.email')}>{mentee.email}</DetailItem>
            <DetailItem label={t('detail.phone')}>{mentee.phone || t('detail.notAvailable')}</DetailItem>
            <DetailItem label={t('detail.assignedMentor')}>
              {mentor ? (
                <Link to={`/mentors/${mentor._id}`} style={{ color: 'var(--accent)' }}>
                  {mentor.name}
                </Link>
              ) : (
                t('detail.notAssigned')
              )}
            </DetailItem>
          </DetailGrid>
        </DetailCard>
      )}
    </DetailShell>
  );
};

export default MenteeDetail;
