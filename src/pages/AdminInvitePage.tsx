/**
 * Admin – Invite mentor/mentee by email
 */

import { useState } from 'react';
import { invitesApi } from '../services/api';
import { HiOutlineUserPlus, HiOutlineClipboardDocument } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert, FormField, FormActions } from '../components/ui';
import { DetailCard } from '../components/ui/DetailShell';
import { useAppTranslation } from '../hooks/useAppTranslation';

const AdminInvitePage = () => {
  const { t } = useAppTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee' | 'admin'>('mentee');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning(t('pages.admin.invite.enterEmail'));
      return;
    }
    setLoading(true);
    setInviteLink('');
    try {
      const res = await invitesApi.create({ email: email.trim(), role });
      setInviteLink(res.data?.link || '');
      toast.success(t('pages.admin.invite.created'));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.admin.invite.failed'));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    toast.success(t('pages.admin.invite.copied'));
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.admin.invite.title')}
        description={t('pages.admin.invite.description')}
        icon={<HiOutlineUserPlus className="h-7 w-7" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <FormField label={t('pages.admin.invite.email')} required>
            <input
              type="email"
              className="input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t('pages.admin.invite.role')}>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="mentee">{t('roles.mentee')}</option>
              <option value="mentor">{t('roles.mentor')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
          </FormField>
          <FormActions>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? t('pages.admin.invite.creating') : t('pages.admin.invite.create')}
            </button>
          </FormActions>

          {inviteLink && (
            <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--border-default)' }}>
              <label className="text-xs font-medium text-muted">{t('pages.admin.invite.inviteLink')}</label>
              <div className="flex gap-2">
                <input className="input text-sm" value={inviteLink} readOnly />
                <button type="button" className="btn btn-secondary shrink-0" onClick={copyLink}>
                  <HiOutlineClipboardDocument className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </form>

        <DetailCard title={t('pages.admin.invite.howTitle')}>
          <ol className="text-sm text-secondary space-y-2 list-decimal list-inside">
            <li>{t('pages.admin.invite.step1')}</li>
            <li>{t('pages.admin.invite.step2')}</li>
            <li>{t('pages.admin.invite.step3')}</li>
          </ol>
          <Alert variant="info" className="mt-4">
            {t('pages.admin.invite.smtpNote')}
          </Alert>
        </DetailCard>
      </div>
    </PageShell>
  );
};

export default AdminInvitePage;
