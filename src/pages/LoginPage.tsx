/**
 * Login Page - Modern Design with Tailwind CSS
 * User authentication page with international standard UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAuth } from '../hooks/useAuth';
import { loginFormSchema } from '../schemas/forms';
import { ZodError } from 'zod';
import env from '../config/env';
import { FaEye, FaEyeSlash, FaGoogle, FaGraduationCap, FaCopy, FaCheck } from 'react-icons/fa';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

export default function LoginPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, login, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (state.error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    try {
      loginFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path?.[0];
          if (field) {
            newErrors[field as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error: unknown) {
      console.error('Login error:', error);
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText('admin@example.com / AdminPass123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleAuthUrl = `${env.apiUrl.replace(/\/api\/?$/, '')}/api/auth/google`;

  return (
    <div className="auth-page">
      <div className="max-w-md w-full space-y-8">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="auth-icon">
              <FaGraduationCap className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="auth-title">{t('auth.login')}</h1>
            <p className="auth-subtitle">{t('auth.signInSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {state.error && (
              <div className="auth-error flex items-start gap-3 animate-scale-in" role="alert">
                <p>{state.error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('auth.emailPlaceholder')}
                disabled={state.isLoading}
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('auth.loginPasswordPlaceholder')}
                  disabled={state.isLoading}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={state.isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors p-2"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="auth-link-muted">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <button type="submit" disabled={state.isLoading} className="btn btn-primary w-full">
              {state.isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t auth-divider-line" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 auth-divider-text">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <a href={googleAuthUrl} className="btn btn-secondary w-full">
              <FaGoogle className="h-5 w-5 text-red-500" aria-hidden />
              {t('auth.loginWithGoogle')}
            </a>
          </form>

          {!import.meta.env.PROD && (
            <div className="mt-6 p-4 rounded-lg border surface-muted">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  {t('auth.demoCredentials')}
                </p>
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="text-muted hover:text-secondary transition-colors"
                  title={copied ? t('auth.copied') : t('auth.copyCredentials')}
                >
                  {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
                </button>
              </div>
              <code className="text-sm text-primary font-mono block">
                admin@example.com / AdminPass123
              </code>
            </div>
          )}

          <div className="mt-6 text-center space-y-3">
            <p className="auth-register-text">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="auth-register-link">
                {t('auth.createAccount')}
              </Link>
            </p>
            <p className="auth-register-text">
              <Link to="/pricing" className="auth-link-muted">
                {t('auth.viewPricing')}
              </Link>
            </p>
          </div>
        </div>

        <AuthPageFooter />
      </div>
    </div>
  );
}
