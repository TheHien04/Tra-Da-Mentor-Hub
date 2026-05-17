import { Link } from 'react-router-dom';
import { HiOutlineExclamationTriangle, HiOutlineHome } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';

const NotFound = () => {
  const { t } = useAppTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 text-center">
        <span className="icon-chip mx-auto mb-4 h-14 w-14">
          <HiOutlineExclamationTriangle className="h-7 w-7 text-amber-500" />
        </span>
        <h1 className="text-4xl font-bold text-primary mb-1">{t('pages.notFound.title')}</h1>
        <h2 className="text-lg text-secondary mb-3">{t('pages.notFound.heading')}</h2>
        <p className="text-sm text-muted mb-6">{t('pages.notFound.message')}</p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
          <HiOutlineHome className="h-4 w-4" />
          {t('pages.notFound.home')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
