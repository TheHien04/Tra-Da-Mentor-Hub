// src/pages/VerifyEmailPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './VerifyEmailPage.css';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
        toast.error('Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-text">Redirecting to login page...</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="action-links">
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
              <Link to="/resend-verification" className="btn btn-primary">
                Resend Verification
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
