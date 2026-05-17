import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineArrowUpTray,
  HiOutlineUserPlus,
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import logoImg from '../assets/logo.png';
import { ThemeToggle } from './features/ThemeToggle';
import { NotificationBell } from './features/NotificationBell';

const Navbar = () => {
  const { t } = useAppTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = state.user?.role || 'user';
  const isMentorOrAdmin = role === 'mentor' || role === 'admin';
  const isAdmin = role === 'admin';

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

  const isActive = (to: string, matchPrefix = false) => {
    if (matchPrefix && to !== '/') {
      return location.pathname === to || location.pathname.startsWith(`${to}/`);
    }
    return location.pathname === to;
  };

  const navLink = (to: string, label: string, icon: React.ReactNode, matchPrefix = false) => (
    <Link to={to} className={`nav-item ${isActive(to, matchPrefix) ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );

  const iconClass = 'h-[18px] w-[18px]';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logoImg} alt="Tea Mentor" />
        <h1>Tea Mentor</h1>
      </Link>

      <div className="flex flex-col gap-0.5 px-1 py-2 flex-1 overflow-y-auto">
        {navLink('/', t('nav.dashboard'), <HiOutlineHome className={iconClass} />)}
        {navLink('/mentors', t('nav.mentors'), <HiOutlineAcademicCap className={iconClass} />, true)}
        {navLink('/mentees', t('nav.mentees'), <HiOutlineUserGroup className={iconClass} />, true)}
        {navLink('/groups', t('nav.groups'), <HiOutlineUsers className={iconClass} />, true)}
        {navLink('/schedule', t('nav.schedule'), <HiOutlineCalendar className={iconClass} />, true)}
        {navLink('/slots', t('nav.slots'), <HiOutlineClock className={iconClass} />, true)}
        {navLink('/session-logs', t('nav.sessions'), <HiOutlineClipboardDocumentList className={iconClass} />, true)}

        {isMentorOrAdmin &&
          navLink('/applications', t('nav.applications'), <HiOutlineDocumentText className={iconClass} />, true)}

        {navLink('/analytics', t('nav.analytics'), <HiOutlineChartBar className={iconClass} />, true)}
        {navLink('/insights', t('nav.insights'), <HiOutlineSparkles className={iconClass} />, true)}

        {isAdmin && (
          <>
            {navLink('/admin/export', t('nav.export'), <HiOutlineArrowUpTray className={iconClass} />, true)}
            {navLink('/admin/invite', t('nav.invites'), <HiOutlineUserPlus className={iconClass} />, true)}
            {navLink('/admin/notifications', t('nav.notifications'), <HiOutlineBell className={iconClass} />, true)}
          </>
        )}

        {navLink('/testimonials', t('nav.testimonials'), <HiOutlineChatBubbleLeftRight className={iconClass} />, true)}
      </div>

      <div className="navbar-footer">
        <div className="flex items-center gap-2 px-2 mb-2 text-[10px] text-muted">
          <Link to="/pricing" className="hover:text-[var(--accent)]">{t('nav.pricing')}</Link>
          <span>·</span>
          <Link to="/privacy-policy" className="hover:text-[var(--accent)]">{t('footer.privacy')}</Link>
          <span>·</span>
          <Link to="/terms-of-service" className="hover:text-[var(--accent)]">{t('footer.terms')}</Link>
        </div>
        <div className="flex items-center gap-2 px-2 mb-3">
          <NotificationBell />
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <button
          type="button"
          className="search-trigger mx-2 mb-3 w-[calc(100%-1rem)] flex items-center justify-between gap-2 px-3 py-2 text-xs"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <span>{t('command.search', 'Quick search')}</span>
          <kbd className="rounded px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="navbar-profile flex justify-center" ref={dropdownRef}>
          <button
            type="button"
            className="profile-button navbar-avatar w-9 h-9 rounded-full text-sm font-semibold text-white cursor-pointer flex items-center justify-center transition-transform hover:scale-105"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            {state.user?.name?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-name">{state.user?.name}</div>
                <div className="profile-dropdown-email">{state.user?.email}</div>
                <div className="navbar-role-badge">
                  {t('common.role')}: {state.user?.role}
                </div>
              </div>
              <button type="button" className="profile-dropdown-logout flex items-center gap-2" onClick={handleLogout}>
                <HiOutlineArrowRightOnRectangle className="h-4 w-4 shrink-0" />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
