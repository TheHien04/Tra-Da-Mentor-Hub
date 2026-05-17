import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { menteeApi, mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { toast } from 'react-toastify';
import Avatar from './Avatar';
import TrackBadge from './TrackBadge';
import { SkillTags } from './ui';
import { DetailShell, DetailCard, DetailGrid, DetailItem } from './ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Mentee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  progress?: number;
  school?: string;
  track?: string;
  interests?: string[];
  mentorId?: string;
  groupId?: string;
}

interface Mentor {
  _id: string;
  name: string;
}

const MenteeDetail = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    menteeApi
      .getById(id)
      .then(async (res) => {
        const data = res.data;
        setMentee(data);
        const mentorId = data.mentorId || data.mentor;
        if (typeof mentorId === 'string') {
          try {
            const mRes = await mentorApi.getById(mentorId);
            setMentor(mRes.data);
          } catch {
            setMentor(null);
          }
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!mentee || !window.confirm(t('detail.deleteConfirm', { name: mentee.name }))) return;
    try {
      await menteeApi.delete(id!);
      toast.success(t('messages.deleteSuccess'));
      navigate('/mentees');
    } catch {
      toast.error(t('detail.deleteFailed'));
    }
  };

  const progress = mentee?.progress ?? 0;

  return (
    <DetailShell
      backHref="/mentees"
      backLabel={t('mentee.title')}
      title={mentee?.name || t('roles.mentee')}
      subtitle={mentee?.school}
      loading={loading}
      error={error}
      notFound={!loading && !mentee}
      actions={
        mentee && (
          <>
            <Link to={`/mentees/${id}/edit`} className="btn btn-primary">
              {t('common.edit')}
            </Link>
            <button type="button" className="btn btn-secondary text-red-600" onClick={handleDelete}>
              {t('common.delete')}
            </button>
          </>
        )
      }
    >
      {mentee && (
        <>
          <DetailCard>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar name={mentee.name} size="lg" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {mentee.track && <TrackBadge track={mentee.track as never} size="small" />}
                  <span className="badge-pill badge-accent">
                    {t('detail.progressPercent', { progress })}
                  </span>
                </div>
                {mentee.interests && mentee.interests.length > 0 && (
                  <SkillTags skills={mentee.interests} />
                )}
                <div className="mt-4 h-2 rounded-full surface-muted overflow-hidden max-w-md">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            </div>
          </DetailCard>

          <DetailCard title={t('detail.contactAssignment')}>
            <DetailGrid>
              <DetailItem label={t('auth.email')}>{mentee.email}</DetailItem>
              <DetailItem label={t('detail.phone')}>{mentee.phone || t('detail.notAvailable')}</DetailItem>
              <DetailItem label={t('detail.school')}>{mentee.school || t('detail.notAvailable')}</DetailItem>
              <DetailItem label={t('roles.mentor')}>
                {mentor ? (
                  <Link to={`/mentors/${mentor._id}`} style={{ color: 'var(--accent)' }}>
                    {mentor.name}
                  </Link>
                ) : (
                  t('detail.notAvailable')
                )}
              </DetailItem>
            </DetailGrid>
          </DetailCard>
        </>
      )}
    </DetailShell>
  );
};

export default MenteeDetail;
