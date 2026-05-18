import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { parseForm } from '../lib/zodForm';
import { getTrackOptions } from '../lib/trackOptions';
import { createMentorFormSchema } from '../schemas/forms';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const AddMentor = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const trackOptions = getTrackOptions(t);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseForm(createMentorFormSchema, formData, t);
    if (!parsed.success) {
      if (
        formData.phone &&
        !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))
      ) {
        parsed.errors.phone = t('validation.phoneInvalid');
      }
      setErrors(parsed.errors);
      return;
    }
    if (
      formData.phone &&
      !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))
    ) {
      setErrors({ phone: t('validation.phoneInvalid') });
      return;
    }

    try {
      setLoading(true);
      const res = await mentorApi.create({
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
      const created = res.data as { _id?: string };
      toast.success(t('mentor.addSuccess'));
      if (created?._id) {
        navigate(`/mentors/${created._id}/edit`);
      } else {
        navigate('/mentors');
      }
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title={t('mentor.addMentor')}
      description={t('form.addMentorDesc')}
      backHref="/mentors"
      onSubmit={handleSubmit}
    >
      {errors.submit && (
        <Alert variant="error" className="mb-2">
          {errors.submit}
        </Alert>
      )}

      <FormField label={t('common.name')} required>
        <input
          className={`input ${errors.name ? 'input-error' : ''}`}
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>

      <FormField label={t('common.email')} required>
        <input
          type="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>

      <FormField label={t('form.phone')}>
        <input
          type="tel"
          className={`input ${errors.phone ? 'input-error' : ''}`}
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('common.track')} required>
          <select className="input" name="track" value={formData.track} onChange={handleChange}>
            {trackOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('mentor.maxMentees')} required>
          <input
            type="number"
            min={1}
            max={100}
            className={`input ${errors.maxMentees ? 'input-error' : ''}`}
            name="maxMentees"
            value={formData.maxMentees}
            onChange={handleChange}
          />
          {errors.maxMentees && <p className="text-xs text-red-600 mt-1">{errors.maxMentees}</p>}
        </FormField>
      </div>

      <FormField label={t('mentor.expertise')} hint={t('form.expertiseHint')}>
        <input className="input" name="expertise" value={formData.expertise} onChange={handleChange} />
      </FormField>

      <FormField label={t('mentor.bio')}>
        <textarea className="input min-h-[100px]" name="bio" value={formData.bio} onChange={handleChange} />
      </FormField>

      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/mentors')}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? t('common.creating') : t('mentor.addMentor')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddMentor;
