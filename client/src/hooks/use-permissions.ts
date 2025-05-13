import { type Permission, userPermissions, type RoleType } from "@shared/schema";
import { useAuth } from "./use-auth";

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Admins have all permissions
    if (user.role === 'admin') return true;

    // Check if the user's role has the required permission
    return userPermissions[user.role as keyof typeof userPermissions]?.includes(permission) ?? false;
  };

  const canManageTrainingCenter = () => hasPermission('manage_training_center');
  const canManageCourses = () => hasPermission('manage_courses');
  const canManageEnrollments = () => hasPermission('manage_enrollments');
  const canManageTestCenter = () => hasPermission('manage_test_center');
  const canManageExamSchedules = () => hasPermission('manage_exam_schedules');
  const canViewCenters = () => hasPermission('view_centers');
  const canEnrollCourses = () => hasPermission('enroll_courses');
  const canRegisterExams = () => hasPermission('register_exams');
  const canViewCertificates = () => hasPermission('view_certificates');

  return {
    hasPermission,
    canManageTrainingCenter,
    canManageCourses,
    canManageEnrollments,
    canManageTestCenter,
    canManageExamSchedules,
    canViewCenters,
    canEnrollCourses,
    canRegisterExams,
    canViewCertificates,
  };
}