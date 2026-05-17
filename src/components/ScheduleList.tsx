import { useState, useMemo, useEffect } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { PageShell, PageHeader, LaunchBadge } from './ui';
import { Alert } from './ui/Alert';
import EmptyState from './EmptyState';
import Avatar from './Avatar';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { slotsApi, mentorApi } from '../services/api';
import { unwrapList } from '../lib/apiHelpers';

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
}

const STATUS_CLASS: Record<Session['status'], string> = {
  SCHEDULED: 'badge-accent',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-full',
};

const ScheduleList = () => {
  const { t } = useAppTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Session['status']>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Session['type']>('ALL');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [slotsRes, mentorsRes] = await Promise.all([slotsApi.getAll(), mentorApi.getAll()]);
        if (cancelled) return;
        const slots = Array.isArray(slotsRes.data) ? slotsRes.data : [];
        const mentors = unwrapList<{ _id: string; name?: string; email?: string }>(mentorsRes);
        const mentorName = (id: string) =>
          mentors.find((m) => m._id === id)?.name || mentors.find((m) => m._id === id)?.email || id;

        const mapped: Session[] = slots.map((s: Record<string, unknown>) => {
          const booked = Boolean(s.bookedBy);
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
            type: 'ONE_ON_ONE',
            status: isPast ? 'COMPLETED' : booked ? 'SCHEDULED' : 'SCHEDULED',
            description: booked
              ? t('pages.schedule.bookedDesc')
              : t('pages.schedule.openDesc'),
          };
        });
        setSessions(mapped);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

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

  const upcoming = filtered.filter((s) => s.status === 'SCHEDULED').length;

  return (
    <PageShell>
      <PageHeader
        title={t('pages.schedule.title')}
        description={t('pages.schedule.description', { count: filtered.length, upcoming })}
        icon={<HiOutlineCalendar className="h-7 w-7" />}
      />

      <div className="card p-4 mb-6 space-y-3">
        <input
          className="input"
          placeholder={t('pages.schedule.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`btn text-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? t('pages.schedule.allStatus') : t(`session.${st.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'GROUP', 'ONE_ON_ONE'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              className={`btn text-sm ${typeFilter === tp ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTypeFilter(tp)}
            >
              {tp === 'ALL' ? t('pages.schedule.allTypes') : tp === 'GROUP' ? t('common.group') : t('common.oneOnOne')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('pages.schedule.emptyTitle')} description={t('pages.schedule.emptyDesc')} />
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <article key={s._id} className="card card-hover p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-3 min-w-0 flex-1">
                  <Avatar name={s.mentor.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-primary">{s.title}</h3>
                      <span className={`badge-pill ${STATUS_CLASS[s.status]}`}>
                        {t(`session.${s.status.toLowerCase()}`)}
                      </span>
                      <span className="badge-pill badge-neutral">
                        {s.type === 'GROUP' ? t('common.group') : t('common.oneOnOne')}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{s.mentor.name}</p>
                    <p className="text-sm text-secondary mt-2 line-clamp-2">{s.description}</p>
                  </div>
                </div>
                <div className="shrink-0 space-y-2 text-sm text-secondary sm:text-right">
                  <p className="flex items-center gap-1.5 sm:justify-end">
                    <HiOutlineCalendar className="h-4 w-4 text-muted" />
                    {s.date} · {s.time}
                  </p>
                  <p className="flex items-center gap-1.5 sm:justify-end">
                    <HiOutlineClock className="h-4 w-4 text-muted" />
                    {s.duration} {t('common.min')}
                  </p>
                  <p className="flex items-center gap-1.5 sm:justify-end">
                    <HiOutlineMapPin className="h-4 w-4 text-muted" />
                    {s.location.startsWith('http') ? (
                      <a href={s.location} target="_blank" rel="noopener noreferrer" className="truncate max-w-[200px]" style={{ color: 'var(--accent)' }}>
                        {t('pages.slots.joinMeeting')}
                      </a>
                    ) : (
                      s.location
                    )}
                  </p>
                  <p className="flex items-center gap-1.5 sm:justify-end">
                    <HiOutlineUserGroup className="h-4 w-4 text-muted" />
                    {t('pages.schedule.menteesCount', { count: s.mentees.length })}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Alert variant="info" className="mt-4">
        {t('pages.schedule.slotsSourceNote')}
      </Alert>
      <Alert variant="info" className="mt-3">
        <span className="inline-flex flex-wrap items-center gap-2">
          <LaunchBadge variant="comingSoon" />
          <span>{t('pages.schedule.futureNote')}</span>
        </span>
      </Alert>
    </PageShell>
  );
};

export default ScheduleList;
