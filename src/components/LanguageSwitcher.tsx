// src/components/LanguageSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaCheck } from 'react-icons/fa';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'jp', name: '日本語', flag: '🇯🇵' },
  { code: 'kr', name: '한국어', flag: '🇰🇷' },
  { code: 'cn', name: '中文', flag: '🇨🇳' },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);
    // Force page reload to apply language change everywhere
    window.location.reload();
  };

  // Close dropdown when clicking outside
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-200"
        title="Change Language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {currentLanguage.code}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-scale-in">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className={`flex-1 text-sm ${i18n.language === lang.code ? 'font-semibold' : 'font-medium'}`}>
                  {lang.name}
                </span>
                {i18n.language === lang.code && (
                  <FaCheck className="text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
