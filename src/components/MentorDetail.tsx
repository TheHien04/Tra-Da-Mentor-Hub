import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { HiOutlineTrash } from 'react-icons/hi2';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import TrackBadge from './TrackBadge';
import { SkillTags, ProfileHero } from './ui';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import Badge from './Badge';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { useMentor } from '../hooks/queries/useMentor';
import { queryKeys } from '../hooks/queries/keys';

const MentorDetail = () => {
  const { t } = useAppTranslation();
  const { confirm } = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: mentor, isLoading: loading, isError, error: queryError } = useMentor(id);
  const error = isError ? getApiErrorMessage(queryError) : null;

  const handleDelete = async () => {
    if (!mentor) return;
    const ok = await confirm({
      title: t('common.delete'),
      message: t('detail.deleteConfirm', { name: mentor.name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await mentorApi.delete(id!);
      void queryClient.invalidateQueries({ queryKey: queryKeys.mentors });
      toast.success(t('messages.deleteSuccess'));
      navigate('/mentors');
    } catch {
      toast.error(t('detail.deleteFailed'));
    }
  };

  const menteeCount = mentor?.mentees?.length || 0;
  const maxMentees = mentor?.maxMentees || 10;
  const isFull = menteeCount >= maxMentees;
  const pct = Math.min(100, (menteeCount / maxMentees) * 100);

  const hero = mentor ? (
    <ProfileHero
      name={mentor.name}
      track={mentor.track}
      subtitle={mentor.email}
      avatarUrl={mentor.avatarUrl}
      badges={
        <>
          {mentor.track && <TrackBadge track={mentor.track as never} size="small" />}
          <Badge
            status={isFull ? 'full' : 'active'}
            label={
              isFull
                ? `${t('detail.full')} (${menteeCount}/${maxMentees})`
                : `${t('detail.active')} (${menteeCount}/${maxMentees})`
            }
          />
        </>
      }
    >
      {mentor.expertise && mentor.expertise.length > 0 && <SkillTags skills={mentor.expertise} max={12} />}
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
      backHref="/mentors"
      backLabel={t('mentor.title')}
      title={mentor?.name || t('roles.mentor')}
      hero={hero}
      loading={loading}
      error={error}
      notFound={!loading && !mentor}
      actions={
        mentor && (
          <>
            <Link to={`/mentors/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            <button type="button" className="btn btn-ghost-danger" onClick={handleDelete} aria-label={t('common.delete')}>
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </>
        )
      }
    >
      {mentor && (
        <>
          <DetailCard title={t('detail.profile')}>
            <DetailGrid>
              <DetailItem label={t('auth.email')}>{mentor.email}</DetailItem>
              <DetailItem label={t('detail.phone')}>{mentor.phone || t('detail.notAvailable')}</DetailItem>
              <DetailItem label={t('detail.mentorshipType')}>
                {mentor.mentorshipType || t('detail.notAvailable')}
              </DetailItem>
              <DetailItem label={t('detail.duration')}>{mentor.duration || t('detail.notAvailable')}</DetailItem>
              <DetailItem label={t('detail.capacity')}>
                {t('detail.menteesSlot', { count: menteeCount, max: maxMentees })}
              </DetailItem>
            </DetailGrid>
          </DetailCard>

          {mentor.bio && (
            <DetailCard title={t('detail.bio')}>
              <p className="text-sm text-secondary leading-relaxed">{mentor.bio}</p>
            </DetailCard>
          )}
        </>
      )}
    </DetailShell>
  );
};

export default MentorDetail;
