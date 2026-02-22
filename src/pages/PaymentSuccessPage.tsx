// src/pages/PaymentSuccessPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccessPage.css';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = '/dashboard';
    }
  }, [countdown]);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for upgrading your subscription.</p>
        <p className="session-id">Session ID: {sessionId}</p>
        <p className="redirect-message">
          Redirecting to dashboard in {countdown} seconds...
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Go to Dashboard Now
        </Link>
      </div>
    </div>
  );
};
