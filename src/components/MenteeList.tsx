/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { menteeApi } from '../services/api';
import { HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineTrash } from 'react-icons/hi2';
import Avatar from './Avatar';
import TrackBadge from './TrackBadge';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass, SkillTags } from './ui';
import { Alert } from './ui/Alert';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';

interface Mentee {
  _id: string;
  name: string;
  email: string;
  school?: string;
  track?: string;
  interests?: string[];
  progress: number;
}

const MenteeList = () => {
  const { t } = useAppTranslation();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ 'just-started': true, 'in-progress': true, completed: true });
  const [advancedFilters, setAdvancedFilters] = useState({
    track: '',
    school: '',
    progressMin: '',
    progressMax: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await menteeApi.getAll();
        setMentees(unwrapList<Mentee>(res));
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await menteeApi.delete(id);
      setMentees((prev) => prev.filter((m) => m._id !== id));
      setSuccessMessage(`${name} removed`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const filteredMentees = useMemo(() => {
    return mentees.filter((mentee) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        mentee.name.toLowerCase().includes(q) ||
        mentee.email.toLowerCase().includes(q) ||
        mentee.school?.toLowerCase().includes(q) ||
        mentee.interests?.some((i) => i.toLowerCase().includes(q));

      let matchesStatus = false;
      if (mentee.progress === 0 && filters['just-started']) matchesStatus = true;
      if (mentee.progress > 0 && mentee.progress < 100 && filters['in-progress']) matchesStatus = true;
      if (mentee.progress === 100 && filters.completed) matchesStatus = true;

      if (advancedFilters.track && mentee.track !== advancedFilters.track) return false;
      if (advancedFilters.school && !mentee.school?.toLowerCase().includes(advancedFilters.school.toLowerCase()))
        return false;
      if (advancedFilters.progressMin !== '' && mentee.progress < parseInt(advancedFilters.progressMin, 10))
        return false;
      if (advancedFilters.progressMax !== '' && mentee.progress > parseInt(advancedFilters.progressMax, 10))
        return false;

      return matchesSearch && matchesStatus;
    });
  }, [mentees, searchQuery, filters, advancedFilters]);

  const progressLabel = (p: number) => {
    if (p === 100) return 'Completed';
    if (p > 0) return 'In progress';
    return 'Just started';
  };

  const progressBarColor = (p: number) => {
    if (p === 100) return '#10b981';
    if (p > 0) return 'var(--accent)';
    return 'var(--text-muted)';
  };

  const completed = mentees.filter((m) => m.progress === 100).length;

  return (
    <PageShell>
      <PageHeader
        title={t('mentee.title')}
        description={`${filteredMentees.length} shown · ${mentees.length} total · ${completed} completed`}
        icon={<HiOutlineUserGroup className="h-7 w-7" />}
        action={{ label: `+ ${t('mentee.addMentee')}`, href: '/mentees/add' }}
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
        setSearchQuery={setSearchQuery}
        filters={filters as any}
        setFilters={(f) => setFilters(f as any)}
        filterOptions={[
          { label: 'Just started', value: 'just-started', checked: true },
          { label: 'In progress', value: 'in-progress', checked: true },
          { label: 'Completed', value: 'completed', checked: true },
        ]}
        placeholder={t('lists.searchMentees')}
      />

      <FilterPanel
        onClear={() => setAdvancedFilters({ track: '', school: '', progressMin: '', progressMax: '' })}
      >
        <FilterField label="Track">
          <select
            className={filterSelectClass}
            value={advancedFilters.track}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, track: e.target.value })}
          >
            <option value="">All</option>
            <option value="tech">Technology</option>
            <option value="business">Business</option>
            <option value="design">Design</option>
          </select>
        </FilterField>
        <FilterField label="School">
          <input
            className={filterSelectClass}
            placeholder={t('lists.filterSchool')}
            value={advancedFilters.school}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, school: e.target.value })}
          />
        </FilterField>
        <FilterField label="Progress min %">
          <input
            type="number"
            min={0}
            max={100}
            className={filterSelectClass}
            value={advancedFilters.progressMin}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, progressMin: e.target.value })}
          />
        </FilterField>
        <FilterField label="Progress max %">
          <input
            type="number"
            min={0}
            max={100}
            className={filterSelectClass}
            value={advancedFilters.progressMax}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, progressMax: e.target.value })}
          />
        </FilterField>
      </FilterPanel>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMentees.map((mentee) => (
            <article key={mentee._id} className="card card-hover p-5 flex flex-col">
              <div className="flex gap-4 mb-4">
                <Avatar name={mentee.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-primary">{mentee.name}</h3>
                    {mentee.track && <TrackBadge track={mentee.track as any} size="small" />}
                  </div>
                  <p className="text-sm text-muted truncate">{mentee.email}</p>
                  {mentee.school && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{mentee.school}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Link
                    to={`/mentees/${mentee._id}`}
                    className="btn btn-secondary text-xs py-1.5 px-2.5 inline-flex items-center gap-1"
                  >
                    View <HiOutlineArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger text-xs py-1.5 px-2.5 inline-flex items-center gap-1"
                    onClick={() => handleDelete(mentee._id, mentee.name)}
                  >
                    <HiOutlineTrash className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {mentee.interests && mentee.interests.length > 0 && (
                <div className="mb-4">
                  <SkillTags skills={mentee.interests} />
                </div>
              )}

              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted">{progressLabel(mentee.progress)}</span>
                  <span className="font-medium text-secondary tabular-nums">{mentee.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${mentee.progress}%`,
                      backgroundColor: progressBarColor(mentee.progress),
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted mt-2">ID: {mentee._id}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default MenteeList;
