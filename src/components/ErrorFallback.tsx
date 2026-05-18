import { useAppTranslation } from '../hooks/useAppTranslation';

interface ErrorFallbackProps {
  error: Error | null;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const { t } = useAppTranslation();

  return (
    <div className="error-boundary">
      <div className="error-boundary__card">
        <h1 className="error-boundary__title">{t('errorBoundary.title')}</h1>
        <p className="error-boundary__message">
          {error?.message || t('errorBoundary.message')}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          {t('errorBoundary.reload')}
        </button>
      </div>
    </div>
  );
}
