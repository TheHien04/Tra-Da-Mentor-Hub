/**
 * Login Page - Modern Design with Tailwind CSS
 * User authentication page with international standard UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { loginFormSchema } from '../schemas/forms';
import { ZodError } from 'zod';
import env from '../config/env';
import { FaEye, FaEyeSlash, FaGoogle, FaGraduationCap, FaCopy, FaCheck } from 'react-icons/fa';

export default function LoginPage() {
  const { t } = useTranslation();
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

  // If already logged in, redirect to dashboard or previous page
  useEffect(() => {
    if (state.isAuthenticated) {
      // Get the page user tried to access before login
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location]);

  // Clear error messages when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear global error
    if (state.error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    try {
      loginFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues?.forEach((issue: any) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      // Redirect is handled by useEffect watching isAuthenticated
    } catch (error: any) {
      // Error is already in state.error from auth context
      console.error('Login error:', error);
    }
  };

  // Copy demo credentials
  const copyCredentials = () => {
    navigator.clipboard.writeText('admin@example.com / AdminPass123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
              <FaGraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.login')}
            </h2>
            <p className="text-gray-600">
              {t('app.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error Message */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-scale-in">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{state.error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                disabled={state.isLoading}
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={state.isLoading}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={state.isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state.isLoading}
              className="btn btn-primary w-full"
            >
              {state.isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Login with Google */}
            <a
              href={env.apiUrl.replace('/api', '') + '/api/auth/google'}
              className="btn btn-secondary w-full"
            >
              <FaGoogle className="h-5 w-5 text-red-500" />
              {t('auth.loginWithGoogle')}
            </a>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Demo Credentials</p>
              <button
                onClick={copyCredentials}
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                title={copied ? 'Copied!' : 'Click to copy'}
              >
                {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
              </button>
            </div>
            <code className="text-sm text-gray-800 font-mono block">
              admin@example.com / AdminPass123
            </code>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 relative z-10">
          &copy; 2026 Trà Đá Mentor. International mentor platform.
        </p>
      </div>
    </div>
  );
}
