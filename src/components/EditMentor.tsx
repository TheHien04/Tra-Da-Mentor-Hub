import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mentorApi, uploadsApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { parseForm } from '../lib/zodForm';
import { getTrackOptions } from '../lib/trackOptions';
import { editMentorFormSchema } from '../schemas/forms';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { AvatarUploadField } from './ui/AvatarUploadField';
import { Alert } from './ui/Alert';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

const EditMentor = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackOptions = getTrackOptions(t);
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
    avatarUrl: '',
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
          avatarUrl: m.avatarUrl || '',
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarUpload = async (dataUrl: string) => {
    if (!id) return;
    const res = await uploadsApi.avatar({ entityType: 'mentor', entityId: id, dataUrl });
    const url = res.data.data.avatarUrl;
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    toast.success(t('form.avatarUpdated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const parsed = parseForm(editMentorFormSchema, formData, t);
    if (!parsed.success) {
      const next = { ...parsed.errors };
      if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        next.phone = t('validation.phoneInvalid');
      }
      setErrors(next);
      return;
    }
    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      setErrors({ phone: t('validation.phoneInvalid') });
      return;
    }

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
        avatarUrl: formData.avatarUrl || undefined,
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

      <FormField label={t('form.avatar')}>
        <AvatarUploadField
          name={formData.name || 'Mentor'}
          track={formData.track}
          avatarUrl={formData.avatarUrl}
          onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
          onUpload={handleAvatarUpload}
        />
      </FormField>

      <FormField label={t('form.fullName')} required>
        <input
          className={`input ${errors.name ? 'input-error' : ''}`}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>
      <FormField label={t('auth.email')} required>
        <input
          type="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>
      <FormField label={t('detail.phone')}>
        <input type="tel" className="input" name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('common.track')}>
          <select className="input" name="track" value={formData.track} onChange={handleChange}>
            {trackOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('form.maxMentees')}>
          <input
            type="number"
            min={1}
            className="input"
            name="maxMentees"
            value={formData.maxMentees}
            onChange={handleChange}
          />
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
