import { Link } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useGreeting } from '../../hooks/useGreeting';

export function DashboardHero() {
  const { t } = useAppTranslation();
  const greeting = useGreeting();
  const { state } = useAuth();
  const role = state.user?.role || 'user';
  const firstName = state.user?.name?.split(' ')[0];

  const roleLabel =
    role === 'admin'
      ? t('dashboard.roleAdmin')
      : role === 'mentor'
        ? t('dashboard.roleMentor')
        : role === 'mentee'
          ? t('dashboard.roleMentee')
          : t('common.role');

  const subtitle =
    role === 'mentor'
      ? t('dashboard.mentorSubtitle')
      : role === 'mentee'
        ? t('dashboard.menteeSubtitle')
        : role === 'admin'
          ? t('dashboard.adminSubtitle')
          : t('dashboard.defaultSubtitle');

  return (
    <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
      <div className="dashboard-hero__mesh" aria-hidden />
      <div className="dashboard-hero__inner">
        <div className="dashboard-hero__copy">
          <p className="dashboard-hero__eyebrow">{greeting}</p>
          <h1 id="dashboard-hero-title" className="dashboard-hero__title">
            {firstName ? t('dashboard.welcomeName', { name: firstName }) : t('dashboard.welcome')}
          </h1>
          <p className="dashboard-hero__subtitle">{subtitle}</p>
          <div className="dashboard-hero__badges">
            <span className="badge-pill badge-accent">{roleLabel}</span>
            <span className="dashboard-hero__live">
              <span className="dashboard-hero__live-dot" />
              {t('dashboard.livePlatform')}
            </span>
          </div>
        </div>
        <div className="dashboard-hero__actions">
          <Link to="/schedule" className="btn btn-primary dashboard-hero__cta">
            <HiOutlineCalendarDays className="h-4 w-4" />
            {t('nav.schedule')}
          </Link>
          <Link to="/insights" className="btn btn-secondary dashboard-hero__cta">
            <HiOutlineSparkles className="h-4 w-4" />
            {t('nav.insights')}
            <HiOutlineArrowRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </section>
  );
}
