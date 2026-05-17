import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import Avatar from './Avatar';
import TrackBadge from './TrackBadge';
import { SkillTags } from './ui';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import Badge from './Badge';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  track?: string;
  expertise?: string[];
  mentees?: string[];
  maxMentees?: number;
  bio?: string;
  mentorshipType?: string;
  duration?: string;
}

const MentorDetail = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    mentorApi
      .getById(id)
      .then((res) => {
        setMentor(res.data);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!mentor || !window.confirm(t('detail.deleteConfirm', { name: mentor.name }))) return;
    try {
      await mentorApi.delete(id!);
      toast.success(t('messages.deleteSuccess'));
      navigate('/mentors');
    } catch {
      toast.error(t('detail.deleteFailed'));
    }
  };

  const menteeCount = mentor?.mentees?.length || 0;
  const maxMentees = mentor?.maxMentees || 10;
  const isFull = menteeCount >= maxMentees;

  return (
    <DetailShell
      backHref="/mentors"
      backLabel={t('mentor.title')}
      title={mentor?.name || t('roles.mentor')}
      subtitle={mentor?.email}
      loading={loading}
      error={error}
      notFound={!loading && !mentor}
      actions={
        mentor && (
          <>
            <Link to={`/mentors/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            <button type="button" className="btn btn-secondary text-red-600" onClick={handleDelete}>
              {t('common.delete')}
            </button>
          </>
        )
      }
    >
      {mentor && (
        <>
          <DetailCard>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar name={mentor.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {mentor.track && <TrackBadge track={mentor.track as never} size="small" />}
                  <Badge
                    status={isFull ? 'full' : 'active'}
                    label={
                      isFull
                        ? `${t('detail.full')} (${menteeCount}/${maxMentees})`
                        : `${t('detail.active')} (${menteeCount}/${maxMentees})`
                    }
                  />
                </div>
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <SkillTags skills={mentor.expertise} max={12} />
                )}
              </div>
            </div>
          </DetailCard>

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
