/**
 * Admin – Invite mentor/mentee by email
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invitesApi } from '../services/api';
import {
  HiOutlineUserPlus,
  HiOutlineClipboardDocument,
  HiOutlineTrash,
  HiOutlineLink,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { PageShell, PageHeader, Alert, FormField, FormActions } from '../components/ui';
import { DetailCard } from '../components/ui/DetailShell';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useConfirm } from '../context/ConfirmContext';
import { useInvites } from '../hooks/queries/useInvites';
import { queryKeys } from '../hooks/queries/keys';

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success',
  expired: 'badge-full',
  used: 'badge-neutral',
};

const AdminInvitePage = () => {
  const { t, formatDate } = useAppTranslation();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const { data: invites = [], isLoading: listLoading } = useInvites();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'mentor' | 'mentee' | 'admin'>('mentee');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const stats = useMemo(
    () => ({
      total: invites.length,
      active: invites.filter((i) => i.status === 'active').length,
      expired: invites.filter((i) => i.status === 'expired').length,
    }),
    [invites]
  );

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: t('pages.admin.invite.statusActive'),
      expired: t('pages.admin.invite.statusExpired'),
      used: t('pages.admin.invite.statusUsed'),
    };
    return map[status] || status;
  };

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
      const body = res.data as { link?: string; data?: { link?: string } };
      const link = body?.link || body?.data?.link || '';
      setInviteLink(link);
      toast.success(t('pages.admin.invite.created'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.invites });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || t('pages.admin.invite.failed'));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success(t('pages.admin.invite.copied'));
  };

  const handleRevoke = async (token: string, inviteEmail: string) => {
    const ok = await confirm({
      title: t('pages.admin.invite.revoke'),
      message: t('pages.admin.invite.revokeConfirm', { email: inviteEmail }),
      confirmLabel: t('pages.admin.invite.revoke'),
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await invitesApi.revoke(token);
      toast.success(t('pages.admin.invite.revoked'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.invites });
    } catch {
      toast.error(t('pages.admin.invite.failed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.admin.invite.title')}
        description={t('pages.admin.invite.description')}
        icon={<HiOutlineUserPlus className="h-7 w-7" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: t('pages.admin.invite.statTotal'), value: stats.total },
          { label: t('pages.admin.invite.statActive'), value: stats.active },
          { label: t('pages.admin.invite.statExpired'), value: stats.expired },
        ].map((s) => (
          <div key={s.label} className="insights-stat-card">
            <p className="insights-stat-card__value">{s.value}</p>
            <p className="insights-stat-card__label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
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
                <input className="input text-sm flex-1" value={inviteLink} readOnly />
                <button type="button" className="btn btn-secondary shrink-0" onClick={() => copyLink(inviteLink)}>
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

      <DetailCard title={t('pages.admin.invite.historyTitle')}>
        {listLoading ? (
          <Skeleton count={3} />
        ) : invites.length === 0 ? (
          <EmptyState
            title={t('pages.admin.invite.historyEmpty')}
            description={t('pages.admin.invite.step1')}
          />
        ) : (
          <div className="crm-table-wrap -mx-2">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>{t('pages.admin.invite.colEmail')}</th>
                  <th>{t('pages.admin.invite.colRole')}</th>
                  <th>{t('pages.admin.invite.colStatus')}</th>
                  <th>{t('pages.admin.invite.colCreated')}</th>
                  <th>{t('pages.admin.invite.colExpires')}</th>
                  <th className="text-right">{t('pages.admin.invite.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.token}>
                    <td className="font-medium text-primary">{inv.email}</td>
                    <td className="capitalize">{inv.role}</td>
                    <td>
                      <span className={`badge-pill ${STATUS_BADGE[inv.status] || 'badge-neutral'}`}>
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="text-muted whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                    <td className="text-muted whitespace-nowrap">{formatDate(inv.expiresAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {inv.status === 'active' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              onClick={() => copyLink(inv.link)}
                              aria-label={t('pages.admin.invite.copied')}
                            >
                              <HiOutlineLink className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost-danger btn-icon"
                              onClick={() => handleRevoke(inv.token, inv.email)}
                              aria-label={t('pages.admin.invite.revoke')}
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailCard>
    </PageShell>
  );
};

export default AdminInvitePage;
