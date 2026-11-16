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
    <section className="dashboard-hero dashboard-hero--work" aria-labelledby="dashboard-hero-title">
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
          </div>
        </div>
      </div>
    </section>
  );
}
