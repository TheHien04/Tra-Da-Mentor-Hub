export const SUPPORTED_LANGS = ['en', 'vi', 'jp', 'kr', 'cn'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

export function normalizeLang(lang?: string | null): AppLang {
  const base = (lang || 'en').split('-')[0].toLowerCase();
  if (base === 'ja') return 'jp';
  if (base === 'ko') return 'kr';
  if (base === 'zh') return 'cn';
  return (SUPPORTED_LANGS.includes(base as AppLang) ? base : 'en') as AppLang;
}

export const DATE_LOCALE_MAP: Record<AppLang, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  jp: 'ja-JP',
  kr: 'ko-KR',
  cn: 'zh-CN',
};

export function getDateLocale(lang?: string | null): string {
  return DATE_LOCALE_MAP[normalizeLang(lang)];
}

export function applyDocumentLang(lang?: string | null): void {
  const code = normalizeLang(lang);
  document.documentElement.lang = code;
  document.documentElement.setAttribute('data-lang', code);
}
