import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applyDocumentLang, getDateLocale, normalizeLang } from '../i18n/utils';

/**
 * App-wide i18n hook: re-renders on language change and syncs &lt;html lang&gt;.
 */
export function useAppTranslation(ns?: string | string[]) {
  const { t, i18n } = useTranslation(ns);

  useEffect(() => {
    applyDocumentLang(i18n.language);
    const onChange = (lng: string) => applyDocumentLang(lng);
    i18n.on('languageChanged', onChange);
    return () => {
      i18n.off('languageChanged', onChange);
    };
  }, [i18n]);

  const lang = normalizeLang(i18n.language);

  return {
    t,
    i18n,
    lang,
    formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(getDateLocale(lang), options).format(
        value instanceof Date ? value : new Date(value)
      ),
    formatDateTime: (value: Date | string | number) =>
      new Intl.DateTimeFormat(getDateLocale(lang), {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(value instanceof Date ? value : new Date(value)),
  };
}
