import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

export const ForgotPasswordPage = () => {
  const { t } = useAppTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t('pages.forgotPassword.enterEmail'));
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success(t('pages.forgotPassword.success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('pages.forgotPassword.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          {submitted ? (
            <>
              <div className="auth-status-icon auth-status-icon--success" aria-hidden>
                ✓
              </div>
              <h1 className="auth-title">{t('pages.forgotPassword.checkEmail')}</h1>
              <p className="auth-subtitle">{t('pages.forgotPassword.sentTo', { email })}</p>
              <p className="auth-note">{t('pages.forgotPassword.expires')}</p>
              <div className="auth-actions">
                <Link to="/login" className="btn btn-primary w-full">
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="auth-icon">
                  <HiOutlineLockClosed className="h-7 w-7" aria-hidden />
                </div>
                <h1 className="auth-title">{t('pages.forgotPassword.title')}</h1>
                <p className="auth-subtitle">{t('pages.forgotPassword.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="input"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? t('pages.forgotPassword.sending') : t('auth.sendResetLink')}
                </button>
              </form>

              <p className="auth-register-text mt-6 text-center">
                <Link to="/login" className="auth-link-muted">
                  ← {t('auth.backToLogin')}
                </Link>
                <span className="mx-2 text-muted">·</span>
                <Link to="/register" className="auth-register-link">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </>
          )}
        </div>
        <AuthPageFooter showCopyright={false} />
      </div>
    </div>
  );
};
