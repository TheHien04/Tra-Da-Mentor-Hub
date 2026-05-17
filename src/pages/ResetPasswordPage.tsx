import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineKey } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

export const ResetPasswordPage = () => {
  const { t } = useAppTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('pages.resetPassword.invalidResetLink'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('validation.passwordMin'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('validation.passwordMatch'));
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, { password, confirmPassword });
      setSuccess(true);
      toast.success(t('pages.resetPassword.success'));

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('pages.resetPassword.failed'));
    } finally {
      setLoading(false);
    }
  };

  const invalidLinkView = (
    <div className="auth-card">
      <div className="auth-status-icon auth-status-icon--error" aria-hidden>
        !
      </div>
      <h1 className="auth-title">{t('pages.resetPassword.invalidLink')}</h1>
      <p className="auth-subtitle">{t('pages.resetPassword.invalidLinkDesc')}</p>
      <div className="auth-actions">
        <Link to="/forgot-password" className="btn btn-primary w-full">
          {t('pages.resetPassword.requestNewLink')}
        </Link>
      </div>
    </div>
  );

  const successView = (
    <div className="auth-card">
      <div className="auth-status-icon auth-status-icon--success" aria-hidden>
        ✓
      </div>
      <h1 className="auth-title">{t('pages.resetPassword.successTitle')}</h1>
      <p className="auth-subtitle">{t('pages.resetPassword.successMessage')}</p>
      <p className="auth-note">{t('pages.resetPassword.redirecting')}</p>
      <div className="auth-actions">
        <Link to="/login" className="btn btn-primary w-full">
          {t('pages.resetPassword.goToLogin')}
        </Link>
      </div>
    </div>
  );

  const formView = (
    <div className="auth-card">
      <div className="text-center mb-8">
        <div className="auth-icon">
          <HiOutlineKey className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="auth-title">{t('pages.resetPassword.title')}</h1>
        <p className="auth-subtitle">{t('pages.resetPassword.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
            {t('pages.resetPassword.newPassword')}
          </label>
          <input
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('pages.resetPassword.passwordPlaceholder')}
            className="input"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-2">
            {t('pages.resetPassword.confirmPassword')}
          </label>
          <input
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('pages.resetPassword.confirmPlaceholder')}
            className="input"
            required
            minLength={8}
          />
        </div>

        <div className="auth-requirements">
          <p className="auth-requirements-title">{t('pages.resetPassword.requirementsTitle')}</p>
          <ul>
            <li>{t('pages.resetPassword.reqMinLength')}</li>
            <li>{t('pages.resetPassword.reqLettersNumbers')}</li>
            <li>{t('pages.resetPassword.reqAvoidCommon')}</li>
          </ul>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? t('pages.resetPassword.resetting') : t('pages.resetPassword.submit')}
        </button>
      </form>

      <p className="auth-register-text mt-6 text-center">
        <Link to="/login" className="auth-link-muted">
          ← {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {!token ? invalidLinkView : success ? successView : formView}
        <AuthPageFooter showCopyright={false} />
      </div>
    </div>
  );
};
