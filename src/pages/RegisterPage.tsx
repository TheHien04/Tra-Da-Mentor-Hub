/**
 * Register Page
 * User registration page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { registerFormSchema } from '../schemas/forms';
import { ZodError } from 'zod';
import './RegisterPage.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'user' | 'mentor' | 'mentee';
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { state, register, clearError } = useAuth();

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

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  // Calculate password strength
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

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      registerFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues?.forEach((issue: any) => {
          const field = issue.path?.[0];
          if (field) {
            // Combine multiple errors for same field
            if (newErrors[field as string]) {
              newErrors[field as string] += '; ' + issue.message;
            } else {
              newErrors[field as string] = issue.message;
            }
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
      await register(formData);
      // Auto-login successful, redirect handled by useEffect
    } catch (error: any) {
      // Error is already in state.error from auth context
      console.error('Register error:', error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return '#e0e0e0';
    if (passwordStrength <= 2) return '#f44336';
    if (passwordStrength <= 3) return '#ff9800';
    if (passwordStrength <= 4) return '#ffc107';
    return '#4caf50';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>🎓 Trà Đá Mentor</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Global Error Message */}
          {state.error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{state.error}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              disabled={state.isLoading}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className="field-error">
                <span className="error-icon">✕</span>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              disabled={state.isLoading}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="field-error">
                <span className="error-icon">✕</span>
                {errors.email}
              </span>
            )}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">I want to join as:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={state.isLoading}
              className={errors.role ? 'input-error' : ''}
            >
              <option value="user">User (Learn)</option>
              <option value="mentee">Mentee (Get Mentorship)</option>
              <option value="mentor">Mentor (Share Knowledge)</option>
            </select>
            {errors.role && (
              <span className="field-error">
                <span className="error-icon">✕</span>
                {errors.role}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a strong password"
                disabled={state.isLoading}
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={state.isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  ></div>
                </div>
                <span
                  className="strength-label"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            )}

            {errors.password && (
              <span className="field-error">
                <span className="error-icon">✕</span>
                {errors.password}
              </span>
            )}

            {/* Password Requirements */}
            {formData.password && (
              <div className="password-requirements">
                <p className="requirements-label">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={formData.password.length >= 8 ? 'met' : ''}>
                    At least 8 characters {formData.password.length >= 8 ? '✓' : ''}
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                    Uppercase letter {/[A-Z]/.test(formData.password) ? '✓' : ''}
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                    Lowercase letter {/[a-z]/.test(formData.password) ? '✓' : ''}
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
                    Number {/[0-9]/.test(formData.password) ? '✓' : ''}
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                disabled={state.isLoading}
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={state.isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error">
                <span className="error-icon">✕</span>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>Already have an account?</span>
        </div>

        {/* Login Link */}
        <Link to="/login" className="btn btn-secondary btn-full">
          Login Here
        </Link>
      </div>
    </div>
  );
}
