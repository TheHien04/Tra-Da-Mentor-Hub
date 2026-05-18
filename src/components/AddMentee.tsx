import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { menteeApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { parseForm } from '../lib/zodForm';
import { getTrackOptions } from '../lib/trackOptions';
import { createMenteeFormSchema } from '../schemas/forms';
import { useMentors } from '../hooks/queries/useMentors';
import { useGroups } from '../hooks/queries/useGroups';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const AddMentee = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: mentors = [] } = useMentors();
  const { data: groups = [] } = useGroups();
  const trackOptions = getTrackOptions(t);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    track: 'tech',
    interests: '',
    progress: 0,
    mentorId: '',
    groupId: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Number(value) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseForm(createMenteeFormSchema, formData, t);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    try {
      setLoading(true);
      const res = await menteeApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        school: formData.school.trim(),
        track: formData.track,
        interests: formData.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        progress: formData.progress,
        mentorId: formData.mentorId || undefined,
        groupId: formData.groupId || undefined,
        applicationStatus: 'pending',
      });
      const created = res.data as { _id?: string };
      toast.success(t('mentee.addSuccess'));
      if (created?._id) {
        navigate(`/mentees/${created._id}/edit`);
      } else {
        navigate('/mentees');
      }
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title={t('mentee.addMentee', 'Add Mentee')}
      description={t('form.addMenteeDesc')}
      backHref="/mentees"
      onSubmit={handleSubmit}
    >
      {errors.submit && <Alert variant="error">{errors.submit}</Alert>}

      <FormField label={t('form.fullName')} required>
        <input className={`input ${errors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>

      <FormField label={t('common.email')} required>
        <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>

      <FormField label={t('form.phone')}>
        <input type="tel" className="input" name="phone" value={formData.phone} onChange={handleChange} />
      </FormField>

      <FormField label={t('detail.school')} required>
        <input className={`input ${errors.school ? 'input-error' : ''}`} name="school" value={formData.school} onChange={handleChange} />
        {errors.school && <p className="text-xs text-red-600 mt-1">{errors.school}</p>}
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
        <FormField label={t('detail.progress')}>
          <input type="number" min={0} max={100} className="input" name="progress" value={formData.progress} onChange={handleChange} />
        </FormField>
      </div>

      <FormField label={t('form.skills')} hint={t('form.expertiseHint')}>
        <input className="input" name="interests" value={formData.interests} onChange={handleChange} placeholder={t('lists.interestsPlaceholder')} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={`${t('mentor.title')} (${t('common.optional')})`}>
          <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange}>
            <option value="">—</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={`${t('group.title')} (${t('common.optional')})`}>
          <select className="input" name="groupId" value={formData.groupId} onChange={handleChange}>
            <option value="">—</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/mentees')}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? t('common.creating') : t('mentee.addMentee')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddMentee;
