import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menteeApi } from '../services/api';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from '../components/ui';
import { SkillTags } from '../components/ui';
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
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');

  useEffect(() => {
    menteeApi
      .getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const withStatus = Array.isArray(data)
          ? data.map((m: MenteeWithStatus) => ({
              ...m,
              name: m.name || m.email?.split('@')[0] || m._id,
              applicationStatus: m.applicationStatus || 'pending',
            }))
          : [];
        setMentees(withStatus);
      })
      .catch(() => setMentees([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filterStatus === '' ? mentees : mentees.filter((m) => m.applicationStatus === filterStatus);

  const handleStatusChange = async (menteeId: string, newStatus: ApplicationStatus) => {
    try {
      await menteeApi.updateApplicationStatus(menteeId, newStatus);
      toast.success(t('pages.applications.statusUpdated', { status: statusLabel(newStatus) }));
      setMentees((prev) =>
        prev.map((m) => (m._id === menteeId ? { ...m, applicationStatus: newStatus } : m))
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('pages.applications.updateFailed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.applications.title')}
        description={t('pages.applications.description')}
        icon={<HiOutlineDocumentText className="h-7 w-7" />}
        action={{ label: t('pages.applications.openSlots'), href: '/slots' }}
      />

      <div className="card p-3 mb-6 overflow-x-auto">
        <div className="flex flex-nowrap gap-2 min-w-max">
          <button
            type="button"
            className={`btn text-sm shrink-0 ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('')}
          >
            {t('pages.applications.allCount', { count: mentees.length })}
          </button>
          {(
            ['pending', 'invited_for_interview', 'interviewed', 'accepted', 'rejected'] as ApplicationStatus[]
          ).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn text-sm shrink-0 ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(s)}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton count={4} />
      ) : filtered.length === 0 ? (
        <Alert variant="info">{t('pages.applications.emptyDesc')}</Alert>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <article key={m._id} className="card card-hover p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-primary">{m.name}</h3>
                    <span className={`badge-pill ${STATUS_CLASS[m.applicationStatus!]}`}>
                      {statusLabel(m.applicationStatus!)}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{m.email}</p>
                  {m.school && <p className="text-xs text-muted mt-1">{m.school}</p>}
                  {m.interests && m.interests.length > 0 && (
                    <div className="mt-3">
                      <SkillTags skills={m.interests} max={4} />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link to={`/mentees/${m._id}`} className="btn btn-secondary text-sm">
                    {t('pages.applications.view')}
                  </Link>
                  {m.applicationStatus === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-primary text-sm"
                      onClick={() => handleStatusChange(m._id, 'invited_for_interview')}
                    >
                      {t('pages.applications.invite')}
                    </button>
                  )}
                  {['invited_for_interview', 'interviewed', 'pending'].includes(m.applicationStatus!) && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary text-sm"
                        onClick={() => handleStatusChange(m._id, 'accepted')}
                      >
                        {t('pages.applications.accept')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger text-sm"
                        onClick={() => handleStatusChange(m._id, 'rejected')}
                      >
                        {t('pages.applications.reject')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default ApplicationsPage;
