import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './features/ThemeToggle';

/** Language + theme for login/register and other public pages (no navbar). */
export function AuthLanguageBar() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <ThemeToggle />
      <div className="w-36">
        <LanguageSwitcher compact />
      </div>
    </div>
  );
}
