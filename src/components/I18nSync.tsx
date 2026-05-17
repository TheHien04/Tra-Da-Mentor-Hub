import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applyDocumentLang } from '../i18n/utils';

/** Keeps document language in sync even outside translated components. */
export function I18nSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    applyDocumentLang(i18n.language);
    const handler = (lng: string) => applyDocumentLang(lng);
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [i18n]);

  return null;
}
