import { useState, useRef, useEffect } from 'react';
import { HiOutlineCheck } from 'react-icons/hi2';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { normalizeLang } from '../i18n/utils';

const languages = [
  { code: 'en' as const, nameKey: 'language.en', flag: '🇬🇧' },
  { code: 'vi' as const, nameKey: 'language.vi', flag: '🇻🇳' },
  { code: 'jp' as const, nameKey: 'language.jp', flag: '🇯🇵' },
  { code: 'kr' as const, nameKey: 'language.kr', flag: '🇰🇷' },
  { code: 'cn' as const, nameKey: 'language.cn', flag: '🇨🇳' },
];

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher = ({ compact }: LanguageSwitcherProps) => {
  const { t, i18n } = useAppTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentCode = normalizeLang(i18n.language);
  const currentLanguage = languages.find((lang) => lang.code === currentCode) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${compact ? '' : 'flex-1'}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`icon-btn gap-2 text-sm font-medium ${compact ? 'px-3 py-2' : 'px-3 py-2 w-full'}`}
        title={t('language.change')}
        aria-label={t('language.change')}
      >
        <span className="text-lg leading-none">{currentLanguage.flag}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{currentLanguage.code}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute mb-2 modal-panel rounded-lg overflow-hidden z-50 animate-scale-in ${
            compact ? 'right-0 bottom-full w-48' : 'bottom-full left-0 right-0'
          }`}
        >
          <div className="py-1">
            {languages.map((lang) => {
              const active = currentCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:opacity-90 ${
                    active ? 'font-semibold' : 'text-secondary'
                  }`}
                  style={
                    active
                      ? { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-subtle-fg)' }
                      : undefined
                  }
                >
                  <span className="text-xl leading-none">{lang.flag}</span>
                  <span className="flex-1">{t(lang.nameKey)}</span>
                  {active && <HiOutlineCheck className="shrink-0 opacity-80 h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
