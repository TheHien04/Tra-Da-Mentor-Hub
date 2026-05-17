import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { menteeApi, mentorApi, groupApi } from '../services/api';
import { unwrapList, getApiErrorMessage } from '../lib/apiHelpers';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { Alert } from './ui/Alert';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

const TRACK_VALUES = ['tech', 'business', 'design'] as const;

const EditMentee = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    if (!id) return;
    Promise.all([menteeApi.getById(id), mentorApi.getAll(), groupApi.getAll()])
      .then(([meRes, mRes, gRes]) => {
        const me = meRes.data;
        setMentors(unwrapList(mRes));
        setGroups(unwrapList(gRes));
        setFormData({
          name: me.name || '',
          email: me.email || '',
          phone: me.phone || '',
          school: me.school || '',
          track: me.track || 'tech',
          interests: Array.isArray(me.interests) ? me.interests.join(', ') : '',
          progress: me.progress ?? 0,
          mentorId: me.mentorId || me.mentor || '',
          groupId: me.groupId || me.group || '',
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
      [name]: name === 'progress' ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      await menteeApi.update(id, {
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
      });
      toast.success(t('detail.menteeUpdated'));
      navigate(`/mentees/${id}`);
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
    <FormShell title={t('mentee.editMentee')} backHref={`/mentees/${id}`} onSubmit={handleSubmit}>
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
      <FormField label={t('detail.school')} required>
        <input className="input" name="school" value={formData.school} onChange={handleChange} required />
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
        <FormField label={t('form.progressPercent')}>
          <input type="number" min={0} max={100} className="input" name="progress" value={formData.progress} onChange={handleChange} />
        </FormField>
      </div>
      <FormField label={t('form.interests')}>
        <input className="input" name="interests" value={formData.interests} onChange={handleChange} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('roles.mentor')}>
          <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange}>
            <option value="">{t('form.none')}</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('group.title')}>
          <select className="input" name="groupId" value={formData.groupId} onChange={handleChange}>
            <option value="">{t('form.none')}</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormActions>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate(`/mentees/${id}`)}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
          {submitting ? t('common.saving') : t('form.saveChanges')}
        </button>
      </FormActions>
    </FormShell>
  );
};

export default EditMentee;
