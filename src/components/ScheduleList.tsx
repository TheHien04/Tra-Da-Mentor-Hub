import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineCloudArrowUp,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, FilterChips, Alert } from './ui';
import EmptyState from './EmptyState';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import { CalendarConnectBar } from './features/CalendarConnectBar';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useMentors } from '../hooks/queries/useMentors';
import { useSlots } from '../hooks/queries/useSlots';
import { useCalendarStatus, useSyncSlotToCalendar } from '../hooks/queries/useCalendar';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../hooks/queries/keys';

interface Session {
  _id: string;
  title: string;
  mentor: { id: string; name: string };
  mentees: Array<{ id: string; name: string }>;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'ONE_ON_ONE' | 'GROUP';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  description: string;
  isOpen: boolean;
  googleCalendarEventId?: string | null;
}

const STATUS_CLASS: Record<Session['status'], string> = {
  SCHEDULED: 'badge-accent',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-full',
};

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { day: '—', month: '' };
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString(undefined, { month: 'short' }),
  };
}

const ScheduleList = () => {
  const { t } = useAppTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Session['status']>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Session['type']>('ALL');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const {
    data: slots = [],
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = useSlots();
  const {
    data: mentors = [],
    isLoading: mentorsLoading,
    isError: mentorsError,
    refetch: refetchMentors,
  } = useMentors();
  const loadError = slotsError || mentorsError;
  const { data: calendarStatus } = useCalendarStatus();
  const syncSlot = useSyncSlotToCalendar();

  useEffect(() => {
    const calendar = searchParams.get('calendar');
    if (!calendar) return;
    if (calendar === 'connected') {
      toast.success(t('pages.schedule.calendarConnected'));
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarStatus });
    } else if (calendar === 'error') {
      toast.error(t('pages.schedule.calendarError'));
    }
    const next = new URLSearchParams(searchParams);
    next.delete('calendar');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, t]);

  const sessions = useMemo<Session[]>(() => {
    const mentorName = (id: string) =>
      mentors.find((m) => m._id === id)?.name ||
      mentors.find((m) => m._id === id)?.email ||
      id;

    return slots.map((s) => {
      const booked = Boolean(s.bookedBy || s.menteeId);
      const slotDate = String(s.date || '');
      const isPast = slotDate && new Date(`${slotDate}T${s.time || '00:00'}`) < new Date();
      return {
        _id: String(s._id),
        title: t('pages.schedule.slotTitle', { mentor: mentorName(String(s.mentorId)) }),
        mentor: { id: String(s.mentorId), name: mentorName(String(s.mentorId)) },
        mentees: booked
          ? [{ id: String(s.menteeId || s.bookedBy), name: t('pages.schedule.bookedMentee') }]
          : [],
        date: slotDate,
        time: String(s.time || ''),
        duration: Number(s.duration) || 60,
        location: String(s.meetingLink || t('pages.schedule.noLink')),
        type: 'ONE_ON_ONE' as const,
        status: isPast ? 'COMPLETED' : 'SCHEDULED',
        description: booked ? t('pages.schedule.bookedDesc') : t('pages.schedule.openDesc'),
        isOpen: !booked,
        googleCalendarEventId: s.googleCalendarEventId,
      };
    });
  }, [slots, mentors, t]);

  const loading = slotsLoading || mentorsLoading;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sessions
      .filter((s) => {
        const matchQ =
          s.title.toLowerCase().includes(q) ||
          s.mentor.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
        const matchType = typeFilter === 'ALL' || s.type === typeFilter;
        return matchQ && matchStatus && matchType;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [sessions, search, statusFilter, typeFilter]);

  const upcoming = filtered.filter((s) => s.status === 'SCHEDULED' && !s.isOpen).length;
  const openSlots = filtered.filter((s) => s.isOpen).length;

  const handleSyncCalendar = async (slotId: string) => {
    if (!calendarStatus?.connected) {
      toast.info(t('pages.schedule.calendarConnectFirst'));
      return;
    }
    setSyncingId(slotId);
    try {
      const res = await syncSlot.mutateAsync(slotId);
      const meet = res.data?.meetLink;
      if (meet) toast.success(t('pages.schedule.calendarSynced'));
      else if (res.data?.alreadySynced) toast.info(t('pages.schedule.calendarAlreadySynced'));
      else toast.success(t('pages.schedule.calendarSynced'));
    } catch {
      toast.error(t('pages.schedule.calendarSyncFailed'));
    } finally {
      setSyncingId(null);
    }
  };

  const statusOptions = [
    { value: 'ALL' as const, label: t('pages.schedule.allStatus') },
    { value: 'SCHEDULED' as const, label: t('session.scheduled') },
    { value: 'COMPLETED' as const, label: t('session.completed') },
    { value: 'CANCELLED' as const, label: t('session.cancelled') },
  ];

  const typeOptions = [
    { value: 'ALL' as const, label: t('pages.schedule.allTypes') },
    { value: 'GROUP' as const, label: t('common.group') },
    { value: 'ONE_ON_ONE' as const, label: t('common.oneOnOne') },
  ];

  return (
    <PageShell>
      <PageHeader
        title={t('pages.schedule.title')}
        description={t('pages.schedule.description', { count: filtered.length, upcoming })}
        icon={<HiOutlineCalendar className="h-7 w-7" />}
        action={{ label: t('pages.slots.title'), href: '/slots' }}
      />

      <CalendarConnectBar />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="insights-stat-card">
          <p className="insights-stat-card__value">{filtered.length}</p>
          <p className="insights-stat-card__label">{t('pages.schedule.statTotal')}</p>
        </div>
        <div className="insights-stat-card">
          <p className="insights-stat-card__value">{upcoming}</p>
          <p className="insights-stat-card__label">{t('pages.schedule.statBooked')}</p>
        </div>
        <div className="insights-stat-card col-span-2 sm:col-span-1">
          <p className="insights-stat-card__value">{openSlots}</p>
          <p className="insights-stat-card__label">{t('pages.schedule.statOpen')}</p>
        </div>
      </div>

      <div className="card p-4 mb-6 space-y-4">
        <input
          className="input"
          placeholder={t('pages.schedule.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterChips
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel={t('pages.schedule.filterStatus')}
        />
        <FilterChips
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          ariaLabel={t('pages.schedule.filterType')}
        />
      </div>

      {loadError ? (
        <Alert variant="error" className="mb-6">
          <p>{t('common.loadError')}</p>
          <button
            type="button"
            className="btn btn-secondary text-sm mt-3"
            onClick={() => {
              void refetchSlots();
              void refetchMentors();
            }}
          >
            {t('common.retry')}
          </button>
        </Alert>
      ) : null}

      {loading ? (
        <Skeleton count={4} />
      ) : !loadError && filtered.length === 0 ? (
        <EmptyState
          title={t('pages.schedule.emptyTitle')}
          description={t('pages.schedule.emptyDesc')}
          actionLabel={t('pages.slots.addFreeSlot')}
          actionHref="/slots"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => {
            const { day, month } = parseDateParts(s.date);
            const synced = Boolean(s.googleCalendarEventId);
            return (
              <article key={s._id} className="card card-hover people-card p-5">
                <div className="schedule-card">
                  <div className="schedule-date-chip">
                    <span className="schedule-date-chip__day">{day}</span>
                    <span className="schedule-date-chip__month">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Avatar name={s.mentor.name} size="sm" />
                      <h3 className="people-card__name flex-1 min-w-0">{s.title}</h3>
                      <span className={`badge-pill shrink-0 ${STATUS_CLASS[s.status]}`}>
                        {t(`session.${s.status.toLowerCase()}`)}
                      </span>
                      {s.isOpen && (
                        <span className="badge-pill badge-success shrink-0">
                          {t('pages.schedule.openBadge')}
                        </span>
                      )}
                      {synced && (
                        <span className="badge-pill badge-accent shrink-0">
                          {t('pages.schedule.calendarSyncedBadge')}
                        </span>
                      )}
                    </div>
                    <p className="people-card__meta mb-3">{s.mentor.name}</p>
                    <p className="text-sm text-secondary line-clamp-2 mb-3">{s.description}</p>
                    <div className="schedule-card__meta-grid">
                      <span className="schedule-meta-item">
                        <HiOutlineClock className="h-4 w-4 text-muted shrink-0" />
                        {s.time} · {s.duration} {t('common.min')}
                      </span>
                      <span className="schedule-meta-item">
                        <HiOutlineMapPin className="h-4 w-4 text-muted shrink-0" />
                        {s.location.startsWith('http') ? (
                          <a
                            href={s.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate"
                            style={{ color: 'var(--accent)' }}
                          >
                            {t('pages.slots.joinMeeting')}
                          </a>
                        ) : (
                          <span className="truncate">{s.location}</span>
                        )}
                      </span>
                      <span className="schedule-meta-item sm:col-span-2">
                        <HiOutlineUserGroup className="h-4 w-4 text-muted shrink-0" />
                        {t('pages.schedule.menteesCount', { count: s.mentees.length })}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                      <Link to="/slots" className="btn btn-primary text-sm inline-flex items-center gap-1">
                        {t('pages.schedule.manageSlots')}
                        <HiOutlineArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      {!s.isOpen && !synced && (
                        <button
                          type="button"
                          className="btn btn-secondary text-sm inline-flex items-center gap-1"
                          disabled={syncingId === s._id}
                          onClick={() => handleSyncCalendar(s._id)}
                        >
                          <HiOutlineCloudArrowUp className="h-3.5 w-3.5" />
                          {syncingId === s._id
                            ? t('common.loading')
                            : t('pages.schedule.syncCalendar')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-sm text-muted mt-4">{t('pages.schedule.slotsSourceNote')}</p>
    </PageShell>
  );
};

export default ScheduleList;