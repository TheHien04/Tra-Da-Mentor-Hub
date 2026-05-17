import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert } from './ui';
import { FormField, FormActions } from './ui/FormShell';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { testimonialsApi, type Testimonial } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';

type TestimonialStatus = Testimonial['status'];
type Track = Testimonial['track'];

const STATUS_BADGE: Record<TestimonialStatus, string> = {
  PUBLISHED: 'badge-success',
  PENDING: 'badge-warning',
  REJECTED: 'badge-full',
};

const TestimonialsPage = () => {
  const { t } = useAppTranslation();
  const trackLabel = (track: Track) => {
    const map: Record<Track, string> = {
      career: t('pages.testimonials.trackCareer'),
      personal: t('pages.testimonials.trackPersonal'),
      soft_skills: t('pages.testimonials.trackSoftSkills'),
    };
    return map[track];
  };
  const statusLabel = (status: TestimonialStatus) => {
    const map: Record<TestimonialStatus, string> = {
      PUBLISHED: t('common.published'),
      PENDING: t('common.pending'),
      REJECTED: t('common.rejected'),
    };
    return map[status];
  };
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TestimonialStatus>('ALL');
  const [filterTrack, setFilterTrack] = useState<'ALL' | Track>('ALL');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    menteeName: '',
    mentorName: '',
    content: '',
    rating: 5,
    track: 'career' as Track,
  });

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await testimonialsApi.getAll();
      setTestimonials(unwrapList<Testimonial>(res));
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return testimonials.filter((t) => {
      const matchQ =
        t.menteeName.toLowerCase().includes(q) ||
        t.mentorName.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchTrack = filterTrack === 'ALL' || t.track === filterTrack;
      return matchQ && matchStatus && matchTrack;
    });
  }, [testimonials, searchQuery, filterStatus, filterTrack]);

  const stats = useMemo(
    () => ({
      total: testimonials.length,
      published: testimonials.filter((t) => t.status === 'PUBLISHED').length,
      pending: testimonials.filter((t) => t.status === 'PENDING').length,
      rejected: testimonials.filter((t) => t.status === 'REJECTED').length,
      avg: (
        testimonials.reduce((s, t) => s + t.rating, 0) / (testimonials.length || 1)
      ).toFixed(1),
    }),
    [testimonials]
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.menteeName.trim() || !draft.mentorName.trim() || !draft.content.trim()) {
      toast.warning(t('pages.testimonials.fillRequired'));
      return;
    }
    try {
      await testimonialsApi.create(draft);
      await fetchTestimonials();
      setShowForm(false);
      setDraft({ menteeName: '', mentorName: '', content: '', rating: 5, track: 'career' });
      toast.success(t('pages.testimonials.submitted'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const setStatus = async (id: string, status: TestimonialStatus) => {
    try {
      await testimonialsApi.update(id, { status });
      setTestimonials((p) => p.map((x) => (x._id === id ? { ...x, status } : x)));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const removeItem = async (id: string, name: string) => {
    if (!window.confirm(t('pages.testimonials.deleteConfirm', { name }))) return;
    try {
      await testimonialsApi.delete(id);
      setTestimonials((p) => p.filter((x) => x._id !== id));
      toast.success(t('pages.testimonials.deleted'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const Stars = ({ n }: { n: number }) => (
    <span className="inline-flex gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <HiOutlineStar key={i} className={`h-4 w-4 ${i <= n ? 'fill-current' : 'opacity-30'}`} />
      ))}
    </span>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('pages.testimonials.title')}
        description={t('pages.testimonials.description', {
          total: stats.total,
          published: stats.published,
          pending: stats.pending,
          avg: stats.avg,
        })}
        icon={<HiOutlineChatBubbleLeftRight className="h-7 w-7" />}
      >
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex rounded-lg border p-0.5" style={{ borderColor: 'var(--border-default)' }}>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'gallery' ? 'btn-primary' : 'text-muted'}`}
              onClick={() => setViewMode('gallery')}
            >
              {t('pages.testimonials.gallery')}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'list' ? 'btn-primary' : 'text-muted'}`}
              onClick={() => setViewMode('list')}
            >
              {t('pages.testimonials.list')}
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus className="h-4 w-4" />
            {showForm ? t('pages.testimonials.close') : t('pages.testimonials.add')}
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('pages.testimonials.statPublished'), value: stats.published, cls: 'badge-success' },
          { label: t('pages.testimonials.statPending'), value: stats.pending, cls: 'badge-warning' },
          { label: t('pages.testimonials.statRejected'), value: stats.rejected, cls: 'badge-full' },
          { label: t('pages.testimonials.statAvgRating'), value: `${stats.avg}★`, cls: 'badge-accent' },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center py-4">
            <p className="stat-label">{s.label}</p>
            <p className="text-2xl font-semibold text-primary mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-6 space-y-3">
        <input
          className="input"
          placeholder={t('pages.testimonials.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PUBLISHED', 'PENDING', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn text-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? t('common.all') : statusLabel(s as TestimonialStatus)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'career', 'personal', 'soft_skills'] as const).map((tr) => (
            <button
              key={tr}
              type="button"
              className={`btn text-sm ${filterTrack === tr ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTrack(tr)}
            >
              {tr === 'ALL' ? t('pages.testimonials.allTracks') : trackLabel(tr)}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-primary">{t('pages.testimonials.newFormTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('pages.testimonials.menteeName')} required>
              <input className="input" value={draft.menteeName} onChange={(e) => setDraft({ ...draft, menteeName: e.target.value })} />
            </FormField>
            <FormField label={t('pages.testimonials.mentorName')} required>
              <input className="input" value={draft.mentorName} onChange={(e) => setDraft({ ...draft, mentorName: e.target.value })} />
            </FormField>
          </div>
          <FormField label={t('common.content')} required>
            <textarea className="input min-h-[100px]" rows={4} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('common.rating')}>
              <select className="input" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {t('pages.testimonials.starsOption', { n })}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('common.track')}>
              <select className="input" value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value as Track })}>
                <option value="career">{t('pages.testimonials.trackCareer')}</option>
                <option value="personal">{t('pages.testimonials.trackPersonal')}</option>
                <option value="soft_skills">{t('pages.testimonials.trackSoftSkills')}</option>
              </select>
            </FormField>
          </div>
          <FormActions>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {t('pages.testimonials.submit')}
            </button>
          </FormActions>
        </form>
      )}

      {loadError && (
        <Alert variant="error" className="mb-4">
          {loadError}
        </Alert>
      )}

      {loading ? (
        <div className="py-4">
          <Skeleton count={4} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('pages.testimonials.emptyTitle')} description={t('pages.testimonials.emptyFiltered')} />
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <article key={item._id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-primary">{item.menteeName}</p>
                  <p className="text-xs text-muted">
                    {t('pages.testimonials.withMentor', { name: item.mentorName })}
                  </p>
                </div>
                <span className={`badge-pill shrink-0 ${STATUS_BADGE[item.status]}`}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <Stars n={item.rating} />
              <p className="text-sm text-secondary mt-3 flex-1 line-clamp-4">&ldquo;{item.content}&rdquo;</p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="badge-pill badge-neutral">{trackLabel(item.track)}</span>
                <span className="text-xs text-muted">{item.date}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {item.status === 'PENDING' && (
                  <>
                    <button type="button" className="btn btn-primary text-xs flex-1" onClick={() => setStatus(item._id, 'PUBLISHED')}>
                      <HiOutlineCheck className="h-3.5 w-3.5" /> {t('pages.testimonials.approve')}
                    </button>
                    <button type="button" className="btn btn-secondary text-xs flex-1" onClick={() => setStatus(item._id, 'REJECTED')}>
                      <HiOutlineXMark className="h-3.5 w-3.5" /> {t('pages.testimonials.reject')}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  onClick={() => removeItem(item._id, item.menteeName)}
                >
                  <HiOutlineTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary">
                    {item.menteeName} · {item.mentorName}
                  </p>
                  <Stars n={item.rating} />
                  <p className="text-sm text-secondary mt-2">{item.content}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`badge-pill ${STATUS_BADGE[item.status]}`}>{statusLabel(item.status)}</span>
                  <span className="text-xs text-muted">{item.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

    </PageShell>
  );
};

export default TestimonialsPage;
