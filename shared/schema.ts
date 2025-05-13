import { pgTable, text, serial, integer, boolean, timestamp, json, date, bigint, time, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const UserRole = {
  TRAINING_CENTER: 'TRAINING_CENTER',
  TESTING_CENTER: 'TESTING_CENTER',
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export type RoleType = typeof UserRole[keyof typeof UserRole];

const roles = ['TRAINING_CENTER', 'TESTING_CENTER', 'STUDENT', 'ADMIN', 'SUPER_ADMIN'] as const;
const regions = [
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'القصيم',
  'الشرقية',
  'عسير',
  'تبوك',
  'حائل',
  'الحدود الشمالية',
  'جازان',
  'نجران',
  'الباحة',
  'الجوف'
] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: roles }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status", { enum: ['pending', 'active', 'suspended'] }).default('pending'),
  dateOfBirth: date("date_of_birth").notNull().default(new Date()),
  nationality: text("nationality"),
  identityNumber: text("identity_number"),
  employer: text("employer"),
  employerAddress: text("employer_address"),
  employerPhone: text("employer_phone"),
  centerName: text("center_name"),
  registrationType: text("registration_type"),
  centerAddress: json("center_address").default({}),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  offeredPrograms: json("offered_programs").default([]),
  geographicalScope: json("geographical_scope").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(roles),
  centerAddress: z.object({
    region: z.string(),
    city: z.string(),
    buildingNo: z.string(),
    street: z.string(),
    additionalNo: z.string().optional(),
  }).optional(),
  offeredPrograms: z.array(z.string()).optional(),
  geographicalScope: z.array(z.enum(regions)).optional(),
  dateOfBirth: z.string().optional().transform(str => str ? new Date(str) : new Date()),
  nationality: z.string().optional(),
  identityNumber: z.string().optional(),
  employer: z.string().optional(),
  employerAddress: z.string().optional(),
  employerPhone: z.string().optional(),
  centerName: z.string().optional(),
  registrationType: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
}).extend({
  password: z.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
    .regex(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
    .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
    .regex(/[^A-Za-z0-9]/, "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const SaudiRegions = regions;

export const trainingCenters = pgTable("training_centers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  facilityId: text("facility_id").notNull(),
  address: text("address").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: text("status", { enum: ['pending', 'approved', 'rejected'] }).notNull(),
  approvalDate: timestamp("approval_date"),
  expiryDate: timestamp("expiry_date"),
});

export const testCenters = pgTable("test_centers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  facilityId: text("facility_id").notNull(),
  address: text("address").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: text("status", { enum: ['pending', 'approved', 'rejected'] }).notNull(),
  approvalDate: timestamp("approval_date"),
  expiryDate: timestamp("expiry_date"),
});

// Update CourseStatus definition to ensure consistency
export const CourseStatus = {
  SCHEDULED: 'مجدولة',
  IN_PROGRESS: 'جارية',
  COMPLETED: 'منتهية', // تم تغيير القيمة من 'مكتملة' إلى 'منتهية' لتتوافق مع قيد التحقق في قاعدة البيانات
  CANCELLED: 'ملغاة'
} as const;

export type CourseStatusType = typeof CourseStatus[keyof typeof CourseStatus];

// Update courses table definition to use any text value for status
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  training_center_id: integer("training_center_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  capacity: integer("capacity").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  status: text("status").notNull().default(CourseStatus.SCHEDULED),
  location: text("location"),
});

// مخطط البيانات الوصفية للدورة (سيتم استخدامه في المستقبل)
export const courseMetadataSchema = z.object({
  objectives: z.array(z.string()).optional(),  // أهداف الدورة
  content: z.array(z.string()).optional(),     // محتوى الدورة
  instructor: z.string().optional(),           // اسم المدرب / المحاضر
  requirements: z.array(z.string()).optional() // متطلبات الدورة
});

// Update insertCourseSchema to use the CourseStatus enum
export const insertCourseSchema = createInsertSchema(courses, {
  status: z.string().default(CourseStatus.SCHEDULED),
}).omit({ id: true });

const courseStatuses = [
  CourseStatus.SCHEDULED,
  CourseStatus.IN_PROGRESS,
  CourseStatus.COMPLETED,
  CourseStatus.CANCELLED
] as const;

export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  studentId: integer("student_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").notNull(),
  status: text("status", { enum: ['pending', 'approved', 'rejected', 'completed'] }).notNull(),
  completionDate: timestamp("completion_date"),
});

export const examSchedules = pgTable("exam_schedules", {
  id: serial("id").primaryKey(),
  testCenterId: integer("test_center_id").notNull(),
  examDate: timestamp("exam_date").notNull(),
  capacity: integer("capacity").notNull(),
  availableSlots: integer("available_slots").notNull(),
  status: text("status", { enum: ['scheduled', 'in_progress', 'completed'] }).notNull(),
});

export const examRegistrations = pgTable("exam_registrations", {
  id: serial("id").primaryKey(),
  examScheduleId: integer("exam_schedule_id").notNull(),
  studentId: integer("student_id").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
  status: text("status", { enum: ['pending', 'confirmed', 'completed', 'cancelled'] }).notNull(),
  result: text("result", { enum: ['pass', 'fail'] }),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateNumber: text("certificate_number").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  status: text("status", { enum: ['active', 'revoked', 'pending'] }).notNull().default('pending'),
  type: text("type", { enum: ['course', 'training_center', 'testing_center'] }).notNull(),

  // Course certificate fields
  studentId: integer("student_id"),
  courseId: integer("course_id"),
  studentName: text("student_name"),
  courseName: text("course_name"),

  // Training/Testing center certificate fields
  centerName: text("center_name"),
  centerAddress: text("center_address"),
  centerCity: text("center_city"),
  managerName: text("manager_name"),
  expiresAt: timestamp("expires_at"),
  applicationId: bigint("application_id", { mode: "number" }),
});

const baseCertificateSchema = {
  certificateNumber: z.string(),
  issuedAt: z.date().optional(),
  status: z.enum(['active', 'revoked', 'pending']).default('pending'),
  type: z.enum(['course', 'training_center', 'testing_center']),
};

export const insertCourseCertificateSchema = createInsertSchema(certificates, {
  ...baseCertificateSchema,
  studentId: z.number(),
  courseId: z.number(),
  studentName: z.string(),
  courseName: z.string(),
  type: z.literal('course'),
}).omit({ id: true });

export const insertTrainingCenterCertificateSchema = createInsertSchema(certificates, {
  ...baseCertificateSchema,
  centerName: z.string(),
  centerAddress: z.string(),
  centerCity: z.string(),
  managerName: z.string(),
  expiresAt: z.date().optional(),
  applicationId: z.number(),
  type: z.literal('training_center'),
}).omit({ id: true });

export const insertTestingCenterCertificateSchema = createInsertSchema(certificates, {
  ...baseCertificateSchema,
  centerName: z.string(),
  centerAddress: z.string(),
  centerCity: z.string(),
  managerName: z.string(),
  expiresAt: z.date().optional(),
  applicationId: z.number(),
  type: z.literal('testing_center'),
}).omit({ id: true });

export type Certificate = typeof certificates.$inferSelect;
export type InsertCourseCertificate = z.infer<typeof insertCourseCertificateSchema>;
export type InsertTrainingCenterCertificate = z.infer<typeof insertTrainingCenterCertificateSchema>;
export type InsertTestingCenterCertificate = z.infer<typeof insertTestingCenterCertificateSchema>;

export const userPermissions = {
  training_center: [
    'manage_training_center',
    'manage_courses',
    'manage_enrollments'
  ],
  testing_center: [
    'manage_test_center',
    'manage_exam_schedules',
    'manage_exam_registrations'
  ],
  student: [
    'view_centers',
    'enroll_courses',
    'register_exams',
    'view_certificates'
  ],
  admin: [
    'manage_all_centers',
    'manage_all_courses',
    'manage_all_exams',
    'manage_users',
    'manage_certificates'
  ]
} as const;

export type Permission = typeof userPermissions[keyof typeof userPermissions][number];

export const insertTrainingCenterSchema = createInsertSchema(trainingCenters);
export const insertTestCenterSchema = createInsertSchema(testCenters);

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments);
export const insertExamScheduleSchema = createInsertSchema(examSchedules);
// تم تغيير هذا التعريف إلى اسم آخر للتمييز بينه وبين جدول exam_registrations الجديد
export const insertExamRegistrationFromScheduleSchema = createInsertSchema(examRegistrations);


export const trainingCenterApplications = pgTable("training_center_applications", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  userId: integer("user_id").notNull(),
  centerName: text("center_name").notNull(),
  managerName: text("manager_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  // Adding region and city references
  regionId: integer("region_id").references(() => saudiRegionsTable.id),
  regionName: text("region_name"),
  cityId: integer("city_id").references(() => saudiCitiesTable.id),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  type: text("type", { enum: ['training_center', 'testing_center'] }).notNull().default('training_center'),
  status: text("status", {
    enum: [
      'تحت المراجعة',
      'زيارة ميدانية',
      'تحت التقييم',
      'مرفوض',
      'مقبول'
    ]
  }).default('تحت المراجعة'),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
  reviewNotes: text("review_notes"),
  commercialRecordPath: text("commercial_record_path"),
  financialGuaranteePath: text("financial_guarantee_path"),
  identityDocumentsPath: text("identity_documents_path"),
  certificateId: integer("certificate_id").references(() => certificates.id),
});

export const insertTrainingCenterApplicationSchema = createInsertSchema(trainingCenterApplications, {
  type: z.enum(['training_center', 'testing_center']).default('training_center'),
  status: z.enum([
    'تحت المراجعة',
    'زيارة ميدانية',
    'تحت التقييم',
    'مرفوض',
    'مقبول'
  ]).default('تحت المراجعة'),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.number().optional(),
  reviewNotes: z.string().optional(),
  commercialRecordPath: z.string().optional(),
  financialGuaranteePath: z.string().optional(),
  identityDocumentsPath: z.string().optional(),
  userId: z.number(),
  centerName: z.string().min(1, "اسم المركز مطلوب"),
  managerName: z.string().min(1, "اسم المدير مطلوب"),
  address: z.string().min(1, "العنوان مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  // New fields
  regionId: z.number().nullable().optional(),
  regionName: z.string().optional(),
  cityId: z.number().nullable().optional(),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  certificateId: z.number().optional(),
}).omit({ id: true });

export type TrainingCenterApplication = typeof trainingCenterApplications.$inferSelect;
export type InsertTrainingCenterApplication = z.infer<typeof insertTrainingCenterApplicationSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type TrainingCenter = typeof trainingCenters.$inferSelect;
export type TestCenter = typeof testCenters.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type ExamSchedule = typeof examSchedules.$inferSelect;
export type ExamRegistrationFromSchedule = typeof examRegistrations.$inferSelect;

// Add notifications table after certificates table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { 
    enum: [
      'certificate_issued', 
      'course_enrolled', 
      'course_completed',
      'certificate_matched',
      'certificate_rejected',
      'certificate_review',
      'application_submitted'
    ] 
  }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata").default({}),
});

// Create insert schema for notifications
export const insertNotificationSchema = createInsertSchema(notifications, {
  type: z.enum([
    'certificate_issued', 
    'course_enrolled', 
    'course_completed',
    'certificate_matched',
    'certificate_rejected',
    'certificate_review',
    'application_submitted'
  ]),
  title: z.string().min(1, "عنوان الإشعار مطلوب"),
  message: z.string().min(1, "نص الإشعار مطلوب"),
  metadata: z.object({
    courseId: z.number().optional(),
    certificateId: z.number().optional(),
    enrollmentId: z.number().optional(),
    applicationId: z.number().optional(),
    centerName: z.string().optional(),
  }).optional(),
}).omit({ id: true });

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Certificate Matching feature
export const certificateMatching = pgTable("certificate_matching", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseName: text("course_name").notNull(),
  instituteName: text("institute_name").notNull(),
  courseDate: date("course_date").notNull(), 
  certificateFile: text("certificate_file").notNull(),
  status: text("status", { enum: ['تم تقديم الطلب', 'تحت المراجعة', 'مطابقة', 'غير مطابقة'] }).notNull().default('تم تقديم الطلب'),
  comments: text("comments"),
  submissionDate: timestamp("submission_date").defaultNow(),
  reviewDate: timestamp("review_date"),
  matchedCertificateId: integer("matched_certificate_id"),
});

export const insertCertificateMatchingSchema = createInsertSchema(certificateMatching, {
  courseName: z.string().min(1, "اسم الدورة مطلوب"),
  instituteName: z.string().min(1, "اسم المعهد مطلوب"),
  courseDate: z.string().transform(str => new Date(str)),
  certificateFile: z.string().min(1, "ملف الشهادة مطلوب"),
  status: z.enum(['تم تقديم الطلب', 'تحت المراجعة', 'مطابقة', 'غير مطابقة']).default('تم تقديم الطلب'),
  comments: z.string().optional(),
}).omit({ id: true });

export type CertificateMatching = typeof certificateMatching.$inferSelect;
export type InsertCertificateMatching = z.infer<typeof insertCertificateMatchingSchema>;

// Saudi regions and cities data model
export const saudiRegionsTable = pgTable("saudi_regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  code: text("code").notNull().unique(),
});

export const saudiCitiesTable = pgTable("saudi_cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  regionId: integer("region_id").notNull().references(() => saudiRegionsTable.id),
});

export const insertSaudiRegionSchema = createInsertSchema(saudiRegionsTable).omit({ id: true });
export const insertSaudiCitySchema = createInsertSchema(saudiCitiesTable).omit({ id: true });

export type SaudiRegion = typeof saudiRegionsTable.$inferSelect;
export type SaudiCity = typeof saudiCitiesTable.$inferSelect;
export type InsertSaudiRegion = z.infer<typeof insertSaudiRegionSchema>;
export type InsertSaudiCity = z.infer<typeof insertSaudiCitySchema>;

// نموذج بيانات الاختبارات الذي يديره مراكز الاختبار
export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(), 
  title: text("title").notNull(),                        // عنوان الاختبار
  description: text("description").notNull(),            // وصف الاختبار
  examType: text("exam_type").notNull(),                 // نوع الاختبار
  capacity: integer("capacity").notNull(),               // السعة القصوى للاختبار
  registeredCandidates: integer("registered_candidates").default(0), // عدد المتقدمين المسجلين
  examDate: timestamp("exam_date").notNull(),            // تاريخ ووقت الاختبار
  location: text("location").notNull(),                  // موقع الاختبار
  status: text("status").default('مجدولة'),              // حالة الاختبار: مجدولة، قيد التنفيذ، منتهية، ملغية
  testing_center_id: integer("testing_center_id").notNull(), // معرف مركز الاختبار
  isVisible: boolean("is_visible").default(true),        // هل الاختبار مرئي للطلاب
  createdAt: timestamp("created_at").defaultNow(),       // تاريخ إنشاء الاختبار
  updatedAt: timestamp("updated_at").defaultNow(),       // تاريخ تحديث الاختبار
});

// إنشاء مخطط Zod للتحقق من صحة بيانات الاختبارات
export const insertExamSchema = createInsertSchema(examsTable, {
  title: z.string().min(5, "عنوان الاختبار يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(10, "وصف الاختبار يجب أن يكون 10 أحرف على الأقل"),
  examType: z.string().min(1, "نوع الاختبار مطلوب"),
  capacity: z.number().min(1, "سعة الاختبار يجب أن تكون 1 على الأقل"),
  location: z.string().min(5, "موقع الاختبار يجب أن يكون 5 أحرف على الأقل"),
  testing_center_id: z.number(),
  // الاحتفاظ بالتاريخ كنص بدلاً من تحويله إلى كائن Date
  examDate: z.string()
    .refine(str => {
      // التحقق الأساسي فقط من شكل التاريخ
      try {
        // فقط نتحقق أن النص يمكن تحويله إلى تاريخ صالح، لكن لا نقوم بالتحويل فعلياً
        const testDate = new Date(str);
        return !isNaN(testDate.getTime());
      } catch (e) {
        return false;
      }
    }, "تنسيق التاريخ غير صالح"),
  isVisible: z.boolean().default(true),
}).omit({ id: true, registeredCandidates: true, createdAt: true, updatedAt: true });

// نموذج بيانات تسجيل الطلاب في الاختبارات
export const examRegistrationsTable = pgTable("exam_registrations_new", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),                  // معرف الاختبار
  studentId: integer("student_id").notNull(),            // معرف الطالب
  registrationDate: timestamp("registration_date").defaultNow(), // تاريخ التسجيل
  status: text("status").default('مسجل'),                // حالة التسجيل: مسجل، حضر، غائب، مجتاز، راسب
  score: integer("score"),                               // نتيجة الاختبار (إذا كان محددًا)
  notes: text("notes"),                                  // ملاحظات إضافية
});

// إنشاء مخطط Zod للتحقق من صحة بيانات تسجيل الاختبارات
export const insertExamRegistrationNewSchema = createInsertSchema(examRegistrationsTable, {
  examId: z.number(),
  studentId: z.number(),
  status: z.string().default('مسجل'),
}).omit({ id: true, registrationDate: true });

// تعريف الأنواع للاستخدام في التطبيق
export type Exam = typeof examsTable.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type ExamRegistrationNew = typeof examRegistrationsTable.$inferSelect;
export type InsertExamRegistrationNew = z.infer<typeof insertExamRegistrationNewSchema>;

// جدول إعلانات مراكز الاختبار
export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  testing_center_id: integer("testing_center_id").notNull(), // معرف مركز الاختبار
  title: text("title").notNull(),                           // عنوان الإعلان
  content: text("content").notNull(),                       // محتوى الإعلان
  created_at: timestamp("created_at").defaultNow(),         // تاريخ إنشاء الإعلان
  is_visible: boolean("is_visible").default(true),          // هل الإعلان مرئي للطلاب
  exam_id: integer("exam_id"),                              // معرف الاختبار المرتبط (اختياري)
});

// إنشاء مخطط Zod للتحقق من صحة بيانات الإعلانات
export const insertAnnouncementSchema = createInsertSchema(announcementsTable, {
  testing_center_id: z.number(),
  title: z.string().min(5, "عنوان الإعلان يجب أن يكون 5 أحرف على الأقل"),
  content: z.string().min(10, "محتوى الإعلان يجب أن يكون 10 أحرف على الأقل"),
  is_visible: z.boolean().default(true),
  exam_id: z.number().optional().nullable(),
}).omit({ id: true, created_at: true });

// تعريف الأنواع للإعلانات
export type Announcement = typeof announcementsTable.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;