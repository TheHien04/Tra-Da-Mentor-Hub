/**
 * Register Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { invitesApi } from '../services/api';
import { FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { registerFormSchema } from '../schemas/forms';
import { ZodError } from 'zod';
import { AuthPageFooter } from '../components/AuthPageFooter';
import './AuthPage.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'user' | 'mentor' | 'mentee' | 'admin';
  inviteToken?: string;
}

function strengthLevel(score: number): number {
  return Math.min(5, Math.max(0, score));
}

export default function RegisterPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const { state, register, clearError } = useAuth();

  const [inviteLoading, setInviteLoading] = useState(Boolean(inviteToken));
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLocked, setInviteLocked] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  useEffect(() => {
    if (!inviteToken) {
      setInviteLoading(false);
      return;
    }
    setInviteLoading(true);
    invitesApi
      .validate(inviteToken)
      .then((res) => {
        const data = res.data as { valid?: boolean; email?: string; role?: string; message?: string };
        if (!data?.valid || !data.email || !data.role) {
          setInviteError(data?.message || t('registerPage.inviteInvalid'));
          return;
        }
        const role = data.role as FormData['role'];
        setFormData((prev) => ({
          ...prev,
          email: data.email!,
          role: ['mentor', 'mentee', 'admin', 'user'].includes(role) ? role : 'mentee',
          inviteToken,
        }));
        setInviteLocked(true);
      })
      .catch(() => setInviteError(t('registerPage.inviteInvalid')))
      .finally(() => setInviteLoading(false));
  }, [inviteToken, t]);

  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (state.error) clearError();
  };

  const validateForm = (): boolean => {
    try {
      registerFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues?.forEach((issue) => {
          const field = issue.path?.[0];
          if (field) {
            const key = field as string;
            newErrors[key] = newErrors[key]
              ? `${newErrors[key]}; ${issue.message}`
              : issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await register({
        ...formData,
        inviteToken: inviteToken || formData.inviteToken,
      });
    } catch (error: unknown) {
      console.error('Register error:', error);
    }
  };

  const level = strengthLevel(passwordStrength);

  const strengthLabel = () => {
    if (passwordStrength === 0) return t('registerPage.strengthNone');
    if (passwordStrength <= 2) return t('registerPage.strengthWeak');
    if (passwordStrength <= 3) return t('registerPage.strengthFair');
    if (passwordStrength <= 4) return t('registerPage.strengthGood');
    return t('registerPage.strengthStrong');
  };

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell-wide">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="auth-icon">
              <FaUserPlus className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="auth-title">{t('registerPage.brand')}</h1>
            <p className="auth-subtitle">{t('registerPage.subtitle')}</p>
          </div>

          {inviteLoading && (
            <p className="text-sm text-muted text-center mb-4">{t('registerPage.inviteLoading')}</p>
          )}
          {inviteError && (
            <div className="auth-error mb-4" role="alert">
              {inviteError}
            </div>
          )}
          {inviteLocked && !inviteError && (
            <p className="text-sm text-center mb-4" style={{ color: 'var(--accent-subtle-fg)' }}>
              {t('registerPage.inviteApplied', { role: t(`roles.${formData.role}`) })}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {state.error && (
              <div className="auth-error" role="alert">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('auth.namePlaceholder')}
                disabled={state.isLoading}
                className={`input ${errors.name ? 'input-error' : ''}`}
              />
              {errors.name && <p className="auth-field-error">{errors.name}</p>}
            </div>

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
                disabled={state.isLoading || inviteLocked}
                readOnly={inviteLocked}
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="auth-field-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-secondary mb-2">
                {t('registerPage.joinAs')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={state.isLoading || inviteLocked}
                className={`input ${errors.role ? 'input-error' : ''}`}
              >
                <option value="user">{t('registerPage.roleUser')}</option>
                <option value="mentee">{t('registerPage.roleMentee')}</option>
                <option value="mentor">{t('registerPage.roleMentor')}</option>
                {formData.role === 'admin' && <option value="admin">{t('roles.admin')}</option>}
              </select>
              {errors.role && <p className="auth-field-error">{errors.role}</p>}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('registerPage.passwordPlaceholder')}
                  disabled={state.isLoading}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={state.isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary p-2"
                  aria-label={
                    showPassword ? t('registerPage.hidePassword') : t('registerPage.showPassword')
                  }
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="auth-password-strength">
                  <div className="auth-strength-bar">
                    <div
                      className={`auth-strength-fill auth-strength-${level}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`auth-strength-label auth-strength-${level}`}>
                    {strengthLabel()}
                  </span>
                </div>
              )}

              {errors.password && <p className="auth-field-error">{errors.password}</p>}

              {formData.password && (
                <div className="auth-requirements">
                  <p className="auth-requirements-title">{t('registerPage.requirementsTitle')}</p>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'met' : ''}>
                      {t('registerPage.reqLength')}
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                      {t('registerPage.reqUpper')}
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                      {t('registerPage.reqLower')}
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                      {t('registerPage.reqNumber')}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-secondary mb-2"
              >
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('registerPage.confirmPlaceholder')}
                  disabled={state.isLoading}
                  className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={state.isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary p-2"
                  aria-label={
                    showConfirmPassword
                      ? t('registerPage.hidePassword')
                      : t('registerPage.showPassword')
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-field-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={state.isLoading}>
              {state.isLoading ? t('registerPage.creating') : t('auth.createAccount')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t auth-divider-line" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 auth-divider-text">{t('registerPage.divider')}</span>
            </div>
          </div>

          <Link to="/login" className="btn btn-secondary w-full">
            {t('registerPage.loginHere')}
          </Link>

          <p className="auth-register-text mt-4 text-center">
            <Link to="/pricing" className="auth-link-muted">
              {t('auth.viewPricing')}
            </Link>
          </p>
        </div>

        <AuthPageFooter showCopyright={false} />
      </div>
    </div>
  );
}
