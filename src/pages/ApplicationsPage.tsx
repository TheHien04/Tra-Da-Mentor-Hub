import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menteeApi } from '../services/api';
import { HiOutlineDocumentText, HiOutlineArrowRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, FilterChips } from '../components/ui';
import EmptyState from '../components/EmptyState';
import { SkillTags } from '../components/ui';
import Avatar from '../components/Avatar';
import TrackBadge from '../components/TrackBadge';
import Skeleton from '../components/Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

type ApplicationStatus = 'pending' | 'invited_for_interview' | 'interviewed' | 'accepted' | 'rejected';

interface MenteeWithStatus {
  _id: string;
  name?: string;
  email?: string;
  school?: string;
  track?: string;
  interests?: string[];
  applicationStatus?: ApplicationStatus;
}

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  pending: 'badge-neutral',
  invited_for_interview: 'badge-accent',
  interviewed: 'badge-accent',
  accepted: 'badge-success',
  rejected: 'badge-full',
};

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  pending: 'invited_for_interview',
  invited_for_interview: 'interviewed',
  interviewed: 'accepted',
};

const ApplicationsPage = () => {
  const { t } = useAppTranslation();
  const statusLabel = (s: ApplicationStatus) => {
    const map: Record<ApplicationStatus, string> = {
      pending: t('pages.applications.statusPending'),
      invited_for_interview: t('pages.applications.statusInvited'),
      interviewed: t('pages.applications.statusInterviewed'),
      accepted: t('common.accepted'),
      rejected: t('common.rejected'),
    };
    return map[s];
  };
  const [mentees, setMentees] = useState<MenteeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');

  useEffect(() => {
    menteeApi
      .getAll()
      .then((res) => {
        const payload = res.data;
        const data = Array.isArray(payload) ? payload : payload.data;
        const withStatus: MenteeWithStatus[] = Array.isArray(data)
          ? data.map((m) => ({
              _id: m._id || '',
              name: m.name || m.email?.split('@')[0] || m._id || '',
              email: m.email,
              school: m.school,
              track: m.track,
              interests: m.interests,
              applicationStatus: (m.applicationStatus || 'pending') as ApplicationStatus,
            }))
          : [];
        setMentees(withStatus);
      })
      .catch(() => setMentees([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filterStatus === 'ALL' ? mentees : mentees.filter((m) => m.applicationStatus === filterStatus);

  const handleStatusChange = async (menteeId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(menteeId);
    try {
      await menteeApi.updateApplicationStatus(menteeId, newStatus);
      const message = t('pages.applications.statusUpdated', { status: statusLabel(newStatus) });
      toast.success(message);
      setMentees((prev) =>
        prev.map((m) => (m._id === menteeId ? { ...m, applicationStatus: newStatus } : m))
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('pages.applications.updateFailed'));
    } finally {
      setUpdatingId(null);
    }
  };

  const nextActionLabel = (status: ApplicationStatus) => {
    if (status === 'pending') return t('pages.applications.invite');
    if (status === 'invited_for_interview') return t('pages.applications.markInterviewed');
    return t('pages.applications.accept');
  };

  const filterOptions = [
    { value: 'ALL' as const, label: t('pages.applications.allCount', { count: mentees.length }) },
    ...(['pending', 'invited_for_interview', 'interviewed', 'accepted', 'rejected'] as ApplicationStatus[]).map(
      (s) => ({ value: s, label: statusLabel(s) })
    ),
  ];

  return (
    <PageShell>
      <PageHeader
        title={t('pages.applications.title')}
        description={t('pages.applications.description')}
        icon={<HiOutlineDocumentText className="h-7 w-7" />}
        action={{ label: t('pages.applications.openSlots'), href: '/slots' }}
      />

      <div className="mb-6 overflow-x-auto">
        <FilterChips
          options={filterOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          ariaLabel={t('pages.applications.filterLabel')}
        />
      </div>

      {loading ? (
        <Skeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('pages.applications.emptyTitle')}
          description={t('pages.applications.emptyDesc')}
          actionLabel={t('pages.applications.openSlots')}
          actionHref="/slots"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((m) => (
            <article key={m._id} className="card card-hover people-card p-5 flex flex-col">
              <div className="people-card__header mb-4">
                <Avatar name={m.name || ''} size="lg" track={m.track} />
                <div className="people-card__identity">
                  <div className="people-card__title-row">
                    <h3 className="people-card__name">{m.name}</h3>
                    <span className={`badge-pill shrink-0 ${STATUS_CLASS[m.applicationStatus!]}`}>
                      {statusLabel(m.applicationStatus!)}
                    </span>
                    {m.track && <TrackBadge track={m.track} size="small" />}
                  </div>
                  <p className="people-card__meta">{m.email}</p>
                  {m.school && <p className="people-card__submeta">{m.school}</p>}
                </div>
              </div>

              {m.interests && m.interests.length > 0 && (
                <div className="mb-4">
                  <SkillTags skills={m.interests} max={4} />
                </div>
              )}

              <div className="people-card__footer flex-wrap">
                <Link
                  to={`/mentees/${m._id}`}
                  className="btn btn-secondary text-sm inline-flex items-center gap-1"
                >
                  {t('pages.applications.view')}
                  <HiOutlineArrowRight className="h-3.5 w-3.5" />
                </Link>
                {NEXT_STATUS[m.applicationStatus!] && (
                  <button
                    type="button"
                    className="btn btn-primary text-sm"
                    disabled={updatingId === m._id}
                    aria-busy={updatingId === m._id}
                    onClick={() =>
                      handleStatusChange(m._id, NEXT_STATUS[m.applicationStatus!]!)
                    }
                  >
                    {updatingId === m._id
                      ? t('pages.applications.updating')
                      : nextActionLabel(m.applicationStatus!)}
                  </button>
                )}
                {['pending', 'invited_for_interview', 'interviewed'].includes(m.applicationStatus!) && (
                    <button
                      type="button"
                      className="btn btn-ghost-danger text-sm"
                      disabled={updatingId === m._id}
                      onClick={() => handleStatusChange(m._id, 'rejected')}
                    >
                      {t('pages.applications.reject')}
                    </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default ApplicationsPage;
