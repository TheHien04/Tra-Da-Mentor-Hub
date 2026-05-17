import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { toast } from 'react-toastify';
import { groupApi, mentorApi } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';

const AddGroup = () => {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    mentorApi
      .getAll()
      .then((res) => setMentors(unwrapList(res)))
      .catch(() => toast.warn('Could not load mentors'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }
    if (!formData.mentorId) {
      setError('Select a mentor');
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
      toast.success(t('group.addSuccess', 'Group created'));
      navigate('/groups');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormShell
      title={t('group.addGroup', 'Add Group')}
      description={t('form.addGroupDesc')}
      backHref="/groups"
      onSubmit={handleSubmit}
    >
      {error && <Alert variant="error">{error}</Alert>}

      <FormField label="Group name" required>
        <input className="input" name="name" value={formData.name} onChange={handleChange} required />
      </FormField>

      <FormField label="Description">
        <textarea className="input min-h-[80px]" name="description" value={formData.description} onChange={handleChange} rows={3} />
      </FormField>

      <FormField label="Mentor" required>
        <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange} required>
          <option value="">Select mentor</option>
          {mentors.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Frequency">
          <select className="input" name="frequency" value={formData.frequency} onChange={handleChange}>
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </FormField>
        <FormField label="Day">
          <select className="input" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Time">
          <input type="time" className="input" name="time" value={formData.time} onChange={handleChange} />
        </FormField>
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/groups')}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating…' : 'Create group'}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default AddGroup;
