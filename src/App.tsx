import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { CommandPalette, useCommandPalette } from './components/features/CommandPalette';
import { OnboardingTour } from './components/features/OnboardingTour';
import { RouteProgress } from './components/features/RouteProgress';
import { ScrollToTop } from './components/features/ScrollToTop';
import { PwaInstallPrompt } from './components/features/PwaInstallPrompt';
import { SkipToContent } from './components/features/SkipToContent';
import { NotificationProvider } from './context/NotificationContext';
import { AuthLanguageBar } from './components/AuthLanguageBar';
import { PageTitleSync } from './components/PageTitleSync';
import Skeleton from './components/Skeleton';

const Dashboard = lazy(() => import('./components/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const MentorList = lazy(() => import('./components/MentorList'));
const MenteeList = lazy(() => import('./components/MenteeList'));
const GroupList = lazy(() => import('./components/GroupList'));
const MentorDetail = lazy(() => import('./components/MentorDetail'));
const EditMentor = lazy(() => import('./components/EditMentor'));
const AddMentor = lazy(() => import('./components/AddMentor'));
const MenteeDetail = lazy(() => import('./components/MenteeDetail'));
const EditMentee = lazy(() => import('./components/EditMentee'));
const AddMentee = lazy(() => import('./components/AddMentee'));
const GroupDetail = lazy(() => import('./components/GroupDetail'));
const EditGroup = lazy(() => import('./components/EditGroup'));
const AddGroup = lazy(() => import('./components/AddGroup'));
const ScheduleList = lazy(() => import('./components/ScheduleList'));
const AnalyticsPage = lazy(() => import('./components/AnalyticsPage'));
const TestimonialsPage = lazy(() => import('./components/TestimonialsPage'));
const NotFound = lazy(() => import('./components/NotFound'));
const SessionLogPage = lazy(() => import('./pages/SessionLogPage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const AdminExportPage = lazy(() => import('./pages/AdminExportPage'));
const AdminNotificationPage = lazy(() => import('./pages/AdminNotificationPage'));
const SlotsPage = lazy(() => import('./pages/SlotsPage'));
const AdminInvitePage = lazy(() => import('./pages/AdminInvitePage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));

function PageLoader() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Skeleton count={4} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <PageTitleSync />
            <AppContent />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const { state } = useAuth();
  const command = useCommandPalette();
  const isAuthPage = [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/pricing',
    '/payment/success',
    '/auth/callback',
    '/privacy-policy',
    '/terms-of-service',
    '/unauthorized',
  ].includes(location.pathname);
  const role = state.user?.role || 'user';

  return (
    <div className={`app-container role-${role}`} data-role={role}>
      <SkipToContent />
      <RouteProgress />
      <ScrollToTop />
      {isAuthPage ? <AuthLanguageBar /> : <Navbar />}
      <main id="main-content" className="content" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute requiredRole={['mentor', 'admin']}>
                  <MentorList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/add"
              element={
                <ProtectedRoute requiredRole={['mentor', 'admin']}>
                  <AddMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/:id"
              element={
                <ProtectedRoute requiredRole={['mentor', 'admin']}>
                  <MentorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/:id/edit"
              element={
                <ProtectedRoute requiredRole={['mentor', 'admin']}>
                  <EditMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentees"
              element={
                <ProtectedRoute requiredRole={['mentee', 'admin']}>
                  <MenteeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentees/add"
              element={
                <ProtectedRoute requiredRole={['mentee', 'admin']}>
                  <AddMentee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentees/:id"
              element={
                <ProtectedRoute requiredRole={['mentee', 'admin']}>
                  <MenteeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentees/:id/edit"
              element={
                <ProtectedRoute requiredRole={['mentee', 'admin']}>
                  <EditMentee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/add"
              element={
                <ProtectedRoute>
                  <AddGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id/edit"
              element={
                <ProtectedRoute>
                  <EditGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <ScheduleList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session-logs"
              element={
                <ProtectedRoute>
                  <SessionLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute requiredRole={['mentor', 'admin']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/slots"
              element={
                <ProtectedRoute>
                  <SlotsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/export"
              element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminExportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminNotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invite"
              element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminInvitePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testimonials"
              element={
                <ProtectedRoute requiredRole={['admin', 'mentor']}>
                  <TestimonialsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <CookieConsentBanner />
      {!isAuthPage && state.isAuthenticated && <MobileNav />}
      {!isAuthPage && <CommandPalette open={command.open} onClose={command.onClose} />}
      {!isAuthPage && state.isAuthenticated && <OnboardingTour />}
      {!isAuthPage && state.isAuthenticated && <PwaInstallPrompt />}
    </div>
  );
}

export default App;
