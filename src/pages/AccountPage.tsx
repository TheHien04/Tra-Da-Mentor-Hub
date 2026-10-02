import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getApiErrorMessage } from '../lib/apiHelpers';
import { PageShell, PageHeader, FormField, FormActions } from '../components/ui';
import { DetailCard } from '../components/ui/DetailShell';

export default function AccountPage() {
  const { t } = useAppTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [busy, setBusy] = useState<'password' | 'export' | 'delete' | null>(null);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.warning(t('pages.account.passwordMismatch'));
      return;
    }
    setBusy('password');
    try {
      await authApi.changePassword({ currentPassword, password, confirmPassword });
      toast.success(t('pages.account.passwordSaved'));
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const download = async () => {
    setBusy('export');
    try {
      const res = await authApi.exportAccount();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tra-da-mentor-account.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t('pages.account.exported'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy('delete');
    try {
      await authApi.deleteAccount(deletePassword);
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setBusy(null);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('pages.account.title')}
        description={t('pages.account.description')}
        icon={<HiOutlineUserCircle className="h-7 w-7" />}
      />
      <div className="grid gap-5 max-w-2xl">
        <DetailCard title={t('pages.account.passwordTitle')}>
          <form onSubmit={changePassword} className="grid gap-3">
            <FormField label={t('pages.account.currentPassword')}>
              <input
                type="password"
                className="input w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </FormField>
            <FormField label={t('pages.account.newPassword')}>
              <input
                type="password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </FormField>
            <FormField label={t('pages.account.confirmPassword')}>
              <input
                type="password"
                className="input w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </FormField>
            <FormActions>
              <button type="submit" className="btn btn-primary" disabled={busy === 'password'}>
                {t('pages.account.savePassword')}
              </button>
            </FormActions>
          </form>
        </DetailCard>

        <DetailCard title={t('pages.account.exportTitle')}>
          <p className="text-sm text-secondary mb-4">{t('pages.account.exportBody')}</p>
          <button type="button" className="btn btn-secondary" onClick={() => void download()} disabled={busy === 'export'}>
            {t('pages.account.exportAction')}
          </button>
        </DetailCard>

        <DetailCard title={t('pages.account.deleteTitle')}>
          <p className="text-sm text-secondary mb-4">{t('pages.account.deleteBody')}</p>
          <form onSubmit={remove} className="grid gap-3">
            <FormField label={t('pages.account.currentPassword')}>
              <input
                type="password"
                className="input w-full"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </FormField>
            <button type="submit" className="btn btn-ghost-danger w-fit" disabled={busy === 'delete'}>
              {t('pages.account.deleteAction')}
            </button>
          </form>
        </DetailCard>
      </div>
    </PageShell>
  );
}
