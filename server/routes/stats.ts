import { eq, sql, and } from "drizzle-orm";
import { db } from "../db";
import { 
  users, 
  trainingCenterApplications,
  UserRole,
  courses as trainingCourses,
  courseEnrollments
} from "@shared/schema";

// استرجاع إحصائيات الطلبات
export async function getApplicationsStats() {
  try {
    console.log("Executing applications stats query...");
    const applications = await db
      .select()
      .from(trainingCenterApplications);

    console.log("Raw applications data:", applications);

    const stats = {
      new: applications.filter(app => app.status === 'تحت المراجعة').length,
      inProgress: applications.filter(app => app.status === 'زيارة ميدانية' || app.status === 'تحت التقييم').length,
      completed: applications.filter(app => app.status === 'مقبول').length
    };

    console.log("Calculated applications stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getApplicationsStats:", error);
    throw error;
  }
}

// استرجاع إحصائيات المستخدمين
export async function getUsersStats() {
  try {
    console.log("Executing users stats query...");
    const allUsers = await db
      .select()
      .from(users);

    console.log("Raw users data:", allUsers);

    const stats = {
      total: allUsers.length,
      byRole: {
        training_center: allUsers.filter(user => user.role === UserRole.TRAINING_CENTER).length,
        testing_center: allUsers.filter(user => user.role === UserRole.TESTING_CENTER).length,
        student: allUsers.filter(user => user.role === UserRole.STUDENT).length,
        admin: allUsers.filter(user => user.role === UserRole.ADMIN).length,
        super_admin: allUsers.filter(user => user.role === UserRole.SUPER_ADMIN).length
      }
    };

    console.log("Calculated users stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getUsersStats:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// استرجاع إحصائيات مراكز التدريب
export async function getTrainingCentersStats() {
  try {
    console.log("Executing training centers stats query...");
    // Get approved training centers
    const approvedTrainingCenters = await db
      .select({
        id: trainingCenterApplications.id,
        certificateId: trainingCenterApplications.certificateId,
        centerName: trainingCenterApplications.centerName
      })
      .from(trainingCenterApplications)
      .where(
        and(
          eq(trainingCenterApplications.type, 'training_center'),
          eq(trainingCenterApplications.status, 'مقبول')
        )
      );

    console.log("Raw approved centers:", approvedTrainingCenters);

    // Get courses statistics
    const courses = await db
      .select()
      .from(trainingCourses);

    console.log("Raw courses data:", courses);

    // Get enrollments
    const enrollments = await db
      .select()
      .from(courseEnrollments);

    console.log("Raw enrollments data:", enrollments);

    const stats = {
      total: approvedTrainingCenters.length,
      certified: approvedTrainingCenters.filter(center => center.certificateId !== null).length,
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.status === 'مسجل' || e.status === 'active').length,
      totalCourses: courses.length,
      activeCourses: courses.filter(c => ['مجدولة', 'قيد التنفيذ'].includes(c.status as string)).length
    };

    console.log("Calculated training centers stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getTrainingCentersStats:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// استرجاع إحصائيات مراكز الاختبار
export async function getTestingCentersStats() {
  try {
    console.log("Executing testing centers stats query...");
    const approvedTestingCenters = await db
      .select()
      .from(trainingCenterApplications)
      .where(
        and(
          eq(trainingCenterApplications.type, 'testing_center'),
          eq(trainingCenterApplications.status, 'مقبول')
        )
      );

    console.log("Raw testing centers data:", approvedTestingCenters);

    const stats = {
      total: approvedTestingCenters.length,
      certified: approvedTestingCenters.filter(center => center.certificateId !== null).length
    };

    console.log("Calculated testing centers stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getTestingCentersStats:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// إحصائيات مركز التدريب المحدد
export async function getTrainingCenterStats(trainingCenterId: number) {
  try {
    console.log("Executing training center stats query for center:", trainingCenterId);

    // جلب الدورات
    const courses = await db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.training_center_id, trainingCenterId));

    console.log("Raw courses data:", courses);

    // جلب التسجيلات
    const enrollments = await db
      .select({
        enrollment: courseEnrollments,
        course: trainingCourses,
      })
      .from(courseEnrollments)
      .innerJoin(
        trainingCourses,
        eq(courseEnrollments.courseId, trainingCourses.id)
      )
      .where(eq(trainingCourses.training_center_id, trainingCenterId));

    console.log("Raw enrollments data:", enrollments);

    // حساب الإحصائيات
    const stats = {
      totalStudents: new Set(enrollments.map(e => e.enrollment.studentId)).size,
      activeStudents: new Set(
        enrollments
          .filter(e => e.enrollment.status === 'مسجل')
          .map(e => e.enrollment.studentId)
      ).size,
      totalCourses: courses.length,
      activeCourses: courses.filter(c => ['مجدولة', 'قيد التنفيذ'].includes(c.status as string)).length,
      totalEnrollments: enrollments.length,
      completedEnrollments: enrollments.filter(e => e.enrollment.status === 'completed').length
    };

    console.log("Calculated training center stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error in getTrainingCenterStats:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}