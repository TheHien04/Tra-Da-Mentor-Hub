import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { groupApi } from '../services/api';
import { HiOutlineUsers } from 'react-icons/hi2';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass } from './ui';
import { Alert } from './ui/Alert';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';

interface Group {
  _id: string;
  name: string;
  description?: string;
  mentor?: { name: string };
  mentees?: string[];
  maxSize?: number;
  frequency?: string;
  dayOfWeek?: string;
  time?: string;
  meetingSchedule?: { frequency: string; dayOfWeek: string; time: string };
}

const GroupList = () => {
  const { t } = useAppTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({ frequency: '', mentorName: '' });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await groupApi.getAll();
        setGroups(unwrapList<Group>(res));
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        group.name.toLowerCase().includes(q) ||
        group.description?.toLowerCase().includes(q) ||
        group.mentor?.name.toLowerCase().includes(q);
      if (advancedFilters.frequency) {
        const freq = group.frequency || group.meetingSchedule?.frequency;
        if (freq !== advancedFilters.frequency) return false;
      }
      if (
        advancedFilters.mentorName &&
        !group.mentor?.name.toLowerCase().includes(advancedFilters.mentorName.toLowerCase())
      )
        return false;
      return matchesSearch;
    });
  }, [groups, searchQuery, advancedFilters]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete group ${name}?`)) return;
    try {
      await groupApi.delete(id);
      setGroups((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('group.title')}
        description={`${filteredGroups.length} groups`}
        icon={<HiOutlineUsers className="h-7 w-7" />}
        action={{ label: `+ ${t('group.addGroup')}`, href: '/groups/add' }}
      />

      {error && (
        <Alert variant="error" title={t('common.loadError')} className="mb-4">
          {error}
        </Alert>
      )}

      <SearchFilter onSearch={setSearchQuery} placeholder={t('lists.searchGroups')} />

      <FilterPanel onClear={() => setAdvancedFilters({ frequency: '', mentorName: '' })}>
        <FilterField label={t('lists.filterFrequency')}>
          <select
            className={filterSelectClass}
            value={advancedFilters.frequency}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, frequency: e.target.value })}
          >
            <option value="">{t('lists.allFrequencies')}</option>
            <option value="Weekly">{t('lists.freqWeekly')}</option>
            <option value="Bi-weekly">{t('lists.freqBiweekly')}</option>
            <option value="Monthly">{t('lists.freqMonthly')}</option>
          </select>
        </FilterField>
        <FilterField label={t('lists.filterMentor')}>
          <input
            className={filterSelectClass}
            placeholder={t('lists.mentorNamePlaceholder')}
            value={advancedFilters.mentorName}
            onChange={(e) => setAdvancedFilters({ ...advancedFilters, mentorName: e.target.value })}
          />
        </FilterField>
      </FilterPanel>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <Skeleton count={3} />
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          title={t('lists.emptyGroupsTitle')}
          description={t('lists.emptyGroupsDefault')}
          actionLabel={`+ ${t('group.addGroup')}`}
          actionHref="/groups/add"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGroups.map((group) => {
            const count = group.mentees?.length || 0;
            const max = group.maxSize || 10;
            const pct = Math.min(100, (count / max) * 100);
            const schedule = group.meetingSchedule;
            const freq = group.frequency || schedule?.frequency;
            const when = schedule
              ? `${schedule.frequency} · ${schedule.dayOfWeek} ${schedule.time}`
              : [freq, group.dayOfWeek, group.time].filter(Boolean).join(' · ');

            return (
              <article
                key={group._id}
                className="card card-hover p-5 flex flex-col border-l-4 border-l-brand-500"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-base font-semibold text-primary">{group.name}</h3>
                  <span className="badge-pill badge-accent shrink-0">
                    {count}/{max} mentees
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-secondary mb-3 line-clamp-2">{group.description}</p>
                )}
                {group.mentor?.name && (
                  <p className="text-xs text-muted mb-1">Mentor: {group.mentor.name}</p>
                )}
                {when && <p className="text-xs text-muted mb-3">{when}</p>}
                <div className="h-1.5 rounded-full surface-muted mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link to={`/groups/${group._id}`} className="btn btn-secondary flex-1">
                    {t('group.viewDetails')}
                  </Link>
                  <button type="button" className="btn btn-danger flex-1" onClick={() => handleDelete(group._id, group.name)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default GroupList;
