import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineTrash, HiOutlineCalendarDays, HiOutlineAcademicCap } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { groupApi } from '../services/api';
import { useGroups } from '../hooks/queries/useGroups';
import { queryKeys } from '../hooks/queries/keys';
import { toast } from 'react-toastify';
import SearchFilter from './SearchFilter';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { PageShell, PageHeader, FilterPanel, FilterField, filterSelectClass } from './ui';
import { Alert } from './ui/Alert';
import { getApiErrorMessage } from '../lib/apiHelpers';

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
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const { data: groups = [], isLoading: loading, isError, error: queryError } = useGroups();
  const error = isError ? getApiErrorMessage(queryError) : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({ frequency: '', mentorName: '' });

  const filteredGroups = useMemo(() => {
    return (groups as Group[]).filter((group) => {
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
    const ok = await confirm({
      title: t('common.delete'),
      message: t('lists.confirmDeleteGroup', { name }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await groupApi.delete(id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('group.title')}
        description={t('lists.groupsShown', {
          shown: filteredGroups.length,
          total: groups.length,
        })}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <article key={group._id} className="card card-hover people-card p-5 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="people-card__name text-lg">{group.name}</h3>
                  <span className="badge-pill badge-accent shrink-0">
                    {t('lists.groupCapacity', { count, max })}
                  </span>
                </div>

                {group.description && (
                  <p className="text-sm text-secondary mb-3 line-clamp-2">{group.description}</p>
                )}

                {group.mentor?.name && (
                  <p className="schedule-meta-item mb-2">
                    <HiOutlineAcademicCap className="h-4 w-4 text-muted shrink-0" />
                    {group.mentor.name}
                  </p>
                )}
                {when && (
                  <p className="schedule-meta-item mb-4">
                    <HiOutlineCalendarDays className="h-4 w-4 text-muted shrink-0" />
                    {when}
                  </p>
                )}

                <div className="analytics-load-bar mb-4">
                  <div
                    className={`analytics-load-bar__fill ${pct >= 100 ? 'analytics-load-bar__fill--full' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="people-card__footer">
                  <Link to={`/groups/${group._id}`} className="btn btn-primary flex-1">
                    {t('group.viewDetails')}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost-danger px-3"
                    onClick={() => handleDelete(group._id, group.name)}
                    aria-label={t('common.delete')}
                  >
                    <HiOutlineTrash className="h-4 w-4" />
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
