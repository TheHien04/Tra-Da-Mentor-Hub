import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { slotsApi, menteeApi } from '../services/api';
import { useSlots } from '../hooks/queries/useSlots';
import { useMentors } from '../hooks/queries/useMentors';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineLink, HiOutlineClock } from 'react-icons/hi2';
import Avatar from '../components/Avatar';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from '../components/ui';
import EmptyState from '../components/EmptyState';
import { FormField } from '../components/ui/FormShell';
import Skeleton from '../components/Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getMenteeProfileId } from '../lib/authUser';
import { unwrapList } from '../lib/apiHelpers';
import { useCalendarStatus, useSyncSlotToCalendar } from '../hooks/queries/useCalendar';

const SlotsPage = () => {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterMentorId, setFilterMentorId] = useState('');
  const slotParams = filterMentorId ? { mentorId: filterMentorId } : undefined;
  const {
    data: slots = [],
    isLoading: loading,
    isError: loadError,
    refetch: refetchSlots,
  } = useSlots(slotParams);
  const { data: mentors = [] } = useMentors();
  const [menteeProfileId, setMenteeProfileId] = useState<string | null>(null);
  const { data: calendarStatus } = useCalendarStatus();
  const syncSlot = useSyncSlotToCalendar();

  const [form, setForm] = useState({
    mentorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    meetingLink: '',
  });

  const invalidateSlots = () => {
    void queryClient.invalidateQueries({ queryKey: ['slots'] });
  };

  useEffect(() => {
    const fromProfile = getMenteeProfileId(state.user);
    if (fromProfile) {
      setMenteeProfileId(fromProfile);
      return;
    }
    if (role !== 'mentee' || !state.user?.email) return;
    menteeApi
      .getAll()
      .then((res) => {
        const list = unwrapList<{ _id: string; email?: string }>(res);
        const me = list.find((m) => m.email === state.user?.email);
        if (me) setMenteeProfileId(me._id);
      })
      .catch(() => setMenteeProfileId(null));
  }, [role, state.user]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mentorId || !form.date || !form.time) {
      toast.warning(t('pages.slots.fillRequired'));
      return;
    }
    try {
      await slotsApi.create({
        mentorId: form.mentorId,
        date: form.date,
        time: form.time,
        duration: form.duration,
        meetingLink: form.meetingLink || undefined,
      });
      toast.success(t('pages.slots.added'));
      setShowForm(false);
      invalidateSlots();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.slots.addFailed'));
    }
  };

  const handleBook = async (slotId: string) => {
    const menteeId = menteeProfileId;
    if (!menteeId) {
      toast.warning(t('pages.slots.noMenteeProfile'));
      return;
    }
    try {
      await slotsApi.book(slotId, menteeId);
      toast.success(t('pages.slots.bookSuccess'));
      if (calendarStatus?.connected) {
        try {
          const syncRes = await syncSlot.mutateAsync(slotId);
          if (syncRes.data?.meetLink) {
            toast.info(t('pages.slots.calendarMeetCreated'));
          }
        } catch {
          /* booking succeeded; calendar sync is optional */
        }
      }
      invalidateSlots();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.slots.bookFailed'));
    }
  };

  const getMentorName = (id: string) => mentors.find((m) => m._id === id)?.name || id;

  return (
    <PageShell>
      <PageHeader
        title={t('pages.slots.title')}
        description={t('pages.slots.description')}
        icon={<HiOutlineCalendar className="h-7 w-7" />}
        action={{ label: t('nav.schedule'), href: '/schedule' }}
      >
        {(role === 'mentor' || role === 'admin') && (
          <button type="button" className="btn btn-primary mt-3" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus className="h-4 w-4" />
            {showForm ? t('pages.slots.closeForm') : t('pages.slots.addFreeSlot')}
          </button>
        )}
      </PageHeader>

      {showForm && (
        <form onSubmit={handleAddSlot} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('pages.sessionLog.mentor')} required>
              <select
                className="input"
                value={form.mentorId}
                onChange={(e) => setForm((f) => ({ ...f, mentorId: e.target.value }))}
                required
              >
                <option value="">{t('pages.slots.selectMentor')}</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('common.date')} required>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </FormField>
            <FormField label={t('common.time')} required>
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                required
              />
            </FormField>
            <FormField label={t('pages.slots.durationMin')}>
              <input
                type="number"
                className="input"
                min={15}
                max={120}
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) || 60 }))}
              />
            </FormField>
          </div>
          <FormField label={t('pages.slots.meetingLink')} hint={t('pages.slots.meetingLinkHint')}>
            <input
              type="url"
              className="input"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
            />
          </FormField>
          <button type="submit" className="btn btn-primary">
            {t('pages.slots.add')}
          </button>
        </form>
      )}

      <FormField label={t('pages.slots.filterByMentor')}>
        <select
          className="input max-w-xs mb-6"
          value={filterMentorId}
          onChange={(e) => setFilterMentorId(e.target.value)}
        >
          <option value="">{t('pages.slots.allMentors')}</option>
          {mentors.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
      </FormField>

      {loadError && !loading && (
        <Alert variant="error" className="mb-6">
          <p>{t('common.loadError')}</p>
          <button type="button" className="btn btn-secondary text-sm mt-3" onClick={() => void refetchSlots()}>
            {t('common.retry')}
          </button>
        </Alert>
      )}

      {loading ? (
        <Skeleton count={4} />
      ) : !loadError && slots.length === 0 ? (
        <EmptyState
          title={t('pages.slots.emptyTitle')}
          description={t('pages.slots.emptyDesc')}
          actionLabel={
            role === 'mentor' || role === 'admin' ? t('pages.slots.addFreeSlot') : undefined
          }
          onAction={
            role === 'mentor' || role === 'admin' ? () => setShowForm(true) : undefined
          }
        />
      ) : !loadError ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slots.map((s) => {
            const mentorName = getMentorName(s.mentorId);
            const isOpen = !s.bookedBy;
            return (
              <article
                key={s._id}
                className={`card card-hover slot-card p-5 flex flex-col ${isOpen ? 'slot-card--open' : ''}`}
              >
                <div className="people-card__header mb-4 mt-1">
                  <Avatar name={mentorName} size="lg" />
                  <div className="people-card__identity">
                    <div className="people-card__title-row">
                      <h3 className="people-card__name">{mentorName}</h3>
                      <span className={`badge-pill shrink-0 ${s.bookedBy ? 'badge-warning' : 'badge-success'}`}>
                        {s.bookedBy ? t('pages.slots.booked') : t('pages.slots.available')}
                      </span>
                    </div>
                    <p className="schedule-meta-item mt-1">
                      <HiOutlineClock className="h-4 w-4 text-muted shrink-0" />
                      {s.date} · {s.time} · {s.duration} {t('common.min')}
                    </p>
                  </div>
                </div>
                {s.meetingLink && (
                  <a
                    href={s.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm mb-4 font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    <HiOutlineLink className="h-4 w-4" /> {t('pages.slots.joinMeeting')}
                  </a>
                )}
                {isOpen && (role === 'mentee' || role === 'admin') && (
                  <button type="button" className="btn btn-primary w-full mt-auto" onClick={() => handleBook(s._id)}>
                    {t('pages.slots.book')}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : null}
    </PageShell>
  );
};

export default SlotsPage;
