// src/components/CookieConsentBanner.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import './CookieConsentBanner.css';

export const CookieConsentBanner = () => {
  const { t } = useAppTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <section
      className="cookie-consent-banner"
      role="region"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-content">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-text">
          <h3 id="cookie-consent-title">{t('pages.cookie.title')}</h3>
          <p>
            {t('pages.cookie.message')}{' '}
            <Link to="/privacy-policy">{t('pages.cookie.privacyLink')}</Link>.
          </p>
        </div>
        <div className="cookie-actions">
          <button type="button" className="btn btn-secondary" onClick={handleDecline}>
            {t('pages.cookie.decline')}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleAccept}>
            {t('pages.cookie.acceptAll')}
          </button>
        </div>
      </div>
    </section>
  );
};
