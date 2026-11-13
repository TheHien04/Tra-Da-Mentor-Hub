import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Skeleton from '../components/Skeleton';

const Dashboard = lazy(() => import('../pages/DashboardPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const MentorList = lazy(() => import('../pages/MentorListPage'));
const MenteeList = lazy(() => import('../pages/MenteeListPage'));
const GroupList = lazy(() => import('../pages/GroupListPage'));
const MentorDetail = lazy(() => import('../pages/MentorDetailPage'));
const EditMentor = lazy(() => import('../pages/EditMentorPage'));
const AddMentor = lazy(() => import('../pages/AddMentorPage'));
const MenteeDetail = lazy(() => import('../pages/MenteeDetailPage'));
const EditMentee = lazy(() => import('../pages/EditMenteePage'));
const AddMentee = lazy(() => import('../pages/AddMenteePage'));
const GroupDetail = lazy(() => import('../pages/GroupDetailPage'));
const EditGroup = lazy(() => import('../pages/EditGroupPage'));
const AddGroup = lazy(() => import('../pages/AddGroupPage'));
const ScheduleList = lazy(() => import('../pages/SchedulePage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const TestimonialsPage = lazy(() => import('../pages/TestimonialsPage'));
const NotFound = lazy(() => import('../components/NotFound'));
const SessionLogPage = lazy(() => import('../pages/SessionLogPage'));
const ApplicationsPage = lazy(() => import('../pages/ApplicationsPage'));
const AdminExportPage = lazy(() => import('../pages/AdminExportPage'));
const AdminAuditPage = lazy(() => import('../pages/AdminAuditPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const AdminNotificationPage = lazy(() => import('../pages/AdminNotificationPage'));
const SlotsPage = lazy(() => import('../pages/SlotsPage'));
const AdminInvitePage = lazy(() => import('../pages/AdminInvitePage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const PricingPage = lazy(() => import('../pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const AuthCallbackPage = lazy(() => import('../pages/AuthCallbackPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('../pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const InsightsPage = lazy(() => import('../pages/InsightsPage'));

type Role = 'user' | 'mentor' | 'mentee' | 'admin';

function PageLoader() {
  return (
    <div className="p-8 max-w-4xl mx-auto" role="status" aria-label="Đang tải trang">
      <Skeleton count={4} />
    </div>
  );
}

function protect(element: ReactNode, requiredRole?: Role | Role[]) {
  return <ProtectedRoute requiredRole={requiredRole}>{element}</ProtectedRoute>;
}

/** Central route table: public routes first, authenticated product routes second. */
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/programs" element={<PricingPage />} />
        <Route path="/pricing" element={<Navigate to="/programs" replace />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="/" element={protect(<Dashboard />)} />
        <Route path="/mentors" element={protect(<MentorList />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/mentors/add" element={protect(<AddMentor />, ['admin'])} />
        <Route path="/mentors/:id" element={protect(<MentorDetail />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/mentors/:id/edit" element={protect(<EditMentor />, ['mentor', 'admin'])} />
        <Route path="/mentees" element={protect(<MenteeList />, ['mentor', 'admin'])} />
        <Route path="/mentees/add" element={protect(<AddMentee />, ['admin'])} />
        <Route path="/mentees/:id" element={protect(<MenteeDetail />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/mentees/:id/edit" element={protect(<EditMentee />, ['mentee', 'admin'])} />
        <Route path="/groups" element={protect(<GroupList />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/groups/add" element={protect(<AddGroup />, ['mentor', 'admin'])} />
        <Route path="/groups/:id" element={protect(<GroupDetail />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/groups/:id/edit" element={protect(<EditGroup />, ['mentor', 'admin'])} />
        <Route path="/schedule" element={protect(<ScheduleList />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/session-logs" element={protect(<SessionLogPage />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/applications" element={protect(<ApplicationsPage />, ['mentor', 'admin'])} />
        <Route path="/slots" element={protect(<SlotsPage />, ['mentor', 'mentee', 'admin'])} />
        <Route path="/account" element={protect(<AccountPage />)} />
        <Route path="/admin/audit" element={protect(<AdminAuditPage />, ['admin'])} />
        <Route path="/admin/export" element={protect(<AdminExportPage />, ['admin'])} />
        <Route path="/admin/notifications" element={protect(<AdminNotificationPage />, ['admin'])} />
        <Route path="/admin/invite" element={protect(<AdminInvitePage />, ['admin'])} />
        <Route path="/analytics" element={protect(<AnalyticsPage />, ['mentor', 'admin'])} />
        <Route path="/insights" element={protect(<InsightsPage />, ['mentor', 'admin'])} />
        <Route path="/testimonials" element={protect(<TestimonialsPage />, ['mentor', 'mentee', 'admin'])} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
