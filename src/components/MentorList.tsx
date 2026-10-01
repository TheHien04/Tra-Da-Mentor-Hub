import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineTrash } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { useMentorDirectory } from '../hooks/queries/useMentors';
import { useAuth } from '../context/AuthContext';
import { getTrackOptions } from '../lib/trackOptions';
import { resolveAssetUrl } from '../lib/assetUrl';
import { Alert } from './ui/Alert';
import Avatar from './Avatar';
import Badge from './Badge';
import TrackBadge from './TrackBadge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass, SkillTags } from './ui';
import { EditorialBanner } from './motion/EditorialBanner';

const MentorList = () => {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const isAdmin = state.user?.role === 'admin';
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const trackOptions = getTrackOptions(t, true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ active: true, full: false });
  const [advancedFilters, setAdvancedFilters] = useState({
    track: '',
    mentorshipType: '',
    duration: '',
    expertise: '',
  });
  const capacity =
    filters.active && filters.full ? undefined : filters.active ? 'active' : filters.full ? 'full' : 'none';
  const { data, isLoading: loading, isError, error: queryError } = useMentorDirectory({
    q: searchQuery || undefined,
    page,
    limit: 12,
    track: advancedFilters.track || undefined,
    mentorshipType: advancedFilters.mentorshipType || undefined,
    duration: advancedFilters.duration || undefined,
    expertise: advancedFilters.expertise || undefined,
    capacity,
  });
  const mentors = data?.data ?? [];
  const total = data?.total ?? 0;
  const error = isError ? getApiErrorMessage(queryError) : null;
  const filteredMentors = mentors;

  const getStatusBadge = (mentor: { mentees?: string[]; maxMentees?: number }) => {
    const menteeCount = mentor.mentees?.length || 0;
    const maxMentees = mentor.maxMentees || 10;
    const isFull = menteeCount >= maxMentees;
    if (isFull) {
      return (
        <Badge
          status="full"
          label={t('lists.statusFull', { count: menteeCount, max: maxMentees })}
        />
      );
    }
    return (
      <Badge
        status="active"
        label={t('lists.statusActive', { count: menteeCount, max: maxMentees })}
      />
    );
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: t('common.delete'),
      message: t('lists.confirmDelete', { name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await mentorApi.delete(id);
      void queryClient.invalidateQueries({ queryKey: ['mentors'] });
    } catch {
      toast.error(t('lists.deleteMentorFailed'));
    }
  };

  const clearFilters = () =>
    setAdvancedFilters({ track: '', mentorshipType: '', duration: '', expertise: '' });

  return (
    <PageShell>
      <PageHeader
        title={t('mentor.title')}
        description={t('lists.mentorsShown', {
          shown: filteredMentors.length,
          total,
        })}
        icon={<HiOutlineAcademicCap className="h-7 w-7" />}
        action={isAdmin ? { label: `+ ${t('mentor.addMentor')}`, href: '/mentors/add' } : undefined}
      />
      <EditorialBanner
        image="/media/circle-session.jpg"
        kicker={t('lists.mentorLeadKicker')}
        title={t('lists.mentorLead')}
        body={t('lists.mentorLeadBody')}
      />

      <SearchFilter
        onSearch={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        onFilter={(f) => {
          setFilters(f as typeof filters);
          setPage(1);
        }}
        filterOptions={[
          { label: t('lists.filterActive'), value: 'active', checked: true },
          { label: t('lists.filterFull'), value: 'full', checked: false },
        ]}
        placeholder={t('lists.searchMentors')}
      />

      <FilterPanel onClear={clearFilters}>
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label={t('lists.filterMentorshipType')}>
          <select
            className={filterSelectClass}
            value={advancedFilters.mentorshipType}
            onChange={(e) =>
              setAdvancedFilters({ ...advancedFilters, mentorshipType: e.target.value })
            }
          >
            <option value="">{t('lists.allTypes')}</option>
            <option value="GROUP">{t('lists.typeGroup')}</option>
            <option value="ONE_ON_ONE">{t('lists.typeOneOnOne')}</option>
          </select>
        </FilterField>
        <FilterField label={t('lists.filterDuration')}>
          <select
            className={filterSelectClass}
            value={advancedFilters.duration}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, duration: e.target.value })}
          >
            <option value="">{t('lists.allDurations')}</option>
            <option value="LONG_TERM">{t('lists.durationLong')}</option>
            <option value="SHORT_TERM">{t('lists.durationShort')}</option>
          </select>
        </FilterField>
        <FilterField label={t('lists.filterExpertise')}>
          <input
            type="text"
            className={filterSelectClass}
            placeholder={t('lists.expertisePlaceholder')}
            value={advancedFilters.expertise}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, expertise: e.target.value })}
          />
        </FilterField>
      </FilterPanel>

      {error && (
        <Alert variant="error" title={t('common.loadError')} className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <Skeleton count={3} />
            </div>
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <EmptyState
          title={t('lists.emptyMentorsTitle')}
          description={
            searchQuery
              ? t('lists.emptyMentorsSearch')
              : isAdmin
                ? t('lists.emptyMentorsDefault')
                : t('lists.emptyMentorsBrowse')
          }
          actionLabel={isAdmin ? `+ ${t('mentor.addMentor')}` : undefined}
          actionHref={isAdmin ? '/mentors/add' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredMentors.map((mentor) => (
            <article key={mentor._id} className="card card-hover people-card p-5 flex flex-col">
              <div className="people-card__header mb-4">
                <Avatar
                  name={mentor.name}
                  size="lg"
                  track={mentor.track}
                  url={resolveAssetUrl(mentor.avatarUrl)}
                />
                <div className="people-card__identity">
                  <div className="people-card__title-row">
                    <h3 className="people-card__name">{mentor.name}</h3>
                    {mentor.track && <TrackBadge track={mentor.track} size="small" />}
                  </div>
                  <p className="people-card__meta">{mentor.email}</p>
                  {mentor.phone && <p className="people-card__submeta">{mentor.phone}</p>}
                </div>
              </div>

              <div className="mb-4">{getStatusBadge(mentor)}</div>

              <div className="people-metrics">
                <div className="people-metrics__item">
                  <span className="people-metrics__value">{mentor.mentees?.length || 0}</span>
                  <span className="people-metrics__label">{t('nav.mentees')}</span>
                </div>
                <div className="people-metrics__divider" aria-hidden />
                <div className="people-metrics__item">
                  <span className="people-metrics__value">{mentor.maxMentees || 10}</span>
                  <span className="people-metrics__label">{t('group.capacity')}</span>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-sm text-secondary line-clamp-2 mb-4 mt-4">{mentor.bio}</p>
              )}

              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="mb-4">
                  <SkillTags skills={mentor.expertise} />
                </div>
              )}

              <div className="people-card__footer">
                <Link to={`/mentors/${mentor._id}`} className="btn btn-primary flex-1">
                  {t('mentor.viewDetails')}
                </Link>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-ghost-danger px-3"
                    onClick={() => handleDelete(mentor._id, mentor.name)}
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

export default MentorList;
