// src/components/CookieConsentBanner.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsentBanner.css';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
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
    
    // Optionally: Disable analytics/tracking scripts here
    console.log('Cookie consent declined - analytics disabled');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-content">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-text">
          <h3>We Value Your Privacy</h3>
          <p>
            We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
            By clicking "Accept All", you consent to our use of cookies.{' '}
            <Link to="/privacy-policy">Read our Privacy Policy</Link>.
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn btn-secondary" onClick={handleDecline}>
            Decline
          </button>
          <button className="btn btn-primary" onClick={handleAccept}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
