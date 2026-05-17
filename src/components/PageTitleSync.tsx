import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';

const APP_NAME = 'Trà Đá Mentor';

export function PageTitleSync() {
  const { pathname } = useLocation();
  const { t } = useAppTranslation();

  useEffect(() => {
    const map: Record<string, string> = {
      '/': t('nav.dashboard'),
      '/login': t('auth.login'),
      '/register': t('auth.register'),
      '/schedule': t('nav.schedule'),
      '/mentors': t('nav.mentors'),
      '/mentees': t('nav.mentees'),
      '/groups': t('nav.groups'),
      '/analytics': t('nav.analytics'),
      '/testimonials': t('nav.testimonials'),
      '/pricing': t('pages.pricing.title', 'Pricing'),
      '/privacy-policy': t('legal.privacy.title'),
      '/terms-of-service': t('legal.terms.title'),
      '/payment/success': t('legal.paymentSuccess.title'),
      '/unauthorized': t('pages.unauthorized.title'),
    };

    const match = Object.keys(map)
      .filter((p) => p !== '/' && (pathname === p || pathname.startsWith(`${p}/`)))
      .sort((a, b) => b.length - a.length)[0];

    const page = pathname === '/' ? map['/'] : match ? map[match] : '';
    document.title = page ? `${page} · ${APP_NAME}` : APP_NAME;
  }, [pathname, t]);

  return null;
}
