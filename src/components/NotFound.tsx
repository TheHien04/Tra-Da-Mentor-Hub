import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';

const NotFound = () => {
  const { t } = useAppTranslation();

  return (
    <div className="not-found-page">
      <div className="not-found-page__glow" aria-hidden />
      <div className="not-found-card">
        <span className="not-found-card__code">404</span>
        <span className="not-found-card__icon">
          <HiOutlineMagnifyingGlass className="h-8 w-8" />
        </span>
        <h1 className="not-found-card__title">{t('pages.notFound.heading')}</h1>
        <p className="not-found-card__message">{t('pages.notFound.message')}</p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2 mt-2">
          <HiOutlineHome className="h-4 w-4" />
          {t('pages.notFound.home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
