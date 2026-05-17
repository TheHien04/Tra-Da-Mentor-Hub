/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { mentorApi } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';
import { Alert } from './ui/Alert';
import { HiOutlineAcademicCap } from 'react-icons/hi2';
import Avatar from './Avatar';
import Badge from './Badge';
import TrackBadge from './TrackBadge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass, SkillTags } from './ui';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  track?: string;
  expertise?: string[];
  mentees: string[];
  maxMentees?: number;
  bio?: string;
  mentorshipType?: string;
  duration?: string;
}

const TRACK_OPTIONS = [
  { value: '', label: 'All fields' },
  { value: 'tech', label: 'Technology' },
  { value: 'economics', label: 'Economics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'sales', label: 'Sales' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'startup', label: 'Startup' },
  { value: 'design', label: 'Design' },
];

const MentorList = () => {
  const { t } = useAppTranslation();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ active: true, full: false });
  const [advancedFilters, setAdvancedFilters] = useState({
    track: '',
    mentorshipType: '',
    duration: '',
    expertise: '',
  });

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await mentorApi.getAll();
        setMentors(unwrapList<Mentor>(response));
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const isFull = (mentor.mentees?.length || 0) >= (mentor.maxMentees || 10);
      const matchesFilter = (filters.active && !isFull) || (filters.full && isFull);

      if (advancedFilters.track && mentor.track !== advancedFilters.track) return false;
      if (advancedFilters.mentorshipType && mentor.mentorshipType !== advancedFilters.mentorshipType)
        return false;
      if (advancedFilters.duration && mentor.duration !== advancedFilters.duration) return false;
      if (
        advancedFilters.expertise &&
        (!mentor.expertise ||
          !mentor.expertise.some((e) =>
            e.toLowerCase().includes(advancedFilters.expertise.toLowerCase())
          ))
      )
        return false;

      return matchesSearch && matchesFilter;
    });
  }, [mentors, searchQuery, filters, advancedFilters]);

  const getStatusBadge = (mentor: Mentor) => {
    const menteeCount = mentor.mentees?.length || 0;
    const maxMentees = mentor.maxMentees || 10;
    const isFull = menteeCount >= maxMentees;
    if (isFull) return <Badge status="full" label={`Full (${menteeCount}/${maxMentees})`} />;
    return <Badge status="active" label={`Active (${menteeCount}/${maxMentees})`} />;
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await mentorApi.delete(id);
      setMentors((prev) => prev.filter((m) => m._id !== id));
    } catch {
      setError('Failed to delete mentor');
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
          total: mentors.length,
        })}
        icon={<HiOutlineAcademicCap className="h-7 w-7" />}
        action={{ label: `+ ${t('mentor.addMentor')}`, href: '/mentors/add' }}
      />

      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={(f) => setFilters(f as typeof filters)}
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
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, track: e.target.value })}
          >
            {TRACK_OPTIONS.map((o) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            searchQuery ? t('lists.emptyMentorsSearch') : t('lists.emptyMentorsDefault')
          }
          actionLabel={`+ ${t('mentor.addMentor')}`}
          actionHref="/mentors/add"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMentors.map((mentor) => (
            <article key={mentor._id} className="card card-hover p-5 flex flex-col">
              <div className="flex gap-4 mb-4">
                <Avatar name={mentor.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-primary truncate">
                      {mentor.name}
                    </h3>
                    {mentor.track && <TrackBadge track={mentor.track as any} size="small" />}
                  </div>
                  <p className="text-sm text-muted truncate">{mentor.email}</p>
                </div>
              </div>
              <div className="mb-3">{getStatusBadge(mentor)}</div>
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg surface-muted">
                <div className="text-center">
                  <p className="text-xl font-semibold tabular-nums text-primary">
                    {mentor.mentees?.length || 0}
                  </p>
                  <p className="text-xs text-muted">Mentees</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold tabular-nums text-primary">
                    {mentor.maxMentees || 10}
                  </p>
                  <p className="text-xs text-muted">Capacity</p>
                </div>
              </div>
              {mentor.bio && (
                <p className="text-sm text-secondary line-clamp-2 mb-3">{mentor.bio}</p>
              )}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="mb-4">
                  <SkillTags skills={mentor.expertise} />
                </div>
              )}
              {mentor.phone && (
                <p className="text-xs text-muted mb-4">{mentor.phone}</p>
              )}
              <div className="flex gap-2 mt-auto pt-2">
                <Link to={`/mentors/${mentor._id}`} className="btn btn-secondary flex-1">
                  {t('mentor.viewDetails')}
                </Link>
                <button
                  type="button"
                  className="btn btn-danger flex-1"
                  onClick={() => handleDelete(mentor._id, mentor.name)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default MentorList;
