import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { groupApi, mentorApi } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const EditGroup = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mentors, setMentors] = useState<{ _id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mentorId: '',
    frequency: 'Weekly',
    dayOfWeek: 'Monday',
    time: '19:00',
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([groupApi.getById(id), mentorApi.getAll()])
      .then(([gRes, mRes]) => {
        const g = gRes.data;
        setMentors(unwrapList(mRes));
        const sched = g.meetingSchedule || {};
        setFormData({
          name: g.name || '',
          description: g.description || '',
          mentorId: g.mentorId || g.mentor?._id || '',
          frequency: sched.frequency || g.frequency || 'Weekly',
          dayOfWeek: sched.dayOfWeek || g.dayOfWeek || 'Monday',
          time: sched.time || g.time || '19:00',
        });
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.name.trim() || !formData.mentorId) {
      setError(t('form.nameAndMentorRequired'));
      return;
    }
    try {
      setSubmitting(true);
      await groupApi.update(id, {
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
      toast.success(t('detail.groupUpdated'));
      navigate(`/groups/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
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
    <FormShell title={t('group.editGroup')} backHref={`/groups/${id}`} onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}

      <FormField label={t('form.groupName')} required>
        <input className="input" name="name" value={formData.name} onChange={handleChange} required />
      </FormField>
      <FormField label={t('group.description')}>
        <textarea className="input min-h-[80px]" name="description" value={formData.description} onChange={handleChange} rows={3} />
      </FormField>
      <FormField label={t('roles.mentor')} required>
        <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange} required>
          <option value="">{t('form.selectMentor')}</option>
          {mentors.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={t('form.frequency')}>
          <select className="input" name="frequency" value={formData.frequency} onChange={handleChange}>
            <option value="Weekly">{t('form.weekly')}</option>
            <option value="Bi-weekly">{t('form.biweekly')}</option>
            <option value="Monthly">{t('form.monthly')}</option>
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
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate(`/groups/${id}`)}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
          {submitting ? t('common.saving') : t('form.saveChanges')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default EditGroup;
