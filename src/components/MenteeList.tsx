import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineTrash } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { menteeApi } from '../services/api';
import { useMenteeDirectory } from '../hooks/queries/useMentees';
import { progressQuery } from '../lib/directoryFilters';
import { queryKeys } from '../hooks/queries/keys';
import { getTrackOptions } from '../lib/trackOptions';
import { resolveAssetUrl } from '../lib/assetUrl';
import { toast } from 'react-toastify';
import Avatar from './Avatar';
import TrackBadge from './TrackBadge';
import SearchFilter, { type FilterState } from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass, SkillTags } from './ui';
import { Alert } from './ui/Alert';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { EditorialBanner } from './motion/EditorialBanner';

interface Mentee {
  _id: string;
  name: string;
  email: string;
  school?: string;
  track?: string;
  interests?: string[];
  progress: number;
  avatarUrl?: string;
}

const MenteeList = () => {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const isAdmin = state.user?.role === 'admin';
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const trackOptions = getTrackOptions(t, true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ 'just-started': true, 'in-progress': true, completed: true });
  const [advancedFilters, setAdvancedFilters] = useState({
    track: '',
    school: '',
    progressMin: '',
    progressMax: '',
  });
  const { data, isLoading: loading, isError, error: queryError } = useMenteeDirectory({
    q: searchQuery || undefined,
    page,
    limit: 12,
    track: advancedFilters.track || undefined,
    school: advancedFilters.school || undefined,
    progressMin: advancedFilters.progressMin || undefined,
    progressMax: advancedFilters.progressMax || undefined,
    progress: progressQuery(filters),
  });
  const mentees = data?.data ?? [];
  const total = data?.total ?? 0;
  const error = isError ? getApiErrorMessage(queryError) : null;
  const [successMessage, setSuccessMessage] = useState('');

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: t('common.delete'),
      message: t('lists.confirmDelete', { name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await menteeApi.delete(id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.mentees });
      setSuccessMessage(t('lists.deleteSuccess', { name }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const filteredMentees = mentees;

  const progressLabel = (p: number) => {
    if (p === 100) return t('lists.progressCompleted');
    if (p > 0) return t('lists.progressInProgress');
    return t('lists.progressJustStarted');
  };

  const progressFillClass = (p: number) => {
    if (p === 100) return 'progress-track__fill progress-track__fill--complete';
    if (p > 0) return 'progress-track__fill';
    return 'progress-track__fill progress-track__fill--idle';
  };

  return (
    <PageShell>
      <PageHeader
        title={t('mentee.title')}
        description={t('lists.directoryPage', {
          shown: filteredMentees.length,
          total,
        })}
        icon={<HiOutlineUserGroup className="h-7 w-7" />}
        action={isAdmin ? { label: `+ ${t('mentee.addMentee')}`, href: '/mentees/add' } : undefined}
      />
      <EditorialBanner
        image="/media/hero-session.jpg"
        kicker={t('lists.menteeLeadKicker')}
        title={t('lists.menteeLead')}
        body={t('lists.menteeLeadBody')}
      />

      {successMessage && (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="error" title={t('common.loadError')} className="mb-4">
          {error}
        </Alert>
      )}

      <SearchFilter
        searchQuery={searchQuery}
        setSearchQuery={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        filters={filters}
        setFilters={(next) => {
          setFilters(next);
          setPage(1);
        }}
        filterOptions={[
          { label: t('lists.progressJustStarted'), value: 'just-started', checked: true },
          { label: t('lists.progressInProgress'), value: 'in-progress', checked: true },
          { label: t('lists.progressCompleted'), value: 'completed', checked: true },
        ]}
        placeholder={t('lists.searchMentees')}
      />

      <FilterPanel
        onClear={() => {
          setAdvancedFilters({ track: '', school: '', progressMin: '', progressMax: '' });
          setPage(1);
        }}
      >
        <FilterField label={t('lists.filterTrack')}>
          <select
            className={filterSelectClass}
            value={advancedFilters.track}
            onChange={(e) => {
              setAdvancedFilters({ ...advancedFilters, track: e.target.value });
              setPage(1);
            }}
          >
            {trackOptions.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label={t('lists.filterSchool')}>
          <input
            className={filterSelectClass}
            placeholder={t('lists.filterSchool')}
            value={advancedFilters.school}
            onChange={(e) => {
              setAdvancedFilters({ ...advancedFilters, school: e.target.value });
              setPage(1);
            }}
          />
        </FilterField>
        <FilterField label={t('lists.progressMin')}>
          <input
            type="number"
            min={0}
            max={100}
            className={filterSelectClass}
            value={advancedFilters.progressMin}
            onChange={(e) => {
              setAdvancedFilters({ ...advancedFilters, progressMin: e.target.value });
              setPage(1);
            }}
          />
        </FilterField>
        <FilterField label={t('lists.progressMax')}>
          <input
            type="number"
            min={0}
            max={100}
            className={filterSelectClass}
            value={advancedFilters.progressMax}
            onChange={(e) => {
              setAdvancedFilters({ ...advancedFilters, progressMax: e.target.value });
              setPage(1);
            }}
          />
        </FilterField>
      </FilterPanel>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <Skeleton count={3} />
            </div>
          ))}
        </div>
      ) : filteredMentees.length === 0 ? (
        <EmptyState
          title={t('lists.emptyMenteesTitle')}
          description={t('lists.emptyMenteesSearch')}
          actionLabel={`+ ${t('mentee.addMentee')}`}
          actionHref="/mentees/add"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredMentees.map((mentee) => (
            <article key={mentee._id} className="card card-hover people-card p-5 flex flex-col">
              <div className="people-card__header mb-4">
                <Avatar
                  name={mentee.name}
                  size="lg"
                  track={mentee.track}
                  url={resolveAssetUrl((mentee as Mentee & { avatarUrl?: string }).avatarUrl)}
                />
                <div className="people-card__identity">
                  <div className="people-card__title-row">
                    <h3 className="people-card__name">{mentee.name}</h3>
                    {mentee.track && <TrackBadge track={mentee.track} size="small" />}
                  </div>
                  <p className="people-card__meta">{mentee.email}</p>
                  {mentee.school && <p className="people-card__submeta">{mentee.school}</p>}
                </div>
              </div>

              {mentee.interests && mentee.interests.length > 0 && (
                <div className="mb-4">
                  <SkillTags skills={mentee.interests} />
                </div>
              )}

              <div className="progress-block">
                <div className="progress-block__row">
                  <span className="progress-block__label">{progressLabel(mentee.progress)}</span>
                  <span className="progress-block__pct">{mentee.progress}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className={progressFillClass(mentee.progress)}
                    style={{ width: `${mentee.progress}%` }}
                  />
                </div>
              </div>

              <div className="people-card__footer">
                <Link
                  to={`/mentees/${mentee._id}`}
                  className="btn btn-primary flex-1 inline-flex items-center justify-center gap-1.5"
                >
                  {t('mentee.viewDetails')}
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
                {isAdmin && (
                <button
                  type="button"
                  className="btn btn-ghost-danger px-3"
                  onClick={() => handleDelete(mentee._id, mentee.name)}
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {total > 12 && (
        <div className="flex items-center justify-between mt-6">
          <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('common.previous')}
          </button>
          <span className="text-sm text-muted">
            {page} / {Math.ceil(total / 12)}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </PageShell>
  );
};

export default MenteeList;
