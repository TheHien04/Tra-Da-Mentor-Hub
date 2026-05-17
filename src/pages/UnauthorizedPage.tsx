/**
 * Unauthorized Page
 */

import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldExclamation } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useAppTranslation } from '../hooks/useAppTranslation';
import './AuthPage.css';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { t } = useAppTranslation();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="auth-status-icon auth-status-icon--error mx-auto" aria-hidden>
          <HiOutlineShieldExclamation className="h-8 w-8" />
        </div>
        <h1 className="auth-title mt-4">{t('pages.unauthorized.title')}</h1>
        <p className="auth-subtitle">{t('pages.unauthorized.message')}</p>
        <div className="unauthorized-details">
          <p>{t('pages.unauthorized.currentRole', { role: state.user?.role || '—' })}</p>
          <p>{t('pages.unauthorized.contactSupport')}</p>
        </div>
        <div className="unauthorized-actions">
          <button type="button" className="btn btn-secondary w-full" onClick={() => navigate('/')}>
            ← {t('pages.unauthorized.backHome')}
          </button>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => {
              if (state.user?.role === 'mentor') navigate('/mentors');
              else if (state.user?.role === 'mentee') navigate('/mentees');
              else navigate('/');
            }}
          >
            {t('pages.unauthorized.goDashboard')} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
