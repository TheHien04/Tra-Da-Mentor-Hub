import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { mentorApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const TRACKS = [
  { value: 'tech', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'economics', label: 'Economics' },
];

const AddMentor = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
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

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'Name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = 'Invalid email';
    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, '')))
      next.phone = 'Phone needs at least 10 digits';
    if (formData.maxMentees < 1) next.maxMentees = 'Min 1 mentee slot';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await mentorApi.create({
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
      toast.success(t('mentor.addSuccess', 'Mentor created'));
      navigate('/mentors');
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title={t('mentor.addMentor', 'Add Mentor')}
      description={t('form.addMentorDesc')}
      backHref="/mentors"
      onSubmit={handleSubmit}
    >
      {errors.submit && (
        <Alert variant="error" className="mb-2">
          {errors.submit}
        </Alert>
      )}

      <FormField label="Full name" required>
        <input className={`input ${errors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>

      <FormField label="Email" required>
        <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>

      <FormField label="Phone">
        <input type="tel" className={`input ${errors.phone ? 'input-error' : ''}`} name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Track / field" required>
          <select className="input" name="track" value={formData.track} onChange={handleChange}>
            {TRACKS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Max mentees" required>
          <input type="number" min={1} max={20} className="input" name="maxMentees" value={formData.maxMentees} onChange={handleChange} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Mentorship type">
          <select className="input" name="mentorshipType" value={formData.mentorshipType} onChange={handleChange}>
            <option value="GROUP">Group</option>
            <option value="ONE_ON_ONE">1:1</option>
          </select>
        </FormField>
        <FormField label="Duration">
          <select className="input" name="duration" value={formData.duration} onChange={handleChange}>
            <option value="LONG_TERM">Long-term</option>
            <option value="SHORT_TERM">Short-term</option>
          </select>
        </FormField>
      </div>

      <FormField label="Skills" hint="Comma-separated, e.g. React, Node.js">
        <input className="input" name="expertise" value={formData.expertise} onChange={handleChange} placeholder={t('lists.expertisePlaceholder')} />
      </FormField>

      <FormField label="Bio">
        <textarea className="input min-h-[100px]" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
      </FormField>

      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/mentors')}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating…' : 'Create mentor'}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddMentor;
