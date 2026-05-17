import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

const TRACK_VALUES = ['tech', 'design', 'business', 'marketing', 'economics'] as const;

const EditMentor = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    track: 'tech',
    expertise: '',
    bio: '',
    maxMentees: 6,
    mentorshipType: 'GROUP',
    duration: 'LONG_TERM',
  });

  useEffect(() => {
    if (!id) return;
    mentorApi
      .getById(id)
      .then((res) => {
        const m = res.data;
        setFormData({
          name: m.name || '',
          email: m.email || '',
          phone: m.phone || '',
          track: m.track || 'tech',
          expertise: Array.isArray(m.expertise) ? m.expertise.join(', ') : '',
          bio: m.bio || '',
          maxMentees: m.maxMentees || 6,
          mentorshipType: m.mentorshipType || 'GROUP',
          duration: m.duration || 'LONG_TERM',
        });
      })
      .catch((err) => setErrors({ submit: getApiErrorMessage(err) }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxMentees' ? Number(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      await mentorApi.update(id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        track: formData.track,
        bio: formData.bio.trim() || undefined,
        expertise: formData.expertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        maxMentees: formData.maxMentees,
        mentorshipType: formData.mentorshipType,
        duration: formData.duration,
      });
      toast.success(t('detail.mentorUpdated'));
      navigate(`/mentors/${id}`);
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Skeleton count={6} />
      </div>
    );
  }

  return (
    <FormShell
      title={t('mentor.editMentor')}
      description={t('form.editMentorDesc')}
      backHref={`/mentors/${id}`}
      onSubmit={handleSubmit}
    >
      {errors.submit && <Alert variant="error">{errors.submit}</Alert>}

      <FormField label={t('form.fullName')} required>
        <input className="input" name="name" value={formData.name} onChange={handleChange} required />
      </FormField>
      <FormField label={t('auth.email')} required>
        <input type="email" className="input" name="email" value={formData.email} onChange={handleChange} required />
      </FormField>
      <FormField label={t('detail.phone')}>
        <input type="tel" className="input" name="phone" value={formData.phone} onChange={handleChange} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('common.track')}>
          <select className="input" name="track" value={formData.track} onChange={handleChange}>
            {TRACK_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(`form.tracks.${value}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('form.maxMentees')}>
          <input type="number" min={1} className="input" name="maxMentees" value={formData.maxMentees} onChange={handleChange} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('form.type')}>
          <select className="input" name="mentorshipType" value={formData.mentorshipType} onChange={handleChange}>
            <option value="GROUP">{t('common.group')}</option>
            <option value="ONE_ON_ONE">{t('common.oneOnOne')}</option>
          </select>
        </FormField>
        <FormField label={t('detail.duration')}>
          <select className="input" name="duration" value={formData.duration} onChange={handleChange}>
            <option value="LONG_TERM">{t('form.longTerm')}</option>
            <option value="SHORT_TERM">{t('form.shortTerm')}</option>
          </select>
        </FormField>
      </div>
      <FormField label={t('form.skills')}>
        <input className="input" name="expertise" value={formData.expertise} onChange={handleChange} />
      </FormField>
      <FormField label={t('detail.bio')}>
        <textarea className="input min-h-[100px]" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
      </FormField>
      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate(`/mentors/${id}`)}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
          {submitting ? t('common.saving') : t('form.saveChanges')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default EditMentor;
