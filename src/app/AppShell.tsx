import { useLocation } from 'react-router-dom';
import { AuthLanguageBar } from '../components/AuthLanguageBar';
import { CookieConsentBanner } from '../components/CookieConsentBanner';
import MobileNav from '../components/MobileNav';
import Navbar from '../components/Navbar';
import { CommandPalette, useCommandPalette } from '../components/features/CommandPalette';
import { OnboardingTour } from '../components/features/OnboardingTour';
import { PwaInstallPrompt } from '../components/features/PwaInstallPrompt';
import { RouteProgress } from '../components/features/RouteProgress';
import { ScrollToTop } from '../components/features/ScrollToTop';
import { SkipToContent } from '../components/features/SkipToContent';
import { ScrollMotion } from '../components/motion/ScrollMotion';
import { useAuth } from '../context/AuthContext';
import { AppRoutes } from './AppRoutes';
import { usesPublicShell } from './routePresentation';

/** Shared application chrome. Route definitions are intentionally isolated in AppRoutes. */
export function AppShell() {
  const location = useLocation();
  const { state } = useAuth();
  const command = useCommandPalette();
  const publicShell = usesPublicShell(location.pathname);
  const role = state.user?.role || 'user';

  return (
    <div className={`app-container role-${role}`} data-role={role}>
      <SkipToContent />
      <RouteProgress />
      <ScrollToTop />
      {publicShell ? <AuthLanguageBar /> : <Navbar />}
      <main id="main-content" className="content" tabIndex={-1}>
        <ScrollMotion />
        <AppRoutes />
      </main>
      <CookieConsentBanner />
      {!publicShell && state.isAuthenticated && <MobileNav />}
      {!publicShell && <CommandPalette open={command.open} onClose={command.onClose} />}
      {!publicShell && state.isAuthenticated && <OnboardingTour />}
      {!publicShell && state.isAuthenticated && <PwaInstallPrompt />}
    </div>
  );
}
