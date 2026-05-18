import { useAppTranslation } from '../../hooks/useAppTranslation';

export function SkipToContent() {
  const { t } = useAppTranslation();
  return (
    <a href="#main-content" className="skip-to-content">
      {t('a11y.skipToContent')}
    </a>
  );
}
