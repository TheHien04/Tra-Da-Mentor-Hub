import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { menteeApi, uploadsApi } from '../services/api';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { parseForm } from '../lib/zodForm';
import { getTrackOptions } from '../lib/trackOptions';
import { editMenteeFormSchema } from '../schemas/forms';
import { useMentors } from '../hooks/queries/useMentors';
import { useGroups } from '../hooks/queries/useGroups';
import { FormShell, FormField, FormActions } from './ui/FormShell';
import { AvatarUploadField } from './ui/AvatarUploadField';
import { Alert } from './ui/Alert';
import Skeleton from './Skeleton';
import { useAppTranslation } from '../hooks/useAppTranslation';

const EditMentee = () => {
  const { t } = useAppTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trackOptions = getTrackOptions(t);
  const { data: mentors = [] } = useMentors();
  const { data: groups = [] } = useGroups();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    avatarUrl: '',
  });

  useEffect(() => {
    if (!id) return;
    menteeApi
      .getById(id)
      .then((res) => {
        const me = res.data;
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
          avatarUrl: me.avatarUrl || '',
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAvatarUpload = async (dataUrl: string) => {
    if (!id) return;
    const res = await uploadsApi.avatar({ entityType: 'mentee', entityId: id, dataUrl });
    setFormData((prev) => ({ ...prev, avatarUrl: res.data.data.avatarUrl }));
    toast.success(t('form.avatarUpdated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const parsed = parseForm(editMenteeFormSchema, formData, t);
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }

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
        avatarUrl: formData.avatarUrl || undefined,
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

      <FormField label={t('form.avatar')}>
        <AvatarUploadField
          name={formData.name || 'Mentee'}
          track={formData.track}
          avatarUrl={formData.avatarUrl}
          onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
          onUpload={handleAvatarUpload}
        />
      </FormField>

      <FormField label={t('form.fullName')} required>
        <input className={`input ${errors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} required />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </FormField>
      <FormField label={t('auth.email')} required>
        <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} required />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </FormField>
      <FormField label={t('detail.phone')}>
        <input type="tel" className="input" name="phone" value={formData.phone} onChange={handleChange} />
      </FormField>
      <FormField label={t('detail.school')} required>
        <input className={`input ${errors.school ? 'input-error' : ''}`} name="school" value={formData.school} onChange={handleChange} required />
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
          {errors.progress && <p className="text-xs text-red-600 mt-1">{errors.progress}</p>}
        </FormField>
      </div>
      <FormField label={t('form.skills')}>
        <input className="input" name="interests" value={formData.interests} onChange={handleChange} placeholder={t('lists.interestsPlaceholder')} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={t('mentor.title')}>
          <select className="input" name="mentorId" value={formData.mentorId} onChange={handleChange}>
            <option value="">—</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('group.title')}>
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
