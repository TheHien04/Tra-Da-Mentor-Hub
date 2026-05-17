import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { menteeApi, mentorApi, groupApi } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const AddMentee = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mentors, setMentors] = useState<{ _id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);
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

  useEffect(() => {
    Promise.all([mentorApi.getAll(), groupApi.getAll()])
      .then(([mRes, gRes]) => {
        setMentors(unwrapList(mRes));
        setGroups(unwrapList(gRes));
      })
      .catch(() => toast.warn('Could not load mentors/groups for dropdowns'));
  }, []);

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

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'Name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = 'Invalid email';
    if (!formData.school.trim()) next.school = 'School is required';
    if (formData.progress < 0 || formData.progress > 100) next.progress = '0–100 only';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await menteeApi.create({
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
      toast.success(t('mentee.addSuccess', 'Mentee created'));
      navigate('/mentees');
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

      <FormField label="Full name" required>
        <input className={`input ${errors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>

      <FormField label="Email" required>
        <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>

      <FormField label="Phone">
        <input type="tel" className="input" name="phone" value={formData.phone} onChange={handleChange} />
      </FormField>

      <FormField label="School / university" required>
        <input className={`input ${errors.school ? 'input-error' : ''}`} name="school" value={formData.school} onChange={handleChange} />
        {errors.school && <p className="text-xs text-red-600 mt-1">{errors.school}</p>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Track">
          <select className="input" name="track" value={formData.track} onChange={handleChange}>
            <option value="tech">Technology</option>
            <option value="business">Business</option>
            <option value="design">Design</option>
            <option value="economics">Economics</option>
          </select>
        </FormField>
        <FormField label="Progress %">
          <input type="number" min={0} max={100} className="input" name="progress" value={formData.progress} onChange={handleChange} />
        </FormField>
      </div>

      <FormField label="Interests" hint="Comma-separated skills or topics">
        <input className="input" name="interests" value={formData.interests} onChange={handleChange} placeholder={t('lists.interestsPlaceholder')} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Mentor (optional)">
          <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange}>
            <option value="">— None —</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Group (optional)">
          <select className="input" name="groupId" value={formData.groupId} onChange={handleChange}>
            <option value="">— None —</option>
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
          Cancel
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating…' : 'Create mentee'}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddMentee;
