import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineEllipsisHorizontal,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './features/ThemeToggle';
import { NotificationBell } from './features/NotificationBell';

const MobileNav = () => {
  const { t } = useAppTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const role = state.user?.role || 'user';
  const isAdmin = role === 'admin';
  const isMentorOrAdmin = role === 'mentor' || role === 'admin';

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const primary = [
    { to: '/', label: t('nav.dashboard'), icon: HiOutlineHome },
    { to: '/mentors', label: t('nav.mentors'), icon: HiOutlineAcademicCap },
    { to: '/slots', label: t('nav.slots'), icon: HiOutlineClock },
  ];

  const moreLinks = [
    { to: '/mentees', label: t('nav.mentees') },
    { to: '/groups', label: t('nav.groups') },
    { to: '/schedule', label: t('nav.schedule') },
    { to: '/session-logs', label: t('nav.sessions') },
    ...(isMentorOrAdmin ? [{ to: '/applications', label: t('nav.applications') }] : []),
    { to: '/analytics', label: t('nav.analytics') },
    { to: '/insights', label: t('nav.insights') },
    { to: '/testimonials', label: t('nav.testimonials') },
    ...(isAdmin
      ? [
          { to: '/admin/export', label: t('nav.export') },
          { to: '/admin/invite', label: t('nav.invites') },
          { to: '/admin/notifications', label: t('nav.notifications') },
        ]
      : []),
  ];

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="mobile-nav" aria-label={t('nav.mobileNav', 'Mobile navigation')}>
        {primary.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`mobile-nav-item ${isActive(to) ? 'active' : ''}`}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`mobile-nav-item ${moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
        >
          <HiOutlineEllipsisHorizontal className="h-5 w-5" aria-hidden />
          <span>{t('nav.more', 'More')}</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="mobile-nav-sheet" role="dialog" aria-modal="true">
          <div className="mobile-nav-sheet-backdrop" onClick={() => setMoreOpen(false)} aria-hidden />
          <div className="mobile-nav-sheet-panel">
            <div className="mobile-nav-sheet-header">
              <strong>{state.user?.name || t('nav.more', 'More')}</strong>
              <button
                type="button"
                className="mobile-nav-close"
                onClick={() => setMoreOpen(false)}
                aria-label={t('common.close')}
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
            <div className="mobile-nav-sheet-tools">
              <NotificationBell />
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <div className="mobile-nav-sheet-links">
              {moreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActive(link.to) ? 'active' : ''}
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mobile-nav-sheet-legal">
              <Link to="/pricing" onClick={() => setMoreOpen(false)}>
                {t('nav.pricing')}
              </Link>
              <span>·</span>
              <Link to="/privacy-policy" onClick={() => setMoreOpen(false)}>
                {t('footer.privacy')}
              </Link>
              <span>·</span>
              <Link to="/terms-of-service" onClick={() => setMoreOpen(false)}>
                {t('footer.terms')}
              </Link>
            </div>
            <button type="button" className="mobile-nav-logout" onClick={handleLogout}>
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
