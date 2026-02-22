import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = state.user?.role || 'user';
  const isMentorOrAdmin = role === 'mentor' || role === 'admin';
  const isAdmin = role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logoImg} alt="Tea Mentor Logo" />
        <h1>Tea Mentor</h1>
      </Link>
      
      <Link 
        to="/" 
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        {t('nav.dashboard')}
      </Link>
      
      <Link 
        to="/mentors" 
        className={`nav-item ${location.pathname.startsWith('/mentors') ? 'active' : ''}`}
      >
        {t('nav.mentors')}
      </Link>
      
      <Link 
        to="/mentees" 
        className={`nav-item ${location.pathname.startsWith('/mentees') ? 'active' : ''}`}
      >
        {t('nav.mentees')}
      </Link>
      
      <Link 
        to="/groups" 
        className={`nav-item ${location.pathname.startsWith('/groups') ? 'active' : ''}`}
      >
        {t('nav.groups')}
      </Link>
      
      <Link 
        to="/schedule" 
        className={`nav-item ${location.pathname.startsWith('/schedule') ? 'active' : ''}`}
      >
        📅 {t('nav.schedule')}
      </Link>
      <Link 
        to="/slots" 
        className={`nav-item ${location.pathname.startsWith('/slots') ? 'active' : ''}`}
      >
        🕐 {t('nav.slots')}
      </Link>

      <Link 
        to="/session-logs" 
        className={`nav-item ${location.pathname.startsWith('/session-logs') ? 'active' : ''}`}
      >
        📋 {t('nav.sessions')}
      </Link>

      {isMentorOrAdmin && (
        <Link 
          to="/applications" 
          className={`nav-item ${location.pathname.startsWith('/applications') ? 'active' : ''}`}
        >
          📝 {t('nav.applications')}
        </Link>
      )}
      
      <Link 
        to="/analytics" 
        className={`nav-item ${location.pathname.startsWith('/analytics') ? 'active' : ''}`}
      >
        📊 {t('nav.analytics')}
      </Link>

      {isAdmin && (
        <>
          <Link 
            to="/admin/export" 
            className={`nav-item ${location.pathname.startsWith('/admin/export') ? 'active' : ''}`}
          >
            📤 {t('nav.export')}
          </Link>
          <Link 
            to="/admin/invite" 
            className={`nav-item ${location.pathname.startsWith('/admin/invite') ? 'active' : ''}`}
          >
            👤 {t('nav.invites')}
          </Link>
          <Link 
            to="/admin/notifications" 
            className={`nav-item ${location.pathname.startsWith('/admin/notifications') ? 'active' : ''}`}
          >
            📬 {t('nav.notifications')}
          </Link>
        </>
      )}
      
      <Link 
        to="/testimonials" 
        className={`nav-item ${location.pathname.startsWith('/testimonials') ? 'active' : ''}`}
      >
        💬 {t('nav.testimonials')}
      </Link>

      {/* Language Switcher */}
      <div style={{ marginLeft: 'auto', marginRight: '16px' }}>
        <LanguageSwitcher />
      </div>

      {/* User Profile Dropdown */}
      <div className="navbar-profile" ref={dropdownRef} style={{ position: 'relative' }}>
        <button 
          className="profile-button navbar-avatar"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {state.user?.name?.charAt(0).toUpperCase() || 'U'}
        </button>

        {showDropdown && (
          <div 
            className="profile-dropdown"
            style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: '12px 0',
              minWidth: '200px',
              zIndex: 1000,
            }}
          >
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                {state.user?.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {state.user?.email}
              </div>
              <div className="navbar-role-badge" style={{ 
                fontSize: '12px', 
                color: 'var(--primary-color)', 
                marginTop: '4px',
                fontWeight: '600'
              }}>
                {t('common.role')}: {state.user?.role}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: 'transparent',
                color: '#e74c3c',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              🚪 {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 