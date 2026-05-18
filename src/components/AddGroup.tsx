import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { groupApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { parseForm } from '../lib/zodForm';
import { addGroupFormSchema } from '../schemas/forms';
import { useMentors } from '../hooks/queries/useMentors';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const AddGroup = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { data: mentors = [] } = useMentors();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mentorId: '',
    frequency: 'Weekly',
    dayOfWeek: 'Monday',
    time: '19:00',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseForm(addGroupFormSchema, formData, t);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

    try {
      setLoading(true);
      await groupApi.create({
        name: formData.name.trim(),
        description: formData.description.trim() || formData.name.trim(),
        topic: formData.name.trim(),
        mentorId: formData.mentorId,
        meetingSchedule: {
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          time: formData.time,
        },
      });
      toast.success(t('group.addSuccess'));
      navigate('/groups');
    } catch (err) {
      setErrors({ submit: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title={t('group.addGroup')}
      description={t('form.addGroupDesc')}
      backHref="/groups"
      onSubmit={handleSubmit}
    >
      {errors.submit && <Alert variant="error">{errors.submit}</Alert>}

      <FormField label={t('form.groupName')} required>
        <input
          className={`input ${errors.name ? 'input-error' : ''}`}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>

      <FormField label={t('form.description')}>
        <textarea
          className="input min-h-[80px]"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </FormField>

      <FormField label={t('mentor.title')} required>
        <select
          className={`input ${errors.mentorId ? 'input-error' : ''}`}
          name="mentorId"
          value={formData.mentorId}
          onChange={handleChange}
          required
        >
          <option value="">{t('form.selectMentor')}</option>
          {mentors.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
        {errors.mentorId && <p className="text-xs text-red-600 mt-1">{errors.mentorId}</p>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={t('form.frequency')}>
          <select className="input" name="frequency" value={formData.frequency} onChange={handleChange}>
            <option value="Weekly">{t('form.frequencyWeekly')}</option>
            <option value="Bi-weekly">{t('form.frequencyBiweekly')}</option>
            <option value="Monthly">{t('form.frequencyMonthly')}</option>
          </select>
        </FormField>
        <FormField label={t('form.day')}>
          <select className="input" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
            {DAY_KEYS.map((d) => (
              <option key={d} value={d}>
                {t(`form.days.${d}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('common.time')}>
          <input type="time" className="input" name="time" value={formData.time} onChange={handleChange} />
        </FormField>
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/groups')}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? t('common.creating') : t('group.addGroup')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddGroup;
