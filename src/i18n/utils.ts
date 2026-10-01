export const SUPPORTED_LANGS = ['en', 'vi'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

export function normalizeLang(lang?: string | null): AppLang {
  const base = (lang || 'vi').split('-')[0].toLowerCase();
  if (base === 'en') return 'en';
  return 'vi';
}

export const DATE_LOCALE_MAP: Record<AppLang, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

export function getDateLocale(lang?: string | null): string {
  return DATE_LOCALE_MAP[normalizeLang(lang)];
}

export function applyDocumentLang(lang?: string | null): void {
  const code = normalizeLang(lang);
  document.documentElement.lang = code;
  document.documentElement.setAttribute('data-lang', code);
}
