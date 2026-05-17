import { useState, useEffect } from 'react';
import { slotsApi, mentorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineLink } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from '../components/ui';
import { FormField } from '../components/ui/FormShell';
import Skeleton from '../components/Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getMenteeProfileId } from '../lib/authUser';
import { unwrapList } from '../lib/apiHelpers';
import { menteeApi } from '../services/api';

interface Slot {
  _id: string;
  mentorId: string;
  date: string;
  time: string;
  duration: number;
  meetingLink?: string;
  bookedBy: string | null;
}

const SlotsPage = () => {
  const { t } = useAppTranslation();
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const [slots, setSlots] = useState<Slot[]>([]);
  const [mentors, setMentors] = useState<{ _id: string; name?: string; email?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMentorId, setFilterMentorId] = useState('');
  const [menteeProfileId, setMenteeProfileId] = useState<string | null>(null);

  const [form, setForm] = useState({
    mentorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    meetingLink: '',
  });

  const fetchSlots = async () => {
    try {
      const params: { mentorId?: string } = {};
      if (filterMentorId) params.mentorId = filterMentorId;
      const res = await slotsApi.getAll(params);
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSlots();
  }, [filterMentorId]);

  useEffect(() => {
    mentorApi
      .getAll()
      .then((r) => {
        const d = r.data?.data ?? r.data ?? [];
        setMentors(Array.isArray(d) ? d : []);
      })
      .catch(() => setMentors([]));
  }, []);

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
      fetchSlots();
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
      fetchSlots();
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

      {loading ? (
        <Skeleton count={4} />
      ) : slots.length === 0 ? (
        <Alert variant="info">{t('pages.slots.emptyDesc')}</Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((s) => (
            <article key={s._id} className="card p-5">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div>
                  <p className="font-semibold text-primary">{getMentorName(s.mentorId)}</p>
                  <p className="text-sm text-muted">
                    {s.date} · {s.time} · {s.duration} {t('common.min')}
                  </p>
                </div>
                <span className={`badge-pill ${s.bookedBy ? 'badge-warning' : 'badge-success'}`}>
                  {s.bookedBy ? t('pages.slots.booked') : t('pages.slots.available')}
                </span>
              </div>
              {s.meetingLink && (
                <a
                  href={s.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  <HiOutlineLink className="h-4 w-4" /> {t('pages.slots.joinMeeting')}
                </a>
              )}
              {!s.bookedBy && (role === 'mentee' || role === 'admin') && (
                <button type="button" className="btn btn-primary w-full" onClick={() => handleBook(s._id)}>
                  {t('pages.slots.book')}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default SlotsPage;
