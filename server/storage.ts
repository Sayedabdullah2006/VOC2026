import { 
  users, trainingCenters, testCenters, courses, courseEnrollments, examSchedules, 
  examRegistrations, certificates, trainingCenterApplications, notifications, certificateMatching,
  saudiRegionsTable, saudiCitiesTable,
  type User, type InsertUser, type TrainingCenter, type TestCenter, type Course, 
  type CourseEnrollment, type ExamSchedule, type ExamRegistration, type Certificate, 
  type TrainingCenterApplication, type InsertTrainingCenterApplication, type Notification, 
  type InsertNotification, type CertificateMatching, type InsertCertificateMatching,
  type SaudiRegion, type SaudiCity, type InsertSaudiRegion, type InsertSaudiCity,
  CourseStatus 
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number | string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: { 
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserStatus(id: number, status: 'pending' | 'active' | 'suspended'): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  listUsersByRole(role: string): Promise<User[]>;
  createTrainingCenterApplication(application: InsertTrainingCenterApplication): Promise<TrainingCenterApplication>;
  getTrainingCenterApplication(id: number): Promise<TrainingCenterApplication | undefined>;
  getTrainingCenterApplicationsByUser(userId: number): Promise<TrainingCenterApplication[]>;
  updateTrainingCenterApplication(id: number, updates: Partial<TrainingCenterApplication>): Promise<TrainingCenterApplication | undefined>;
  createTrainingCenter(center: Omit<TrainingCenter, "id">): Promise<TrainingCenter>;
  getTrainingCenter(id: number): Promise<TrainingCenter | undefined>;
  listTrainingCenters(): Promise<TrainingCenter[]>;
  createTestCenter(center: Omit<TestCenter, "id">): Promise<TestCenter>;
  getTestCenter(id: number): Promise<TestCenter | undefined>;
  listTestCenters(): Promise<TestCenter[]>;
  createCourse(course: Omit<Course, "id">): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  listCourses(): Promise<Course[]>;
  listCoursesByTrainingCenter(trainingCenterId: number): Promise<Course[]>;
  listCoursesByCenter(centerId: number): Promise<Course[]>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  createCourseEnrollment(enrollment: Omit<CourseEnrollment, "id">): Promise<CourseEnrollment>;
  getCourseEnrollment(id: number): Promise<CourseEnrollment | undefined>;
  listCourseEnrollments(courseId: number): Promise<CourseEnrollment[]>;
  listStudentEnrollments(studentId: number): Promise<CourseEnrollment[]>;
  cancelCourseEnrollment(id: number): Promise<boolean>;
  getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]>;
  getEnrollment(studentId: number, courseId: number): Promise<CourseEnrollment | undefined>;
  updateEnrollmentStatus(enrollmentId: number, status: string): Promise<CourseEnrollment | undefined>;
  createExamSchedule(schedule: Omit<ExamSchedule, "id">): Promise<ExamSchedule>;
  getExamSchedule(id: number): Promise<ExamSchedule | undefined>;
  listExamSchedules(): Promise<ExamSchedule[]>;
  createExamRegistration(registration: Omit<ExamRegistration, "id">): Promise<ExamRegistration>;
  getExamRegistration(id: number): Promise<ExamRegistration | undefined>;
  listExamRegistrations(scheduleId: number): Promise<ExamRegistration[]>;
  createCertificate(certificate: Omit<Certificate, "id">): Promise<Certificate>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByCourseAndStudent(courseId: number, studentId: number): Promise<Certificate | undefined>;
  listCertificates(studentId: number): Promise<Certificate[]>;
  getCertificatesByStudent(studentId: number): Promise<Certificate[]>;
  getCertificatesByTrainingCenter(trainingCenterId: number): Promise<Certificate[]>;
  getAllCertificates(): Promise<Certificate[]>;
  getAllTrainingCenterApplications(): Promise<TrainingCenterApplication[]>;
  getAllTestingCenterApplications(): Promise<TrainingCenterApplication[]>;
  isStudentRegisteredInCourse(studentId: number, courseId: number): Promise<boolean>;
  registerStudentInCourse(studentId: number, courseId: number): Promise<CourseEnrollment>;
  exportCourseEnrollments(courseId: number): Promise<{
    studentName: string;
    email: string;
    enrollmentDate: Date;
    status: string;
  }[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  updateCourseStatus(id: number, status: string): Promise<Course | undefined>;
  listEnrollmentsByCenter(centerId: number): Promise<CourseEnrollment[]>;

  // Certificate Matching methods
  createCertificateMatching(matching: InsertCertificateMatching): Promise<CertificateMatching>;
  getCertificateMatching(id: number): Promise<CertificateMatching | undefined>;
  getStudentCertificateMatchings(studentId: number): Promise<CertificateMatching[]>;
  getAllCertificateMatchings(): Promise<CertificateMatching[]>;
  updateCertificateMatching(id: number, updates: Partial<CertificateMatching>): Promise<CertificateMatching | undefined>;
  generateMatchedCertificate(matchingId: number): Promise<Certificate | undefined>;
  
  // Saudi regions and cities methods
  createRegion(region: InsertSaudiRegion): Promise<SaudiRegion>;
  listRegions(): Promise<SaudiRegion[]>;
  getRegion(id: number): Promise<SaudiRegion | undefined>;
  createCity(city: InsertSaudiCity): Promise<SaudiCity>;
  listCities(): Promise<SaudiCity[]>;
  getCitiesByRegion(regionId: number): Promise<SaudiCity[]>;
}

// Use CourseStatus from schema directly
export type CourseStatusType = typeof CourseStatus[keyof typeof CourseStatus];

// Helper function to generate application ID
async function generateApplicationId(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Get the latest application ID for today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayApplications = await db
    .select({ id: trainingCenterApplications.id })
    .from(trainingCenterApplications)
    .where(
      and(
        gte(trainingCenterApplications.submittedAt, startOfDay),
        lte(trainingCenterApplications.submittedAt, endOfDay)
      )
    )
    .orderBy(sql`id DESC`)
    .limit(1);

  // If no applications today, start with 001
  // Otherwise, increment the sequence number
  let sequenceNumber = 1;
  if (todayApplications.length > 0) {
    const lastId = todayApplications[0].id.toString();
    const lastSequence = parseInt(lastId.slice(-3));
    sequenceNumber = lastSequence + 1;
  }

  // Format the sequence number with leading zeros
  const formattedSequence = String(sequenceNumber).padStart(3, '0');
  return `${datePrefix}${formattedSequence}`;
}

// Update status validation in updateCourseStatus method
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async upsertUser(userData: { 
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  }): Promise<User> {
    try {
      // Primero intentamos encontrar el usuario por ID
      const existingUser = await this.getUser(Number(userData.id));
      
      if (existingUser) {
        // Si existe, actualizamos sus datos
        console.log(`Updating existing user with ID: ${userData.id}`);
        const [updatedUser] = await db
          .update(users)
          .set({
            email: userData.email || existingUser.email,
            fullName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || existingUser.fullName,
            updatedAt: new Date()
          })
          .where(eq(users.id, Number(userData.id)))
          .returning();
        return updatedUser;
      } else {
        // Si no existe, creamos un nuevo usuario
        console.log(`Creating new user with ID: ${userData.id}`);
        const [newUser] = await db
          .insert(users)
          .values({
            id: Number(userData.id),
            username: `user${userData.id}`,
            email: userData.email || '',
            password: 'openid-auth-password', // كلمة مرور مؤقتة حيث نستخدم مصادقة OpenID
            fullName: [userData.firstName, userData.lastName].filter(Boolean).join(' ') || 'OpenID User',
            role: 'STUDENT', // Rol predeterminado
            status: 'active',
            dateOfBirth: new Date()
          })
          .returning();
        return newUser;
      }
    } catch (error) {
      console.error('Error in upsertUser:', error);
      throw error;
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Fetching user with ID: ${id}`);
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        console.log(`Found user: ${user.username}, status: ${user.status}, role: ${user.role}`);
      } else {
        console.log(`No user found with ID: ${id}`);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Fetching user with username: "${username}"`);
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      if (user) {
        console.log(`Found user by username: ${username}, ID: ${user.id}, status: ${user.status}, role: ${user.role}`);
      } else {
        console.log(`No user found with username: "${username}"`);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStatus(id: number, status: 'pending' | 'active' | 'suspended'): Promise<User | undefined> {
    return this.updateUser(id, { status });
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return !!deletedUser;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Add getAllUsers method that uses listUsers
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from database...');
      const allUsers = await this.listUsers();
      console.log(`Retrieved ${allUsers.length} users`);
      return allUsers;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // Training Center operations
  async createTrainingCenter(center: Omit<TrainingCenter, "id">): Promise<TrainingCenter> {
    const [newCenter] = await db.insert(trainingCenters).values(center).returning();
    return newCenter;
  }

  async getTrainingCenter(id: number): Promise<TrainingCenter | undefined> {
    const [center] = await db.select().from(trainingCenters).where(eq(trainingCenters.id, id));
    return center;
  }

  async listTrainingCenters(): Promise<TrainingCenter[]> {
    return db.select().from(trainingCenters);
  }

  // Training Center Application operations
  async createTrainingCenterApplication(application: Partial<InsertTrainingCenterApplication>): Promise<TrainingCenterApplication> {
    // Generate a formatted application ID
    const formattedId = await generateApplicationId();
    
    // تحليل الكائن المدخل لنكوّن كائن جديد يحتوي على الأعمدة المتاحة فقط
    console.log('تحليل بيانات الطلب والتأكد من توافقها مع هيكل الجدول الحالي...');
    
    // حذف الحقول الجديدة التي قد لا تكون موجودة في قاعدة البيانات الحالية
    const { regionId, cityId, regionName, ...safeApplicationData } = application;
    
    // إضافة رقم الطلب وتعيين القيم الافتراضية 
    const preparedData = {
      ...safeApplicationData,
      id: parseInt(formattedId), // تحويل معرف الطلب المنسق إلى رقم
      status: application.status || 'تحت المراجعة',
      submittedAt: application.submittedAt || new Date(),
    };
    
    console.log('البيانات المحضرة للإدخال:', JSON.stringify(preparedData, null, 2));

    const [newApplication] = await db
      .insert(trainingCenterApplications)
      .values(preparedData)
      .returning();
    return newApplication;
  }

  async getTrainingCenterApplication(id: number): Promise<TrainingCenterApplication | undefined> {
    try {
      // تحديد الأعمدة التي سيتم استرجاعها بوضوح لتجنب مشاكل التوافق
      const applications = await db
        .select({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        })
        .from(trainingCenterApplications)
        .where(and(
          eq(trainingCenterApplications.id, id),
          eq(trainingCenterApplications.type, 'training_center')
        ));
      
      if (applications.length > 0) {
        console.log('تم العثور على طلب مركز تدريب:', applications[0]);
        // تسجيل معلومات المرفقات
        console.log('حالة المرفقات:');
        console.log('- السجل التجاري:', applications[0].commercialRecordPath ? 'موجود' : 'غير موجود');
        console.log('- الضمان المالي:', applications[0].financialGuaranteePath ? 'موجود' : 'غير موجود');
        console.log('- وثائق الهوية:', applications[0].identityDocumentsPath ? 'موجود' : 'غير موجود');
        return applications[0];
      }
      
      return undefined;
    } catch (error) {
      console.error('Error fetching training center application:', error);
      return undefined;
    }
  }
  
  async getTestingCenterApplication(id: number): Promise<TrainingCenterApplication | undefined> {
    try {
      // تحديد الأعمدة التي سيتم استرجاعها بوضوح لتجنب مشاكل التوافق
      const applications = await db
        .select({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        })
        .from(trainingCenterApplications)
        .where(and(
          eq(trainingCenterApplications.id, id),
          eq(trainingCenterApplications.type, 'testing_center')
        ));
      
      if (applications.length > 0) {
        console.log('تم العثور على طلب مركز اختبار:', applications[0]);
        // تسجيل معلومات المرفقات
        console.log('حالة المرفقات:');
        console.log('- السجل التجاري:', applications[0].commercialRecordPath ? 'موجود' : 'غير موجود');
        console.log('- الضمان المالي:', applications[0].financialGuaranteePath ? 'موجود' : 'غير موجود');
        console.log('- وثائق الهوية:', applications[0].identityDocumentsPath ? 'موجود' : 'غير موجود');
        return applications[0];
      }
      
      return undefined;
    } catch (error) {
      console.error('Error fetching testing center application:', error);
      return undefined;
    }
  }
  
  async getTestingCenterApplicationsByUser(userId: number): Promise<TrainingCenterApplication[]> {
    try {
      console.log('Fetching testing center applications for user:', userId);
      
      // استعلام مباشر للحصول على طلبات مراكز الاختبار فقط للمستخدم المحدد
      const result = await db.execute(sql`
        SELECT * FROM training_center_applications 
        WHERE user_id = ${userId} AND type = 'testing_center'
        ORDER BY submitted_at DESC
      `);
      
      // معالجة النتائج
      const rows = result.rows || [];
      console.log(`Found ${rows.length} raw testing center applications for user ${userId}`);
      
      // تحويل أسماء الأعمدة من snake_case إلى camelCase
      const formattedApplications = rows.map((app: any) => ({
        id: Number(app.id),
        userId: Number(app.user_id),
        centerName: app.center_name,
        managerName: app.manager_name,
        address: app.address,
        city: app.city,
        phone: app.phone,
        email: app.email,
        type: app.type,
        status: app.status,
        submittedAt: app.submitted_at,
        reviewedAt: app.reviewed_at,
        reviewedBy: app.reviewed_by ? Number(app.reviewed_by) : null,
        reviewNotes: app.review_notes,
        commercialRecordPath: app.commercial_record_path,
        financialGuaranteePath: app.financial_guarantee_path,
        identityDocumentsPath: app.identity_documents_path,
        certificateId: app.certificate_id ? Number(app.certificate_id) : null
      }));
      
      console.log(`Formatted ${formattedApplications.length} testing center applications for user ${userId}`);
      return formattedApplications;
    } catch (error) {
      console.error('Error fetching testing center applications for user:', userId, error);
      return [];
    }
  }

  async getTrainingCenterApplicationsByUser(userId: number): Promise<TrainingCenterApplication[]> {
    try {
      console.log('Fetching applications for user:', userId);
      const applications = await db
        .select({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes
        })
        .from(trainingCenterApplications)
        .where(eq(trainingCenterApplications.userId, userId))
        .orderBy(sql`${trainingCenterApplications.submittedAt} DESC`);

      console.log('Raw applications found:', applications);

      // تحويل bigint إلى number للتوافق مع الواجهة
      const formattedApplications = applications.map(app => ({
        ...app,
        id: Number(app.id),
        userId: Number(app.userId),
        reviewedBy: app.reviewedBy ? Number(app.reviewedBy) : null
      }));

      console.log('Formatted applications:', formattedApplications);
      return formattedApplications;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw error;
    }
  }

  async updateTrainingCenterApplicationStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected',
    reviewNotes: string,
    reviewedBy: number
  ): Promise<TrainingCenterApplication | undefined> {
    const [updatedApplication] = await db
      .update(trainingCenterApplications)
      .set({
        status,
        reviewNotes,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(trainingCenterApplications.id, id))
      .returning();
    return updatedApplication;
  }

  async updateTrainingCenterApplication(
    id: number,
    updates: Partial<TrainingCenterApplication>
  ): Promise<TrainingCenterApplication | undefined> {
    try {
      // تحديد الحقول التي سيتم تحديثها بشكل صريح
      const updateableFields: Record<string, any> = {};
      
      // فقط إضافة الحقول الموجودة في الكائن المحدَّث
      if (updates.status !== undefined) updateableFields.status = updates.status;
      if (updates.reviewNotes !== undefined) updateableFields.reviewNotes = updates.reviewNotes;
      if (updates.reviewedAt !== undefined) updateableFields.reviewedAt = updates.reviewedAt;
      if (updates.reviewedBy !== undefined) updateableFields.reviewedBy = updates.reviewedBy;
      if (updates.certificateId !== undefined) updateableFields.certificateId = updates.certificateId;
      
      // تحديث التطبيق
      const [updatedApplication] = await db
        .update(trainingCenterApplications)
        .set(updateableFields)
        .where(eq(trainingCenterApplications.id, id))
        .returning({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        });

      return {
        ...updatedApplication,
        id: Number(updatedApplication.id),
        userId: Number(updatedApplication.userId),
        reviewedBy: updatedApplication.reviewedBy ? Number(updatedApplication.reviewedBy) : null
      };
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }


  /**
   * تحديث طلب مركز اختبار
   * تستخدم هذه الوظيفة لتحديث حالة ومعلومات طلبات مراكز الاختبار
   */
  async updateTestingCenterApplication(
    id: number,
    updates: Partial<TrainingCenterApplication>
  ): Promise<TrainingCenterApplication | undefined> {
    try {
      console.log(`Updating testing center application with ID: ${id}`, updates);
      // تحديد الحقول التي سيتم تحديثها بشكل صريح
      const updateableFields: Record<string, any> = {};
      
      // فقط إضافة الحقول الموجودة في الكائن المحدَّث
      if (updates.status !== undefined) updateableFields.status = updates.status;
      if (updates.reviewNotes !== undefined) updateableFields.reviewNotes = updates.reviewNotes;
      if (updates.reviewedAt !== undefined) updateableFields.reviewedAt = updates.reviewedAt;
      if (updates.reviewedBy !== undefined) updateableFields.reviewedBy = updates.reviewedBy;
      if (updates.certificateId !== undefined) updateableFields.certificateId = updates.certificateId;
      
      // تحديث التطبيق مع التأكد من أنه طلب مركز اختبار
      const [updatedApplication] = await db
        .update(trainingCenterApplications)
        .set(updateableFields)
        .where(and(
          eq(trainingCenterApplications.id, id),
          eq(trainingCenterApplications.type, 'testing_center')
        ))
        .returning({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        });

      if (!updatedApplication) {
        console.log('No testing center application found to update with ID:', id);
        return undefined;
      }

      // إذا تمت الموافقة على الطلب، قم بإنشاء سجل مركز اختبار
      if (updates.status === 'مقبول' || updates.status === 'approved') {
        try {
          console.log(`Application ${id} approved for testing center, creating test center record for user ${updatedApplication.userId}`);
          
          // التحقق مما إذا كان هناك مركز اختبار موجود بالفعل لهذا المستخدم
          const existingTestCenter = await this.getTestingCenterByUserId(Number(updatedApplication.userId));
          
          if (existingTestCenter) {
            // إذا كان موجوداً، قم بتحديثه
            console.log(`Updating existing test center for user ID: ${updatedApplication.userId}`);
            
            await db
              .update(testCenters)
              .set({ 
                status: 'approved',
                name: updatedApplication.centerName || 'مركز اختبار',
                address: updatedApplication.address || '',
                updatedAt: new Date()
              })
              .where(eq(testCenters.id, existingTestCenter.id));
          } else {
            // إنشاء سجل جديد لمركز الاختبار
            console.log(`Creating new test center for user ID: ${updatedApplication.userId}`);
            
            await db.insert(testCenters).values({
              userId: Number(updatedApplication.userId),
              name: updatedApplication.centerName || 'مركز اختبار',
              status: 'approved',
              address: updatedApplication.address || '',
              facilityId: updatedApplication.facilityId || (Math.floor(Math.random() * 900000) + 100000).toString(),
              licenseNumber: `TC-${Math.floor(Math.random() * 900000) + 100000}`,
              approvalDate: new Date(),
              expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // تنتهي بعد سنة
            });
          }
          
          // تحديث حالة المستخدم إلى نشط
          await db
            .update(users)
            .set({ status: 'active' })
            .where(eq(users.id, Number(updatedApplication.userId)));
            
          console.log(`Successfully created/updated test center record for application ${id}`);
        } catch (testCenterError) {
          console.error(`Error creating test center record: ${testCenterError}`);
          // لا نريد أن نفشل عملية التحديث بأكملها إذا فشل إنشاء سجل مركز الاختبار
          // لذلك فقط نسجل الخطأ
        }
      }

      console.log('Successfully updated testing center application:', updatedApplication);
      return {
        ...updatedApplication,
        id: Number(updatedApplication.id),
        userId: Number(updatedApplication.userId),
        reviewedBy: updatedApplication.reviewedBy ? Number(updatedApplication.reviewedBy) : null
      };
    } catch (error) {
      console.error('Error updating testing center application:', error);
      throw error;
    }
  }

  // Test Center operations
  async createTestCenter(center: Omit<TestCenter, "id">): Promise<TestCenter> {
    const [newCenter] = await db.insert(testCenters).values(center).returning();
    return newCenter;
  }

  async getTestCenter(id: number): Promise<TestCenter | undefined> {
    const [center] = await db.select().from(testCenters).where(eq(testCenters.id, id));
    return center;
  }

  async getTestingCenterByUserId(userId: number): Promise<TestCenter | undefined> {
    try {
      console.log(`Fetching testing center for user ID: ${userId}`);
      
      // استعلام للحصول على مركز الاختبار المرتبط بهذا المستخدم
      const result = await db.execute(sql`
        SELECT tc.* 
        FROM test_centers tc
        JOIN users u ON tc.user_id = u.id
        WHERE u.id = ${userId} AND u.role = 'TESTING_CENTER'
      `);
      
      if (!result.rows || result.rows.length === 0) {
        // محاولة ثانية باستخدام معرف المستخدم مباشرة
        const directResult = await db.execute(sql`
          SELECT * FROM test_centers 
          WHERE user_id = ${userId}
        `);
        
        if (!directResult.rows || directResult.rows.length === 0) {
          console.log(`No testing center found for user ID: ${userId}`);
          return undefined;
        }
        
        console.log(`Found testing center for user ID ${userId} using direct query`);
        const center = directResult.rows[0] as any;
        
        // تحويل البيانات إلى camelCase
        return {
          id: Number(center.id),
          name: center.name,
          userId: Number(center.user_id),
          status: center.status,
          address: center.address,
          facilityId: center.facility_id,
          licenseNumber: center.license_number,
          approvalDate: center.approval_date,
          expiryDate: center.expiry_date
        };
      }
      
      console.log(`Found testing center for user ID ${userId}`);
      const center = result.rows[0] as any;
      
      // تحويل البيانات إلى camelCase
      return {
        id: Number(center.id),
        name: center.name,
        userId: Number(center.user_id),
        status: center.status,
        address: center.address,
        facilityId: center.facility_id,
        licenseNumber: center.license_number,
        approvalDate: center.approval_date,
        expiryDate: center.expiry_date
      };
    } catch (error) {
      console.error(`Error fetching testing center for user ID: ${userId}`, error);
      return undefined;
    }
  }
  
  async getExamsByTestingCenterId(testingCenterId: number): Promise<ExamSchedule[]> {
    try {
      console.log(`Fetching exams for testing center ID: ${testingCenterId}`);
      
      // استعلام للحصول على الامتحانات المرتبطة بمركز الاختبار
      const result = await db.execute(sql`
        SELECT * FROM exam_schedules 
        WHERE testing_center_id = ${testingCenterId}
        ORDER BY exam_date DESC
      `);
      
      if (!result.rows || result.rows.length === 0) {
        console.log(`No exams found for testing center ID: ${testingCenterId}`);
        return [];
      }
      
      console.log(`Found ${result.rows.length} exams for testing center ID: ${testingCenterId}`);
      
      // تحويل البيانات إلى camelCase
      return result.rows.map((exam: any) => ({
        id: Number(exam.id),
        title: exam.title,
        description: exam.description,
        examType: exam.exam_type,
        capacity: Number(exam.capacity),
        registeredCandidates: exam.registered_candidates !== null ? Number(exam.registered_candidates) : null,
        examDate: new Date(exam.exam_date),
        location: exam.location,
        status: exam.status,
        testing_center_id: Number(exam.testing_center_id),
        isVisible: exam.is_visible,
        createdAt: exam.created_at ? new Date(exam.created_at) : null,
        updatedAt: exam.updated_at ? new Date(exam.updated_at) : null
      }));
    } catch (error) {
      console.error(`Error fetching exams for testing center ID: ${testingCenterId}`, error);
      return [];
    }
  }

  async listTestCenters(): Promise<TestCenter[]> {
    return db.select().from(testCenters);
  }

  // Course operations
  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    try {
      console.log('Creating course with data:', course);
      
      // تحديد الحقول المسموح بها فقط من البيانات المستلمة
      const allowedFields = {
        training_center_id: course.training_center_id,
        title: course.title,
        description: course.description,
        duration: course.duration,
        capacity: course.capacity,
        start_date: new Date(course.start_date),
        end_date: new Date(course.end_date),
        status: course.status || 'مجدولة',
        location: course.location,
        // إضافة وتحويل البيانات الوصفية إلى JSON إذا كانت موجودة
        metadata: course.metadata || null
      };
      
      // حذف أي حقول إضافية غير معروفة مثل region_id أو city_id
      const cleanedCourseData = { ...allowedFields };
      console.log('Cleaned course data for insertion:', cleanedCourseData);
      
      const [newCourse] = await db.insert(courses).values(cleanedCourseData).returning();
      console.log('Created course:', newCourse);
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async listCourses(): Promise<Course[]> {
    try {
      console.log('Fetching all courses');
      const allCourses = await db
        .select()
        .from(courses)
        .orderBy(courses.start_date);
      console.log('Retrieved courses:', allCourses);
      return allCourses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async listCoursesByTrainingCenter(trainingCenterId: number): Promise<Course[]> {
    try {
      console.log('Fetching courses for training center:', trainingCenterId);
      const centerCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.training_center_id, trainingCenterId))
        .orderBy(courses.start_date);
      console.log('Retrieved courses:', centerCourses);
      return centerCourses;
    } catch (error) {
      console.error('Error fetching courses for training center:', error);
      throw error;
    }
  }

  async listCoursesByCenter(centerId: number): Promise<Course[]> {
    try {
      console.log('Fetching courses for center:', centerId);
      const centerCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.training_center_id, centerId))
        .orderBy(courses.start_date);
      console.log('Retrieved courses:', centerCourses);
      return centerCourses;
    } catch (error) {
      console.error('Error fetching courses for center:', error);
      throw error;
    }
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    try {
      console.log('Updating course:', id, updates);
      const [updatedCourse] = await db
        .update(courses)
        .set(updates)
        .where(eq(courses.id, id))
        .returning();
      console.log('Updated course:', updatedCourse);
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id: number): Promise<boolean> {
    try {
      console.log('Deleting course:', id);
      const [deletedCourse] = await db
        .delete(courses)
        .where(eq(courses.id, id))
        .returning();
      console.log('Deleted course:', deletedCourse);
      return !!deletedCourse;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Course Enrollment operations
  async createCourseEnrollment(enrollment: Omit<CourseEnrollment, "id">): Promise<CourseEnrollment> {
    const [newEnrollment] = await db.insert(courseEnrollments)
      .values({
        ...enrollment,
        status: enrollment.status || 'pending',
        enrollmentDate: new Date()
      })
      .returning();
    return newEnrollment;
  }

  async getCourseEnrollment(id: number): Promise<CourseEnrollment | undefined> {
    const [enrollment] = await db.select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, id));
    return enrollment;
  }

  async listCourseEnrollments(courseId: number): Promise<CourseEnrollment[]> {
    return db.select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId))
      .orderBy(courseEnrollments.enrollmentDate);
  }

  async listStudentEnrollments(studentId: number): Promise<CourseEnrollment[]> {
    try {
      console.log(`Fetching enrollments for student ${studentId}`);
      const enrollments = await db.select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.studentId, studentId))
        .orderBy(courseEnrollments.enrollmentDate);
      
      console.log(`Found ${enrollments.length} enrollments for student ${studentId}:`, enrollments);
      
      // Make sure we're returning proper numbers
      return enrollments.map(e => ({
        ...e,
        id: Number(e.id),
        studentId: Number(e.studentId),
        courseId: Number(e.courseId)
      }));
    } catch (error) {
      console.error(`Error fetching enrollments for student ${studentId}:`, error);
      throw error;
    }
  }

  async cancelCourseEnrollment(id: number): Promise<boolean> {
    const [enrollment] = await db
      .update(courseEnrollments)
      .set({ status: 'cancelled' })
      .where(eq(courseEnrollments.id, id))
      .returning();
    return !!enrollment;
  }

  async getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]> {
    try {
      console.log('Fetching enrollments for course:', courseId);
      const enrollments = await db
        .select({
          id: courseEnrollments.id,
          studentId: courseEnrollments.studentId,
          courseId: courseEnrollments.courseId,
          enrollmentDate: courseEnrollments.enrollmentDate,
          status: courseEnrollments.status,
          completionDate: courseEnrollments.completionDate,
          studentName: users.fullName,
          email: users.email,
          phone: users.phone
        })
        .from(courseEnrollments)
        .innerJoin(users, eq(courseEnrollments.studentId, users.id))
        .where(eq(courseEnrollments.courseId, courseId))
        .orderBy(courseEnrollments.enrollmentDate);

      console.log('Retrieved enrollments with student details:', enrollments);

      // Format phone numbers and ensure numeric fields are properly converted
      const processedEnrollments = enrollments.map(enrollment => ({
        ...enrollment,
        id: Number(enrollment.id),
        studentId: Number(enrollment.studentId),
        courseId: Number(enrollment.courseId),
        phone: enrollment.phone?.startsWith('0') ? enrollment.phone : `0${enrollment.phone}`
      }));

      return processedEnrollments;
    } catch (error) {
      console.error('Error in getCourseEnrollments:', error);
      throw new Error('Failed to fetch course enrollments');
    }
  }

  async getEnrollment(studentId: number, courseId: number): Promise<CourseEnrollment | undefined> {
    try {
      console.log(`Looking for enrollment with studentId=${studentId} and courseId=${courseId}`);
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.studentId, studentId),
            eq(courseEnrollments.courseId, courseId)
          )
        );
      console.log('Enrollment found:', enrollment || 'None found');
      return enrollment;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      throw error;
    }
  }

  async updateEnrollmentStatus(enrollmentId: number, status: string): Promise<CourseEnrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(courseEnrollments)
      .set({ status })
      .where(eq(courseEnrollments.id, enrollmentId))
      .returning();
    return updatedEnrollment;
  }

  // Exam Schedule operations
  async createExamSchedule(schedule: Omit<ExamSchedule, "id">): Promise<ExamSchedule> {
    const [newSchedule] = await db.insert(examSchedules).values(schedule).returning();
    return newSchedule;
  }

  async getExamSchedule(id: number): Promise<ExamSchedule | undefined> {
    const [schedule] = await db.select().from(examSchedules).where(eq(examSchedules.id, id));
    return schedule;
  }

  async listExamSchedules(): Promise<ExamSchedule[]> {
    return db.select().from(examSchedules);
  }

  // Exam Registration operations
  async createExamRegistration(registration: Omit<ExamRegistration, "id">): Promise<ExamRegistration> {
    const [newRegistration] = await db.insert(examRegistrations).values(registration).returning();
    return newRegistration;
  }

  async getExamRegistration(id: number): Promise<ExamRegistration | undefined> {
    const [registration] = await db.select().from(examRegistrations).where(eq(examRegistrations.examScheduleId, id));
    return registration;
  }

  async listExamRegistrations(scheduleId: number): Promise<ExamRegistration[]> {
    return db.select().from(examRegistrations).where(eq(examRegistrations.examScheduleId, scheduleId));
  }

  // Certificate operations
  async createCertificate(certificate: Omit<Certificate, "id">): Promise<Certificate> {
    try {
      console.log('Creating certificate:', certificate);

      // Set expiry date for center certificates
      let expiresAt = undefined;
      if (certificate.type === 'training_center' || certificate.type === 'testing_center') {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        expiresAt = oneYearFromNow;
      }

      // Create certificate with proper metadata
      const [newCertificate] = await db.insert(certificates).values({
        ...certificate,
        issuedAt: new Date(),
        expiresAt,
        status: 'active'
      }).returning();

      // If this is a center certificate, update the application with the certificate ID
      if (certificate.applicationId &&
        (certificate.type === 'training_center' || certificate.type === 'testing_center')) {
        await db
          .update(trainingCenterApplications)
          .set({ certificateId: newCertificate.id })
          .where(eq(trainingCenterApplications.id, certificate.applicationId));
      }

      console.log('Created certificate:', newCertificate);
      return newCertificate;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    try {
      const [certificate] = await db
        .select({
          ...certificates,
          applicationStatus: trainingCenterApplications.status,
          applicationType: trainingCenterApplications.type
        })
        .from(certificates)
        .leftJoin(
          trainingCenterApplications,
          eq(certificates.applicationId, trainingCenterApplications.id)
        )
        .where(eq(certificates.id, id));

      return certificate;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  }

  async getCertificateByCourseAndStudent(courseId: number, studentId: number): Promise<Certificate | undefined> {
    try {
      console.log('Fetching certificate for course:', courseId, 'and student:', studentId);
      const [certificate] = await db
        .select()
        .from(certificates)
        .where(
          and(
            eq(certificates.courseId, courseId),
            eq(certificates.studentId, studentId)
          )
        );
      console.log('Found certificate:', certificate);
      return certificate;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  }

  async listCertificates(studentId: number): Promise<Certificate[]> {
    try {
      const studentCertificates = await db
        .select()
        .from(certificates)
        .where(eq(certificates.studentId, studentId))
        .orderBy(certificates.issuedAt);
      return studentCertificates;
    } catch (error) {
      console.error('Error listing certificates:', error);
      throw error;
    }
  }

  async getCertificatesByStudent(studentId: number): Promise<Certificate[]> {
    try {
      return await db
        .select()
        .from(certificates)
        .where(eq(certificates.studentId, studentId))
        .orderBy(certificates.issuedAt);
    } catch (error) {
      console.error('Error listing certificates:', error);
      throw error;
    }
  }

  async getCertificatesByTrainingCenter(trainingCenterId: number): Promise<Certificate[]> {
    try {
      // Get all courses by this training center
      const centerCourses = await this.listCoursesByTrainingCenter(trainingCenterId);
      const courseIds = centerCourses.map(course => course.id);

      // Get certificates for these courses
      return await db
        .select()
        .from(certificates)
        .where(
          sql`${certificates.courseId} = ANY(${sql.array(courseIds, 'int4')})`
        )
        .orderBy(certificates.issuedAt);
    } catch (error) {
      console.error('Error listing certificates:', error);
      throw error;
    }
  }

  async getAllCertificates(): Promise<Certificate[]> {
    try {
      return await db
        .select()
        .from(certificates)
        .orderBy(certificates.issuedAt);
    } catch (error) {
      console.error('Error listing all certificates:', error);
      throw error;
    }
  }

  async getAllTrainingCenterApplications(): Promise<TrainingCenterApplication[]> {
    try {
      console.log('Executing database query for training center applications...');
      const applications = await db
        .select({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        })
        .from(trainingCenterApplications)
        .where(eq(trainingCenterApplications.type, 'training_center'))
        .orderBy(trainingCenterApplications.submittedAt);

      // تحويل bigint إلى number للتوافق مع الواجهة
      const formattedApplications = applications.map(app => ({
        ...app,
        id: Number(app.id),
        userId: Number(app.userId),
        reviewedBy: app.reviewedBy ? Number(app.reviewedBy) : null
      }));

      console.log('Query result:', formattedApplications);
      return formattedApplications;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async getAllTestingCenterApplications(): Promise<TrainingCenterApplication[]> {
    try {
      console.log('Executing database query for testing center applications...');
      const applications = await db
        .select({
          id: trainingCenterApplications.id,
          userId: trainingCenterApplications.userId,
          centerName: trainingCenterApplications.centerName,
          managerName: trainingCenterApplications.managerName,
          address: trainingCenterApplications.address,
          city: trainingCenterApplications.city,
          phone: trainingCenterApplications.phone,
          email: trainingCenterApplications.email,
          type: trainingCenterApplications.type,
          status: trainingCenterApplications.status,
          submittedAt: trainingCenterApplications.submittedAt,
          reviewedAt: trainingCenterApplications.reviewedAt,
          reviewedBy: trainingCenterApplications.reviewedBy,
          reviewNotes: trainingCenterApplications.reviewNotes,
          commercialRecordPath: trainingCenterApplications.commercialRecordPath,
          financialGuaranteePath: trainingCenterApplications.financialGuaranteePath,
          identityDocumentsPath: trainingCenterApplications.identityDocumentsPath,
          certificateId: trainingCenterApplications.certificateId
        })
        .from(trainingCenterApplications)
        .where(eq(trainingCenterApplications.type, 'testing_center'))
        .orderBy(trainingCenterApplications.submittedAt);

      // تحويل bigint إلى number للتوافق مع الواجهة
      const formattedApplications = applications.map(app => ({
        ...app,
        id: Number(app.id),
        userId: Number(app.userId),
        reviewedBy: app.reviewedBy ? Number(app.reviewedBy) : null
      }));

      return formattedApplications;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async isStudentRegisteredInCourse(studentId: number, courseId: number): Promise<boolean> {
    try {
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.studentId, studentId),
            eq(courseEnrollments.courseId, courseId)
          )
        );
      return !!enrollment;
    } catch (error) {
      console.error('Error checking course enrollment:', error);
      throw error;
    }
  }

  async registerStudentInCourse(studentId: number, courseId: number): Promise<CourseEnrollment> {
    try {
      const [enrollment] = await db
        .insert(courseEnrollments)
        .values({
          courseId: courseId,
          studentId: studentId,
          enrollmentDate: new Date(),
          status: 'pending'
        })
        .returning();

      return {
        ...enrollment,
        courseId: Number(enrollment.courseId),
        studentId: Number(enrollment.studentId),
        id: Number(enrollment.id)
      };
    } catch (error) {
      console.error('Error registering student in course:', error);
      throw error;
    }
  }

  async exportCourseEnrollments(courseId: number): Promise<{
    studentName: string;
    email: string;
    enrollmentDate: Date;
    status: string;
  }[]> {
    try {
      console.log('Exporting enrollments for course:', courseId);
      const enrollments = await db
        .select({
          id: courseEnrollments.id,
          studentId: courseEnrollments.studentId,
          enrollmentDate: courseEnrollments.enrollmentDate,
          status: courseEnrollments.status,
          studentName: users.fullName,
          email: users.email,
        })
        .from(courseEnrollments)
        .innerJoin(users, eq(courseEnrollments.studentId, users.id))
        .where(eq(courseEnrollments.courseId, courseId))
        .orderBy(courseEnrollments.enrollmentDate);

      console.log('Retrieved enrollments for export:', enrollments);
      return enrollments;
    } catch (error) {
      console.error('Error exporting course enrollments:', error);
      throw error;
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const [newNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id));
      return notification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(sql`${notifications.createdAt} DESC`);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      const [notification] = await db
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning();
      return !!notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  async updateCourseStatus(
    id: number,
    status: string
  ): Promise<Course | undefined> {
    try {
      console.log('Updating course status:', { id, status });

      // First check if the course exists
      const existingCourse = await this.getCourse(id);
      if (!existingCourse) {
        console.error('Course not found');
        return undefined;
      }

      // Log the status for debugging
      console.log('Current course status:', existingCourse.status);
      console.log('Attempting to set status to:', status);
      
      // إزالة التحقق من الحالة للسماح بأي قيمة
      console.log('Validation removed - allowing any status value');

      const [updatedCourse] = await db
        .update(courses)
        .set({ 
          status: status 
        })
        .where(eq(courses.id, id))
        .returning();

      console.log('Successfully updated course:', updatedCourse);
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course status:', error);
      throw error;
    }
  }
  async listEnrollmentsByCenter(centerId: number): Promise<CourseEnrollment[]> {
    try {
      console.log('Fetching enrollments for center:', centerId);
      const centerEnrollments = await db
        .select({
          enrollment: courseEnrollments,
          course: courses,
        })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .where(eq(courses.training_center_id, centerId));

      console.log('Retrieved enrollments:', centerEnrollments);
      return centerEnrollments.map(e => ({
        ...e.enrollment,
        id: Number(e.enrollment.id),
        studentId: Number(e.enrollment.studentId),
        courseId: Number(e.enrollment.courseId)
      }));
    } catch (error) {
      console.error('Error fetching enrollments for center:', error);
      throw error;
    }
  }
  async listUsersByRole(role: string): Promise<User[]> {
    try {
      console.log('Fetching users by role:', role);
      const usersList = await db
        .select()
        .from(users)
        .where(eq(users.role, role));
      return usersList;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Certificate Matching Implementation
  async createCertificateMatching(matching: InsertCertificateMatching): Promise<CertificateMatching> {
    try {
      console.log('Creating certificate matching:', matching);
      const [newMatching] = await db
        .insert(certificateMatching)
        .values(matching)
        .returning();
      return newMatching;
    } catch (error) {
      console.error('Error creating certificate matching:', error);
      throw error;
    }
  }

  async getCertificateMatching(id: number): Promise<CertificateMatching | undefined> {
    try {
      const [matching] = await db
        .select()
        .from(certificateMatching)
        .where(eq(certificateMatching.id, id));
      return matching;
    } catch (error) {
      console.error(`Error fetching certificate matching with id ${id}:`, error);
      throw error;
    }
  }

  async getStudentCertificateMatchings(studentId: number): Promise<CertificateMatching[]> {
    try {
      console.log('Fetching certificate matchings for student:', studentId);
      return db
        .select()
        .from(certificateMatching)
        .where(eq(certificateMatching.studentId, studentId))
        .orderBy(desc(certificateMatching.submissionDate));
    } catch (error) {
      console.error(`Error fetching certificate matchings for student ${studentId}:`, error);
      throw error;
    }
  }

  async getAllCertificateMatchings(): Promise<CertificateMatching[]> {
    try {
      console.log('Fetching all certificate matchings');
      return db
        .select()
        .from(certificateMatching)
        .orderBy(desc(certificateMatching.submissionDate));
    } catch (error) {
      console.error('Error fetching all certificate matchings:', error);
      throw error;
    }
  }

  async updateCertificateMatching(id: number, updates: Partial<CertificateMatching>): Promise<CertificateMatching | undefined> {
    try {
      console.log(`Updating certificate matching ${id}:`, updates);
      
      // If updating status to "مطابقة" and no reviewDate is provided, set it
      if (updates.status === 'مطابقة' && !updates.reviewDate) {
        updates.reviewDate = new Date();
      }

      const [updatedMatching] = await db
        .update(certificateMatching)
        .set(updates)
        .where(eq(certificateMatching.id, id))
        .returning();
      
      return updatedMatching;
    } catch (error) {
      console.error(`Error updating certificate matching ${id}:`, error);
      throw error;
    }
  }

  async generateMatchedCertificate(matchingId: number): Promise<Certificate | undefined> {
    try {
      console.log(`Generating matched certificate for matching ${matchingId}`);
      
      // Get the matching request
      const matching = await this.getCertificateMatching(matchingId);
      if (!matching || matching.status !== 'مطابقة') {
        console.warn(`Cannot generate certificate: matching not found or status is not 'مطابقة'`);
        return undefined;
      }

      // Get the student info
      const student = await this.getUser(matching.studentId);
      if (!student) {
        console.warn(`Cannot generate certificate: student not found`);
        return undefined;
      }

      // Generate certificate number
      const now = new Date();
      const prefix = 'MATCH-';
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const randomPart = Math.floor(10000 + Math.random() * 90000);
      const certificateNumber = `${prefix}${datePart}-${randomPart}`;

      // Create a new certificate
      const certificateData = {
        certificateNumber,
        studentId: matching.studentId,
        studentName: student.fullName || student.username,
        issuedAt: now,
        status: 'active' as const,
        type: 'course' as const,
        courseName: `مطابقة: ${matching.courseName} (${matching.instituteName})`,
        centerName: matching.instituteName
      };

      const certificate = await this.createCertificate(certificateData);

      // Update the matching record with the certificate ID
      await this.updateCertificateMatching(matchingId, {
        matchedCertificateId: certificate.id
      });

      // Create a notification for the student
      await this.createNotification({
        userId: matching.studentId,
        type: 'certificate_issued',
        title: 'تم إصدار شهادة مطابقة تدريب',
        message: `تم إصدار شهادة مطابقة تدريب للدورة: ${matching.courseName}`,
        metadata: {
          certificateId: certificate.id
        }
      });

      return certificate;
    } catch (error) {
      console.error(`Error generating matched certificate for matching ${matchingId}:`, error);
      throw error;
    }
  }

  // Saudi regions and cities methods 
  async createRegion(region: InsertSaudiRegion): Promise<SaudiRegion> {
    try {
      const [newRegion] = await db.insert(saudiRegionsTable).values(region).returning();
      return newRegion;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }

  async listRegions(): Promise<SaudiRegion[]> {
    try {
      const regions = await db.select().from(saudiRegionsTable).orderBy(saudiRegionsTable.nameAr);
      return regions;
    } catch (error) {
      console.error('Error listing regions:', error);
      throw error;
    }
  }

  async getRegion(id: number): Promise<SaudiRegion | undefined> {
    try {
      const [region] = await db.select().from(saudiRegionsTable).where(eq(saudiRegionsTable.id, id));
      return region;
    } catch (error) {
      console.error('Error getting region:', error);
      throw error;
    }
  }

  async createCity(city: InsertSaudiCity): Promise<SaudiCity> {
    try {
      const [newCity] = await db.insert(saudiCitiesTable).values(city).returning();
      return newCity;
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  }
  
  // دالة مساعدة للحصول على اسم المدينة من معرّفها
  async getCityName(cityId: number | string | null | undefined): Promise<string> {
    if (!cityId) return 'غير محدد';
    
    try {
      const id = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
      console.log(`جاري البحث عن اسم المدينة بمعرّف: ${id}`);
      
      const [city] = await db
        .select()
        .from(saudiCitiesTable)
        .where(eq(saudiCitiesTable.id, id));
      
      if (city) {
        console.log(`تم العثور على المدينة: ${city.nameAr} (${city.id})`);
        return city.nameAr;
      } else {
        console.log(`لم يتم العثور على مدينة بمعرّف: ${id}`);
        return 'غير معروف';
      }
    } catch (error) {
      console.error(`خطأ أثناء البحث عن اسم المدينة للمعرّف ${cityId}:`, error);
      return 'غير معروف';
    }
  }

  async listCities(): Promise<SaudiCity[]> {
    try {
      const cities = await db.select().from(saudiCitiesTable).orderBy(saudiCitiesTable.nameAr);
      return cities;
    } catch (error) {
      console.error('Error listing cities:', error);
      throw error;
    }
  }

  async getCitiesByRegion(regionId: number): Promise<SaudiCity[]> {
    try {
      console.log(`Fetching cities for region ID: ${regionId}`);
      const cities = await db
        .select()
        .from(saudiCitiesTable)
        .where(eq(saudiCitiesTable.regionId, regionId))
        .orderBy(saudiCitiesTable.nameAr);
      console.log(`Found ${cities.length} cities for region ${regionId}`);
      return cities;
    } catch (error) {
      console.error(`Error getting cities for region ${regionId}:`, error);
      throw error;
    }
  }
  
  async getCityById(cityId: number | string): Promise<SaudiCity | undefined> {
    try {
      const id = typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
      console.log(`Fetching city with ID: ${id}`);
      const [city] = await db
        .select()
        .from(saudiCitiesTable)
        .where(eq(saudiCitiesTable.id, id));
      
      if (city) {
        console.log(`Found city: ${city.nameAr} (${city.id})`);
      } else {
        console.log(`No city found with ID: ${id}`);
      }
      
      return city;
    } catch (error) {
      console.error(`Error fetching city with ID ${cityId}:`, error);
      return undefined;
    }
  }

  async createRegion(region: InsertSaudiRegion): Promise<SaudiRegion> {
    try {
      const [newRegion] = await db
        .insert(saudiRegionsTable)
        .values(region)
        .returning();
      return newRegion;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }

  async listRegions(): Promise<SaudiRegion[]> {
    try {
      const regions = await db
        .select()
        .from(saudiRegionsTable)
        .orderBy(saudiRegionsTable.nameAr);
      return regions;
    } catch (error) {
      console.error('Error listing regions:', error);
      throw error;
    }
  }

  async getRegion(id: number): Promise<SaudiRegion | undefined> {
    try {
      const [region] = await db
        .select()
        .from(saudiRegionsTable)
        .where(eq(saudiRegionsTable.id, id));
      return region || undefined;
    } catch (error) {
      console.error('Error getting region:', error);
      throw error;
    }
  }

  async createCity(city: InsertSaudiCity): Promise<SaudiCity> {
    try {
      const [newCity] = await db
        .insert(saudiCitiesTable)
        .values(city)
        .returning();
      return newCity;
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  }

  async listCities(): Promise<SaudiCity[]> {
    try {
      const cities = await db
        .select()
        .from(saudiCitiesTable)
        .orderBy(saudiCitiesTable.nameAr);
      return cities;
    } catch (error) {
      console.error('Error listing cities:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();