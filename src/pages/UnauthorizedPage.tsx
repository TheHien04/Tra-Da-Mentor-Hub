/**
 * Unauthorized Page
 * Displayed when user doesn't have required role for a page
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UnauthorizedPage.css';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { state } = useAuth();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🔒</div>
        <h1>Access Denied</h1>
        <p className="unauthorized-message">
          You don't have permission to access this page.
        </p>
        <div className="unauthorized-details">
          <p>
            Your current role: <strong>{state.user?.role || 'None'}</strong>
          </p>
          <p>If you believe this is incorrect, please contact support.</p>
        </div>
        <div className="unauthorized-actions">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <button 
            className="btn-dashboard" 
            onClick={() => {
              if (state.user?.role === 'mentor') navigate('/mentors');
              else if (state.user?.role === 'mentee') navigate('/mentees');
              else navigate('/dashboard');
            }}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
