import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import MentorList from './components/MentorList';
import MenteeList from './components/MenteeList';
import GroupList from './components/GroupList';
import MentorDetail from './components/MentorDetail';
import EditMentor from './components/EditMentor';
import AddMentor from './components/AddMentor';
import MenteeDetail from './components/MenteeDetail';
import EditMentee from './components/EditMentee';
import AddMentee from './components/AddMentee';
import GroupDetail from './components/GroupDetail';
import EditGroup from './components/EditGroup';
import AddGroup from './components/AddGroup';
import ScheduleList from './components/ScheduleList';
import AnalyticsPage from './components/AnalyticsPage';
import TestimonialsPage from './components/TestimonialsPage';
import NotFound from './components/NotFound';
import SessionLogPage from './pages/SessionLogPage';
import ApplicationsPage from './pages/ApplicationsPage';
import AdminExportPage from './pages/AdminExportPage';
import AdminNotificationPage from './pages/AdminNotificationPage';
import SlotsPage from './pages/SlotsPage';
import AdminInvitePage from './pages/AdminInvitePage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PricingPage } from './pages/PricingPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CookieConsentBanner } from './components/CookieConsentBanner';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const { state } = useAuth();
  const isAuthPage = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/pricing', '/payment/success', '/privacy-policy', '/terms-of-service'].includes(location.pathname);
  const role = state.user?.role || 'user';

  return (
    <div className={`app-container role-${role}`} data-role={role}>
      {!isAuthPage && <Navbar />}
      <div className="content">
        <Routes>
          {/* Auth Routes - Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Main Routes - Protected */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Mentor Routes - Protected (mentor + admin only) */}
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
          
          {/* Mentee Routes - Protected (mentee + admin only) */}
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
          
          {/* Group Routes - Protected (all authenticated) */}
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
          
          {/* Other Routes - Protected (all authenticated) */}
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
            path="/testimonials" 
            element={
              <ProtectedRoute>
                <TestimonialsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <CookieConsentBanner />
    </div>
  );
}

export default App;