import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useAppTranslation();
  const label =
    theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn w-9 h-9"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <HiOutlineSun className="h-4 w-4" /> : <HiOutlineMoon className="h-4 w-4" />}
    </button>
  );
}
