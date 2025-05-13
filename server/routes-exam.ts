import type { Express, Request, Response } from "express";
import { sql, eq, and } from "drizzle-orm";
import { db } from "./db";
import { UserRole } from "@shared/schema";
import { 
  examsTable,
  examRegistrationsTable,
  insertExamRegistrationNewSchema
} from "@shared/schema";

/**
 * تسجيل مسارات الاختبارات (API Routes)
 * هذا الملف يحتوي على المسارات المتعلقة بالاختبارات وتسجيل الطلاب فيها
 */
export function registerExamRoutes(app: Express) {
  // الحصول على قائمة الاختبارات الخاصة بمركز الاختبار
  app.get('/api/exams', async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذه البيانات" });
      }
      
      // التحقق من أن المستخدم هو مركز اختبار
      if (req.session.user.role !== UserRole.TESTING_CENTER) {
        return res.status(403).json({ message: "يجب أن تكون مركز اختبار للوصول إلى هذه البيانات" });
      }
      
      const testingCenterId = req.session.user.id;
      console.log(`الحصول على اختبارات مركز الاختبار ID: ${testingCenterId}`);
      
      // الحصول على الاختبارات الخاصة بمركز الاختبار
      const exams = await db.select()
        .from(examsTable)
        .where(eq(examsTable.testing_center_id, testingCenterId))
        .orderBy(examsTable.examDate);
      
      console.log(`تم العثور على ${exams.length} اختبارات لمركز الاختبار`);
      
      return res.json(exams);
    } catch (error) {
      console.error("خطأ في الحصول على اختبارات مركز الاختبار:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء جلب الاختبارات" });
    }
  });
  
  // الحصول على قائمة الاختبارات المتاحة للطلاب
  app.get('/api/exams/available', async (req, res) => {
    try {
      // استرجاع الاختبارات المتاحة والمرئية للطلاب
      const availableExams = await db.select()
        .from(examsTable)
        .where(eq(examsTable.isVisible, true));
      
      const formattedExams = [];
      
      // تحويل أسماء الحقول من snake_case إلى camelCase
      for (const exam of availableExams) {
        const formattedExam = {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          examType: exam.exam_type,
          capacity: exam.capacity,
          registeredCandidates: exam.registered_candidates,
          examDate: exam.exam_date instanceof Date ? exam.exam_date.toISOString() : null,
          location: exam.location,
          status: exam.status,
          testingCenterId: exam.testing_center_id,
          testingCenterName: null, // سيتم تعبئة هذا لاحقًا
          isVisible: exam.isVisible,
          price: exam.price,
          isRegistered: false,
          registrationId: null
        };
        
        // إضافة الاختبار بعد تنسيقه
        formattedExams.push(formattedExam);
      }
      
      // إذا كان المستخدم طالبًا مسجلًا، نتحقق مما إذا كان مسجلًا في أي من هذه الاختبارات
      if (req.user && req.user.role === UserRole.STUDENT) {
        const studentId = req.user.id;
        
        // الحصول على تسجيلات الطالب
        const registrations = await db.select()
          .from(examRegistrationsTable)
          .where(eq(examRegistrationsTable.studentId, studentId));
        
        // تحديث حالة التسجيل للاختبارات
        for (const exam of formattedExams) {
          const registration = registrations.find(reg => reg.examId === exam.id);
          if (registration) {
            exam.isRegistered = true;
            exam.registrationId = registration.id;
            console.log(`الطالب مسجل في الاختبار ${exam.id} - ${exam.title}`);
          } else {
            console.log(`الطالب غير مسجل في الاختبار ${exam.id} - ${exam.title}`);
          }
        }
      }
      
      console.log(`تم العثور على ${formattedExams.length} اختبارات متاحة للطلاب`);
      
      if (formattedExams.length > 0) {
        console.log(`عينة من الاختبارات المتاحة: ${JSON.stringify(formattedExams[0], null, 2)}`);
      }
      
      return res.json(formattedExams);
    } catch (error) {
      console.error("خطأ في الحصول على الاختبارات المتاحة:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء جلب الاختبارات المتاحة" });
    }
  });
  
  // الحصول على معلومات اختبار محدد بواسطة المعرف
  app.get('/api/exams/:id', async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      
      if (isNaN(examId)) {
        return res.status(400).json({ message: "معرف اختبار غير صالح" });
      }
      
      if (!req.session?.user) {
        return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذه البيانات" });
      }
      
      // التحقق من الصلاحيات حسب نوع المستخدم
      if (req.session.user.role === UserRole.TESTING_CENTER) {
        // مركز الاختبار يمكنه رؤية اختباراته فقط
        const testingCenterId = req.session.user.id;
        
        // الحصول على بيانات الاختبار
        const [exam] = await db.select()
          .from(examsTable)
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.testing_center_id, testingCenterId)
            )
          );
        
        if (!exam) {
          return res.status(404).json({ message: "لم يتم العثور على الاختبار أو ليس لديك صلاحية الوصول إليه" });
        }
        
        // تنسيق البيانات لتكون متوافقة مع النموذج في واجهة المستخدم
        const formattedExam = {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          exam_type: exam.examType,
          capacity: exam.capacity,
          registeredCandidates: exam.registeredCandidates,
          exam_date: exam.examDate instanceof Date ? exam.examDate.toISOString() : null,
          location: exam.location,
          status: exam.status,
          testing_center_id: exam.testing_center_id,
          is_visible: exam.isVisible,
          price: 0, // إضافة قيمة افتراضية للسعر
        };
        
        return res.json(formattedExam);
      } else if (req.session.user.role === UserRole.STUDENT) {
        // الطالب يمكنه رؤية الاختبارات المتاحة أو المسجل فيها
        const [exam] = await db.select()
          .from(examsTable)
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.isVisible, true)
            )
          );
        
        if (!exam) {
          return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
        }
        
        // تنسيق البيانات
        const formattedExam = {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          exam_type: exam.examType,
          capacity: exam.capacity,
          registeredCandidates: exam.registeredCandidates,
          exam_date: exam.examDate instanceof Date ? exam.examDate.toISOString() : null,
          location: exam.location,
          status: exam.status,
          testing_center_id: exam.testing_center_id,
          is_visible: exam.isVisible,
          price: 0, // إضافة قيمة افتراضية للسعر
        };
        
        return res.json(formattedExam);
      } else if (req.session.user.role === UserRole.ADMIN) {
        // المشرف يمكنه رؤية جميع الاختبارات
        const [exam] = await db.select()
          .from(examsTable)
          .where(eq(examsTable.id, examId));
        
        if (!exam) {
          return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
        }
        
        // تنسيق البيانات للمشرف
        const formattedExam = {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          exam_type: exam.examType,
          capacity: exam.capacity,
          registeredCandidates: exam.registeredCandidates,
          exam_date: exam.examDate instanceof Date ? exam.examDate.toISOString() : null,
          location: exam.location,
          status: exam.status,
          testing_center_id: exam.testing_center_id,
          is_visible: exam.isVisible,
          price: 0, // إضافة قيمة افتراضية للسعر
        };
        
        return res.json(formattedExam);
      } else {
        return res.status(403).json({ message: "ليس لديك صلاحية الوصول إلى بيانات الاختبار" });
      }
    } catch (error) {
      console.error("خطأ في الحصول على بيانات الاختبار:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الاختبار" });
    }
  });
  
  // تحديث بيانات اختبار محدد (PATCH)
  app.patch('/api/exams/:id', async (req, res) => {
    try {
      // التحقق من تسجيل الدخول
      if (!req.session?.user) {
        return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذه البيانات" });
      }
      
      const examId = parseInt(req.params.id);
      if (isNaN(examId)) {
        return res.status(400).json({ message: "معرف اختبار غير صالح" });
      }
      
      // التحقق من صلاحيات المستخدم
      if (req.session.user.role === UserRole.TESTING_CENTER) {
        // مركز الاختبار يمكنه تحديث اختباراته فقط
        const testingCenterId = req.session.user.id;
        
        // التحقق أولاً من أن الاختبار ينتمي لهذا المركز
        const [existingExam] = await db.select()
          .from(examsTable)
          .where(
            and(
              eq(examsTable.id, examId),
              eq(examsTable.testing_center_id, testingCenterId)
            )
          );
        
        if (!existingExam) {
          return res.status(404).json({ message: "لم يتم العثور على الاختبار أو ليس لديك صلاحية تحديثه" });
        }
        
        // استخراج البيانات من الطلب
        const { title, description, exam_type, capacity, location, exam_date, is_visible } = req.body;
        
        // تحديث بيانات الاختبار
        await db.update(examsTable)
          .set({
            title: title,
            description: description,
            examType: exam_type,
            capacity: capacity,
            location: location,
            examDate: new Date(exam_date),
            isVisible: is_visible !== undefined ? is_visible : existingExam.isVisible,
            updatedAt: new Date(),
          })
          .where(eq(examsTable.id, examId));
        
        return res.json({ 
          message: "تم تحديث الاختبار بنجاح",
          id: examId
        });
      } else if (req.session.user.role === UserRole.ADMIN) {
        // المشرف يمكنه تحديث أي اختبار
        const [existingExam] = await db.select()
          .from(examsTable)
          .where(eq(examsTable.id, examId));
        
        if (!existingExam) {
          return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
        }
        
        // استخراج البيانات من الطلب
        const { title, description, exam_type, capacity, location, exam_date, is_visible } = req.body;
        
        // تحديث بيانات الاختبار
        await db.update(examsTable)
          .set({
            title: title,
            description: description,
            examType: exam_type,
            capacity: capacity,
            location: location,
            examDate: new Date(exam_date),
            isVisible: is_visible !== undefined ? is_visible : existingExam.isVisible,
            updatedAt: new Date(),
          })
          .where(eq(examsTable.id, examId));
        
        return res.json({ 
          message: "تم تحديث الاختبار بنجاح",
          id: examId
        });
      } else {
        return res.status(403).json({ message: "ليس لديك صلاحية تحديث بيانات الاختبار" });
      }
    } catch (error) {
      console.error("خطأ في تحديث بيانات الاختبار:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء تحديث بيانات الاختبار" });
    }
  });
  
  // الحصول على قائمة الاختبارات المسجل فيها الطالب
  app.get('/api/student/registered-exams', async (req, res) => {
    try {
      if (!req.session?.user || req.session.user.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: "يجب أن تكون طالبًا للوصول إلى هذه البيانات" });
      }
      
      const studentId = req.session.user.id;
      console.log(`الحصول على اختبارات الطالب المسجلة ID: ${studentId}`);
      
      // الحصول على تسجيلات الطالب
      const registrations = await db.select()
        .from(examRegistrationsTable)
        .where(eq(examRegistrationsTable.studentId, studentId));
      
      if (registrations.length === 0) {
        return res.json([]);
      }
      
      // الحصول على معرفات الاختبارات المسجلة
      const examIds = registrations.map(reg => reg.examId);
      console.log("معرفات الاختبارات المسجلة:", examIds);
      
      if (examIds.length === 0) {
        console.log("لا توجد معرفات اختبارات للاستعلام عنها");
        return res.json([]);
      }
      
      try {
        // الحصول على بيانات الاختبارات
        const examsResult = await db.execute(sql`
          SELECT e.*, u.full_name as testing_center_name
          FROM exams e
          JOIN users u ON e.testing_center_id = u.id
          WHERE e.id IN (${sql.join(examIds, sql`, `)})
          ORDER BY e.exam_date ASC
        `);
        
        console.log("نتيجة استعلام الاختبارات:", examsResult);
        
        // تحويل النتيجة إلى مصفوفة
        const examsArray = Array.isArray(examsResult) ? examsResult : examsResult.rows || [];
        console.log("تم تحويل النتيجة إلى مصفوفة بطول:", examsArray.length);
        
        if (examsArray.length === 0) {
          console.log("لم يتم العثور على أي اختبارات مسجلة في قاعدة البيانات");
          return res.json([]);
        }
        
        // تنسيق البيانات
        const formattedExams = examsArray.map((exam: any) => {
          // البحث عن معلومات التسجيل لهذا الاختبار
          const registration = registrations.find(reg => reg.examId === exam.id);
          console.log(`معلومات التسجيل للاختبار ${exam.id}:`, registration);
          
          // تنسيق التاريخ كنص (ISO string) للتأكد من أنه سيظهر بشكل صحيح
          const examDateISO = exam.exam_date ? new Date(exam.exam_date).toISOString() : null;
          
          return {
            id: exam.id,
            title: exam.title,
            description: exam.description,
            examType: exam.exam_type,
            capacity: exam.capacity,
            registeredCandidates: exam.registered_candidates,
            examDate: examDateISO,
            location: exam.location,
            status: exam.status,
            testingCenterId: exam.testing_center_id,
            createdAt: exam.created_at ? new Date(exam.created_at).toISOString() : null,
            updatedAt: exam.updated_at ? new Date(exam.updated_at).toISOString() : null,
            testingCenterName: exam.testing_center_name,
            isVisible: exam.is_visible,
            price: exam.price,
            isRegistered: true,
            registrationId: registration?.id || null,
            registrationDate: registration?.registrationDate ? 
              new Date(registration.registrationDate).toISOString() : null
          };
        });
      
        console.log(`تم العثور على ${formattedExams.length} اختبارات مسجل فيها الطالب`);
        
        return res.json(formattedExams);
      } catch (error) {
        console.error("خطأ في استعلام بيانات الاختبارات:", error);
        return res.status(500).json({ message: "حدث خطأ أثناء استعلام بيانات الاختبارات" });
      }
    } catch (error) {
      console.error("خطأ في الحصول على اختبارات الطالب المسجلة:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء الحصول على الاختبارات المسجلة" });
    }
  });
  
  // تسجيل الطالب في اختبار
  app.post('/api/exam-registrations', async (req, res) => {
    try {
      const registrationData = insertExamRegistrationNewSchema.parse(req.body);
      
      // التحقق من أن المستخدم هو طالب
      if (req.session?.user?.role !== UserRole.STUDENT) {
        return res.status(403).json({ message: "يمكن للطلاب فقط التسجيل في الاختبارات" });
      }
      
      // التحقق من أن معرف الطالب هو نفسه معرف المستخدم الحالي
      const userId = req.session.user.id;
      if (userId !== registrationData.studentId) {
        return res.status(403).json({ message: "لا يمكنك التسجيل باسم طالب آخر" });
      }
      
      // الحصول على معلومات الاختبار
      const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, registrationData.examId));
      
      if (!exam) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      // التحقق من أن الاختبار متاح للتسجيل
      if (!exam.isVisible) {
        return res.status(400).json({ message: "هذا الاختبار غير متاح للتسجيل" });
      }
      
      // التحقق من أن تاريخ الاختبار لم يمر بعد
      const examDate = new Date(exam.examDate);
      const today = new Date();
      if (examDate <= today) {
        return res.status(400).json({ message: "لا يمكن التسجيل في اختبار انتهى موعده" });
      }
      
      // التحقق من وجود مقاعد متاحة
      if (exam.registeredCandidates >= exam.capacity) {
        return res.status(400).json({ message: "لا توجد مقاعد متاحة في هذا الاختبار" });
      }
      
      // التحقق من عدم تسجيل الطالب مسبقًا في هذا الاختبار
      const [existingRegistration] = await db.select()
        .from(examRegistrationsTable)
        .where(
          and(
            eq(examRegistrationsTable.examId, registrationData.examId),
            eq(examRegistrationsTable.studentId, registrationData.studentId)
          )
        );
      
      if (existingRegistration) {
        return res.status(400).json({ message: "أنت مسجل بالفعل في هذا الاختبار" });
      }
      
      // تسجيل الطالب في الاختبار
      const [registration] = await db.insert(examRegistrationsTable).values(registrationData).returning();
      
      // تحديث عدد المتقدمين المسجلين في الاختبار
      await db.update(examsTable)
        .set({ registeredCandidates: exam.registeredCandidates + 1 })
        .where(eq(examsTable.id, exam.id));
      
      return res.status(201).json(registration);
    } catch (error: any) {
      console.error("خطأ في تسجيل الطالب في الاختبار:", error);
      return res.status(400).json({ message: error.message });
    }
  });
  
  // إلغاء تسجيل الطالب من الاختبار (باستخدام معرّف التسجيل)
  app.delete('/api/exam-registrations/:registrationId', async (req, res) => {
    try {
      const registrationId = parseInt(req.params.registrationId);
      
      console.log(`محاولة إلغاء تسجيل، معرف التسجيل: ${registrationId}`);
      
      if (isNaN(registrationId)) {
        console.log("معرف التسجيل غير صالح أو غير رقمي");
        return res.status(400).json({ message: "معرف التسجيل غير صالح" });
      }
      
      // التحقق من أن المستخدم هو طالب
      if (req.session?.user?.role !== UserRole.STUDENT) {
        console.log(`محاولة إلغاء التسجيل من مستخدم غير طالب، الدور: ${req.session?.user?.role}`);
        return res.status(403).json({ message: "يمكن للطلاب فقط إلغاء التسجيل في الاختبارات" });
      }
      
      const studentId = req.session.user.id;
      console.log(`محاولة إلغاء التسجيل للطالب رقم: ${studentId} من التسجيل: ${registrationId}`);
      
      // البحث عن جميع تسجيلات الطالب
      const studentRegistrations = await db.select()
        .from(examRegistrationsTable)
        .where(eq(examRegistrationsTable.studentId, studentId));
        
      console.log(`عدد تسجيلات الطالب المسترجعة: ${studentRegistrations.length}`);
      if (studentRegistrations.length > 0) {
        console.log(`عينة من تسجيلات الطالب: ${JSON.stringify(studentRegistrations[0])}`);
      }
      
      // التحقق من وجود تسجيل للطالب بهذا المعرّف
      const [existingRegistration] = await db.select()
        .from(examRegistrationsTable)
        .where(
          and(
            eq(examRegistrationsTable.id, registrationId),
            eq(examRegistrationsTable.studentId, studentId)
          )
        );
        
      console.log(`نتيجة البحث عن التسجيل: ${existingRegistration ? 'موجود' : 'غير موجود'}`);
      
      if (!existingRegistration) {
        return res.status(404).json({ message: "تسجيل الاختبار غير موجود أو غير مسموح لك بإلغائه" });
      }
      
      const examId = existingRegistration.examId;
      
      // الحصول على معلومات الاختبار
      const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
      
      if (!exam) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      // التحقق من أن تاريخ الاختبار لم يمر بعد
      const examDate = new Date(exam.examDate);
      const today = new Date();
      if (examDate <= today) {
        return res.status(400).json({ message: "لا يمكن إلغاء التسجيل بعد انتهاء موعد الاختبار" });
      }
      
      // حذف التسجيل
      await db.delete(examRegistrationsTable)
        .where(eq(examRegistrationsTable.id, registrationId));
      
      // تحديث عدد المتقدمين المسجلين في الاختبار
      await db.update(examsTable)
        .set({ 
          registeredCandidates: Math.max(0, (exam.registeredCandidates || 0) - 1) 
        })
        .where(eq(examsTable.id, examId));
      
      return res.status(200).json({ message: "تم إلغاء التسجيل في الاختبار بنجاح" });
    } catch (error: any) {
      console.error("خطأ في إلغاء تسجيل الطالب من الاختبار:", error);
      return res.status(500).json({ message: error.message });
    }
  });
}