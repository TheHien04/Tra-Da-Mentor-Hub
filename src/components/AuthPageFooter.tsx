import { Link } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';

type AuthPageFooterProps = {
  showCopyright?: boolean;
};

export function AuthPageFooter({ showCopyright = true }: AuthPageFooterProps) {
  const { t } = useAppTranslation();

  return (
    <p className="auth-footer flex flex-wrap justify-center gap-x-3 gap-y-1">
      {showCopyright ? <span>{t('footer.copyright')}</span> : null}
      <Link to="/privacy-policy">{t('footer.privacy')}</Link>
      <Link to="/terms-of-service">{t('footer.terms')}</Link>
    </p>
  );
}
