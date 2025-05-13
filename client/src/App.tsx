import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/auth/protected-route";
import { TestingCenterApprovalGuard } from "./components/auth/testing-center-approval-guard";
import ModernHeaderHome from "@/components/layout/modern-header-home";
import Footer from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SuperAdminAuthPage from "@/pages/super-admin/auth";
import HomePage from "@/pages/home-page";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import FAQPage from "@/pages/faq";
import StudentDashboard from "@/pages/dashboard/student";
import NewStudentDashboard from "@/pages/dashboard/new-student";
import StudentDashboardV2 from "@/pages/dashboard/student-dashboard-v2";
import TrainingCenterDashboard from "@/pages/dashboard/training-center";
import AdminDashboard from "@/pages/dashboard/admin";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import ProfilePage from "@/pages/profile";
import CoursesPage from "@/pages/courses";
import ExamsPage from "@/pages/exams";
import CertificatesPage from "@/pages/certificates";
import SettingsPage from "@/pages/settings";
import CenterRegistrationPage from "@/pages/dashboard/centers/register";
import ApplicationsPage from "@/pages/dashboard/centers/applications";
import ApplicationDetailsPage from "@/pages/dashboard/centers/applications/[id]";
import CreateCoursePage from "@/pages/dashboard/courses/create";
import CourseListPage from "@/pages/dashboard/courses";
import TrainingCenterCourseDetailsPage from "@/pages/dashboard/courses/[id]";
import EditCoursePage from "@/pages/dashboard/courses/[id]/edit";
import { UserRole } from "@shared/schema";
import UsersManagementPage from "@/pages/super-admin/users";
import CreateUserPage from "@/pages/super-admin/users/create";
import EditUserPage from "@/pages/super-admin/users/[id]/edit";
import TrainingCenterIntroPage from "@/pages/intro/training-center";
import TestingCenterIntroPage from "@/pages/intro/testing-center";
import StudentIntroPage from "@/pages/intro/student";
import ApplicationsManagementPage from "@/pages/super-admin/training-centers/applications";
import ApplicationDetailsManagementPage from "@/pages/super-admin/training-centers/applications/[id]";
import TestingCenterApplicationsPage from "@/pages/super-admin/testing-centers/applications";
import TestingCenterApplicationDetailsPage from "@/pages/super-admin/testing-centers/applications/[id]";
import CertificateViewPage from "@/pages/certificates/view";
import TrainingCenterStatsPage from "@/pages/dashboard/training-center/stats";
import SuperAdminStatsPage from "@/pages/super-admin/stats";
import TrainingCentersSearchIntroPage from "@/pages/intro/training-centers-search";
import TestingCentersSearchIntroPage from "@/pages/intro/testing-centers-search";
import CourseProgressIntroPage from "@/pages/intro/course-progress";
import StudentCourseDetailsPage from "@/pages/courses/course-details";
import StudentCertificateMatchingPage from "@/pages/student/certificate-matching";
import AdminCertificateMatchingPage from "@/pages/admin/certificate-matching";
import CertificateMatchingDetailPage from "@/pages/certificate-matching/[id]";
import TestCentersSearch from "@/pages/test-centers/search";
import QualificationRequirementsPage from "@/pages/qualification-requirements";
import TrainingCenterRequirementsPage from "@/pages/training-center-requirements";

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  switch (user.role) {
    case UserRole.STUDENT:
      return <Redirect to="/student/dashboard" />;
    case UserRole.TRAINING_CENTER:
      return <TrainingCenterDashboard />;
    case UserRole.TESTING_CENTER:
      return <Redirect to="/TestingCenter/stats" />;
    case UserRole.SUPER_ADMIN:
      return <Redirect to="/super-admin/dashboard" />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <NotFound />;
  }
}

function Router() {
  return (
    <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthRedirect} />
      <Route path="/super-admin/auth" component={SuperAdminAuthPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/faq" component={FAQPage} />

      {/* Intro pages - public */}
      <Route path="/intro/training-center" component={TrainingCenterIntroPage} />
      <Route path="/intro/testing-center" component={TestingCenterIntroPage} />
      <Route path="/intro/student" component={StudentIntroPage} />
      <Route path="/intro/course-progress" component={CourseProgressIntroPage} />

      {/* Search pages - public */}
      <Route path="/intro/testing-centers/search" component={TestingCentersSearchIntroPage} />
      <Route path="/intro/training-centers/search" component={TrainingCentersSearchIntroPage} />
      <Route path="/public/training-centers" component={TestCentersSearch} />
      <Route path="/qualification-requirements" component={QualificationRequirementsPage} />
      <Route path="/training-center-requirements" component={TrainingCenterRequirementsPage} />
      
      {/* Exams pages - public */}
      <Route path="/exams/available" component={() => {
        const AvailableExamsPage = React.lazy(() => import("@/pages/exams/available-exams"));
        return (
          <React.Suspense fallback={<div>جاري التحميل...</div>}>
            <AvailableExamsPage />
          </React.Suspense>
        );
      }} />

      {/* Protected routes - require authentication */}
      <ProtectedRoute path="/dashboard" component={DashboardRouter} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />

      {/* New Student routes with /student/ prefix */}
      <ProtectedRoute
        path="/student/courses"
        requiredRole={UserRole.STUDENT}
        component={CoursesPage}
      />
      <ProtectedRoute
        path="/student/exams"
        requiredRole={UserRole.STUDENT}
        component={() => {
          const StudentExamsPage = React.lazy(() => import("@/pages/student/exams"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <StudentExamsPage />
            </React.Suspense>
          );
        }}
      />
      <ProtectedRoute
        path="/student/certificates"
        requiredRole={UserRole.STUDENT}
        component={CertificatesPage}
      />
      <ProtectedRoute 
        path="/student/dashboard" 
        requiredRole={UserRole.STUDENT} 
        component={() => <StudentDashboard />} 
      />
      
      {/* Legacy Student routes - these will redirect to the new paths */}
      <Route path="/courses" component={() => <Redirect to="/student/courses" />} />
      <Route path="/exams" component={() => <Redirect to="/student/exams" />} />
      <Route path="/certificates" component={() => <Redirect to="/student/certificates" />} />
      <Route path="/dashboard/student" component={() => <Redirect to="/student/dashboard" />} />

      {/* Training Center routes */}
      <ProtectedRoute
        path="/TrainingCenter/applications"
        requiredRole={UserRole.TRAINING_CENTER}
        component={ApplicationsPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/applications/:id"
        requiredRole={UserRole.TRAINING_CENTER}
        component={ApplicationDetailsPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/register"
        requiredRole={UserRole.TRAINING_CENTER}
        component={CenterRegistrationPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/stats"
        requiredRole={UserRole.TRAINING_CENTER}
        component={TrainingCenterStatsPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/courses/create"
        requiredRole={UserRole.TRAINING_CENTER}
        component={CreateCoursePage}
      />
      <ProtectedRoute
        path="/TrainingCenter/courses"
        requiredRole={UserRole.TRAINING_CENTER}
        component={CourseListPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/courses/:id"
        requiredRole={UserRole.TRAINING_CENTER}
        component={TrainingCenterCourseDetailsPage}
      />
      <ProtectedRoute
        path="/TrainingCenter/courses/:id/edit"
        requiredRole={UserRole.TRAINING_CENTER}
        component={EditCoursePage}
      />

      {/* Testing Center routes */}
      <ProtectedRoute
        path="/TestingCenter/stats"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const TestingCenterStatsPage = React.lazy(() => import("@/pages/dashboard/testing-center/stats"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterStatsPage />
            </React.Suspense>
          );
        }}
      />
      <ProtectedRoute
        path="/TestingCenter/applications"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const TestingCenterApplicationsPage = React.lazy(() => import("@/pages/dashboard/testing-center/applications"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterApplicationsPage />
            </React.Suspense>
          );
        }}
      />
      <ProtectedRoute
        path="/TestingCenter/applications/:id"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const TestingCenterApplicationDetailsPage = React.lazy(() => import("@/pages/dashboard/testing-center/applications/details"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterApplicationDetailsPage />
            </React.Suspense>
          );
        }}
      />
      <ProtectedRoute
        path="/TestingCenter/exams"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const TestingCenterExamsPage = React.lazy(() => import("@/pages/dashboard/testing-center/exams"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterExamsPage />
            </React.Suspense>
          );
        }}
      />
      {/* مسار إضافة اختبار جديد (يستخدم API الجديد) */}
      <ProtectedRoute
        path="/TestingCenter/exams/create"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const NewExamPage = React.lazy(() => import("@/pages/dashboard/testing-center/exams/new-exam"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterApprovalGuard>
                <NewExamPage />
              </TestingCenterApprovalGuard>
            </React.Suspense>
          );
        }}
      />
      
      {/* إعادة توجيه من المسار الجديد إلى المسار القديم */}
      <ProtectedRoute
        path="/TestingCenter/exams/new"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => <Redirect to="/TestingCenter/exams/create" />}
      />
      
      <ProtectedRoute
        path="/TestingCenter/exams/:id/edit"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const EditExamPage = React.lazy(() => import("@/pages/dashboard/testing-center/exams/[id]/edit-exam"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterApprovalGuard>
                <EditExamPage />
              </TestingCenterApprovalGuard>
            </React.Suspense>
          );
        }}
      />
      
      <ProtectedRoute
        path="/TestingCenter/exams/:id/candidates"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const ExamCandidatesPage = React.lazy(() => import("@/pages/dashboard/testing-center/exams/candidates"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterApprovalGuard>
                <ExamCandidatesPage />
              </TestingCenterApprovalGuard>
            </React.Suspense>
          );
        }}
      />
      <ProtectedRoute
        path="/TestingCenter/register"
        requiredRole={UserRole.TESTING_CENTER}
        component={() => {
          const TestingCenterRegistrationPage = React.lazy(() => import("@/pages/dashboard/testing-center/register"));
          return (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <TestingCenterRegistrationPage />
            </React.Suspense>
          );
        }}
      />

      
      {/* Legacy Training Center routes - redirecting to new structure */}
      <Route path="/dashboard/centers/applications" component={() => <Redirect to="/TrainingCenter/applications" />} />
      <Route path="/dashboard/centers/applications/:id" component={({ params }) => <Redirect to={`/TrainingCenter/applications/${params.id}`} />} />
      <Route path="/dashboard/centers/register" component={() => <Redirect to="/TrainingCenter/register" />} />
      <Route path="/dashboard/centers/stats" component={() => <Redirect to="/TrainingCenter/stats" />} />
      <Route path="/dashboard/courses/create" component={() => <Redirect to="/TrainingCenter/courses/create" />} />
      <Route path="/dashboard/courses" component={() => <Redirect to="/TrainingCenter/courses" />} />
      <Route path="/dashboard/courses/:id" component={({ params }) => <Redirect to={`/TrainingCenter/courses/${params.id}`} />} />
      <Route path="/dashboard/courses/:id/edit" component={({ params }) => <Redirect to={`/TrainingCenter/courses/${params.id}/edit`} />} />

      {/* Admin routes */}
      <ProtectedRoute
        path="/admin/users"
        requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
        component={UsersManagementPage}
      />
      <ProtectedRoute
        path="/admin/users/create"
        requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
        component={CreateUserPage}
      />
      <ProtectedRoute
        path="/admin/users/:id/edit"
        requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
        component={EditUserPage}
      />

      {/* Super Admin Management routes */}
      <ProtectedRoute
        path="/super-admin/users"
        requiredRole={UserRole.SUPER_ADMIN}
        component={UsersManagementPage}
      />
      <ProtectedRoute
        path="/super-admin/users/create"
        requiredRole={UserRole.SUPER_ADMIN}
        component={CreateUserPage}
      />
      <ProtectedRoute
        path="/super-admin/users/:id/edit"
        requiredRole={UserRole.SUPER_ADMIN}
        component={EditUserPage}
      />
      <ProtectedRoute
        path="/super-admin/training-centers/applications"
        requiredRole={UserRole.SUPER_ADMIN}
        component={ApplicationsManagementPage}
      />
      <ProtectedRoute
        path="/super-admin/training-centers/applications/:id"
        requiredRole={UserRole.SUPER_ADMIN}
        component={ApplicationDetailsManagementPage}
      />
      <ProtectedRoute
        path="/super-admin/testing-centers/applications"
        requiredRole={UserRole.SUPER_ADMIN}
        component={TestingCenterApplicationsPage}
      />
      <ProtectedRoute
        path="/super-admin/testing-centers/applications/:id"
        requiredRole={UserRole.SUPER_ADMIN}
        component={TestingCenterApplicationDetailsPage}
      />
      <ProtectedRoute
        path="/super-admin/certificate-matching"
        requiredRole={UserRole.SUPER_ADMIN}
        component={AdminCertificateMatchingPage}
      />

      {/* Super Admin Routes */}
      <ProtectedRoute
        path="/super-admin/stats"
        requiredRole={UserRole.SUPER_ADMIN}
        component={SuperAdminStatsPage}
      />
      <ProtectedRoute
        path="/super-admin/dashboard"
        requiredRole={UserRole.SUPER_ADMIN}
        component={SuperAdminDashboard}
      />
      <ProtectedRoute
        path="/super-admin/training-centers/applications"
        requiredRole={UserRole.SUPER_ADMIN}
        component={ApplicationsManagementPage}
      />
      <ProtectedRoute
        path="/super-admin/training-centers/applications/:id"
        requiredRole={UserRole.SUPER_ADMIN}
        component={ApplicationDetailsManagementPage}
      />
      <ProtectedRoute
        path="/super-admin/testing-centers/applications"
        requiredRole={UserRole.SUPER_ADMIN}
        component={TestingCenterApplicationsPage}
      />
      <ProtectedRoute
        path="/super-admin/testing-centers/applications/:id"
        requiredRole={UserRole.SUPER_ADMIN}
        component={TestingCenterApplicationDetailsPage}
      />

      {/* Certificate Routes - Updated with new URL patterns */}
      <Route path="/student/certificates/training-center/:id" component={CertificateViewPage} />
      <Route path="/student/certificates/testing-center/:id" component={CertificateViewPage} />
      <Route path="/student/certificates/course/:id" component={CertificateViewPage} />
      
      {/* Legacy certificate routes for backward compatibility */}
      <Route path="/certificates/training-center/:id" component={({ params }) => <Redirect to={`/student/certificates/training-center/${params.id}`} />} />
      <Route path="/certificates/testing-center/:id" component={({ params }) => <Redirect to={`/student/certificates/testing-center/${params.id}`} />} />
      <Route path="/certificates/course/:id" component={({ params }) => <Redirect to={`/student/certificates/course/${params.id}`} />} />

      {/* Certificate routes */}
      <Route path="/student/certificates/view/:id" component={CertificateViewPage} />
      
      {/* Legacy certificate route for backward compatibility */}
      <Route path="/certificates/view/:id" component={({ params }) => <Redirect to={`/student/certificates/view/${params.id}`} />} />

      {/* Student pages routes */}
      {/* Student dashboard */}
      <Route path="/student/dashboard" component={StudentDashboardV2} />
      {/* Legacy dashboard route - redirect to new path */}
      <Route path="/dashboard/student" component={() => <Redirect to="/student/dashboard" />} />
      
      {/* Certificates main page */}
      <Route path="/student/certificates" component={CertificatesPage} />
      {/* Legacy certificates route - redirect to new path */}
      <Route path="/certificates" component={() => <Redirect to="/student/certificates" />} />
      
      {/* Generic dashboard route - redirects to appropriate dashboard based on user role */}
      <Route path="/dashboard" component={DashboardRouter} />
      
      {/* Exams routes */}
      <Route path="/student/exams" component={ExamsPage} />
      {/* Legacy exams route - redirect to new path */}
      <Route path="/exams" component={() => <Redirect to="/student/exams" />} />
      
      {/* Courses routes */}
      <Route path="/student/courses" component={CourseListPage} />
      <Route path="/student/courses/:id" component={StudentCourseDetailsPage} />
      
      {/* Legacy courses routes - redirect to new paths */}
      <Route path="/courses" component={() => <Redirect to="/student/courses" />} />
      <Route path="/courses/:id" component={({ params }) => <Redirect to={`/student/courses/${params.id}`} />} />
      
      {/* Certificate Matching routes */}
      <ProtectedRoute
        path="/student/certificate-matching"
        requiredRole={UserRole.STUDENT}
        component={StudentCertificateMatchingPage}
      />
      
      <ProtectedRoute
        path="/admin/certificate-matching"
        requiredRole={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
        component={AdminCertificateMatchingPage}
      />
      
      {/* Certificate Matching Detail Page - accessible by both students and admins */}
      <ProtectedRoute
        path="/certificate-matching/:id"
        requiredRole={[UserRole.STUDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN]}
        component={CertificateMatchingDetailPage}
      />

      {/* Fallback route - must be last */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthRedirect() {
  const { user } = useAuth();
  
  if (!user) return <AuthPage />;
  
  // التحقق من حالة المستخدم أولاً - استخدام isActive بدلاً من status
  // نستخدم any لتجنب أخطاء TypeScript حيث أن isActive ليست جزءًا من النوع الأصلي
  if ((user as any).isActive === false) {
    console.log('تم اكتشاف حساب غير نشط:', user);
    // إنشاء مكون خاص للمستخدمين غير النشطين
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-4">حسابك غير مفعل حالياً</h2>
          <div className="text-center space-y-4">
            <p className="text-lg">اسم المستخدم: {" "}
              <span className="font-medium">
                {user.username}
              </span>
            </p>
            <p>
              يتم حالياً مراجعة طلب التسجيل الخاص بك من قبل الإدارة. سيتم إشعارك عبر البريد الإلكتروني عند تفعيل حسابك.
            </p>
            <p className="mt-2 text-sm text-slate-500">رقم التعريف: {user.id} | نوع الحساب: {user.role}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // توجيه المستخدمين النشطين إلى لوحة التحكم الخاصة بهم حسب دورهم
  switch (user.role) {
    case UserRole.STUDENT:
      return <Redirect to="/student/dashboard" />;
    case UserRole.TRAINING_CENTER:
      return <Redirect to="/TrainingCenter/stats" />;
    case UserRole.TESTING_CENTER:
      return <Redirect to="/TestingCenter/stats" />;
    case UserRole.ADMIN:
      return <Redirect to="/admin/dashboard" />;
    case UserRole.SUPER_ADMIN:
      return <Redirect to="/super-admin/dashboard" />;
    default:
      return <Redirect to="/dashboard" />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <ModernHeaderHome />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;