// src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './ForgotPasswordPage.css';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-icon">✓</div>
          <h2>Check Your Email</h2>
          <p>
            If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>
          <p className="note">The link will expire in 1 hour.</p>
          <div className="action-links">
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="header-icon">🔒</div>
        <h2>Forgot Password?</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="footer-links">
          <Link to="/login">← Back to Login</Link>
          <span className="separator">•</span>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};
