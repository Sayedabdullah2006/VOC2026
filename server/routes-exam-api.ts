/**
 * ملف مخصص لمسارات API الخاصة بالاختبارات
 * تم فصله لتسهيل الصيانة ومنع تداخل الكود
 */

import { Express, Request, Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { examsTable, trainingCenterApplications } from '../shared/schema';
import { createInsertSchema } from 'drizzle-zod';

// تعريف أدوار المستخدمين
enum UserRole {
  STUDENT = 'STUDENT',
  TRAINING_CENTER = 'TRAINING_CENTER',
  TESTING_CENTER = 'TESTING_CENTER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// إنشاء مخطط إدخال الاختبار باستخدام drizzle-zod
const insertExamSchema = createInsertSchema(examsTable);

// التخزين المؤقت لنتائج التحقق من اعتماد مراكز الاختبار
const testingCenterApprovalCache: { [userId: number]: { approved: boolean, timestamp: number } } = {};

/**
 * التحقق من حالة اعتماد مركز الاختبار
 */
async function checkTestingCenterApproved(userId: number): Promise<boolean> {
  try {
    // التحقق من وجود نتيجة مخزنة مؤقتاً لم تنتهي صلاحيتها (15 دقيقة)
    const currentTime = Date.now();
    const cachedResult = testingCenterApprovalCache[userId];
    
    if (cachedResult && (currentTime - cachedResult.timestamp) < 15 * 60 * 1000) {
      console.log(`استخدام نتيجة التحقق المخزنة مؤقتاً للمستخدم ${userId}: ${cachedResult.approved}`);
      return cachedResult.approved;
    }
    
    // لا توجد نتيجة مخزنة صالحة، قم بالاستعلام من قاعدة البيانات
    console.log(`بدء التحقق من حالة اعتماد مركز الاختبار للمستخدم ID: ${userId}`);
    
    // استخدام Drizzle ORM للاستعلام
    const applications = await db.select()
      .from(trainingCenterApplications)
      .where(
        and(
          eq(trainingCenterApplications.userId, userId),
          eq(trainingCenterApplications.type, 'testing_center'),
          eq(trainingCenterApplications.status, 'مقبول')
        )
      )
      .limit(1);
    
    const hasApprovedApplication = applications.length > 0;
    console.log(`نتيجة التحقق من طلبات الاعتماد: ${hasApprovedApplication ? 'تم العثور على طلب معتمد' : 'لم يتم العثور على طلب معتمد'}`);
    
    // تخزين النتيجة مؤقتاً
    testingCenterApprovalCache[userId] = {
      approved: hasApprovedApplication,
      timestamp: currentTime
    };
    
    return hasApprovedApplication;
  } catch (error) {
    console.error("خطأ في التحقق من حالة اعتماد مركز الاختبار:", error);
    return false;
  }
}

/**
 * تسجيل مسارات API الخاصة بالاختبارات
 */
export function registerExamApiRoutes(app: Express) {
  
  // إنشاء اختبار جديد
  app.post('/api/exams', async (req: Request, res: Response) => {
    console.log("استلام طلب إنشاء اختبار جديد");
    
    // التأكد من إرسال استجابة JSON دائماً
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // التحقق من أن المستخدم قد سجل الدخول
      if (!req.user || !req.user.id) {
        console.error("محاولة إضافة اختبار بدون تسجيل دخول");
        return res.status(401).json({ 
          message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة",
          status: "unauthorized"
        });
      }
      
      // التحقق من أن المستخدم هو مركز اختبار
      if (req.user.role !== UserRole.TESTING_CENTER) {
        console.error(`محاولة إضافة اختبار من قِبل مستخدم بدور: ${req.user.role}`);
        return res.status(403).json({ 
          message: "غير مصرح لك بإضافة اختبارات",
          status: "forbidden" 
        });
      }
      
      // التحقق من حالة اعتماد مركز الاختبار
      const isApproved = await checkTestingCenterApproved(req.user.id);
      if (!isApproved) {
        console.error(`مركز الاختبار ID ${req.user.id} غير معتمد`);
        return res.status(403).json({ 
          message: "لا يمكن إضافة اختبارات جديدة حتى يتم الموافقة على طلب اعتماد مركز الاختبار الخاص بك",
          status: "not_approved"
        });
      }
      
      // سجل البيانات المستلمة
      console.log("البيانات المستلمة من العميل:", req.body);
      
      // تحويل أسماء الحقول للتنسيق المطلوب
      const { 
        examType, 
        examDate, 
        isVisible, 
        testing_center_id,
        registeredCandidates = 0,
        ...otherData 
      } = req.body;
      
      // تنسيق البيانات لتتوافق مع المخطط المتوقع
      const formattedData = {
        ...otherData,
        exam_type: examType,         // تحويل examType إلى exam_type
        exam_date: examDate,         // تحويل examDate إلى exam_date
        is_visible: isVisible !== undefined ? isVisible : true, // تحويل isVisible إلى is_visible
        testing_center_id: testing_center_id || req.user.id,
        registered_candidates: registeredCandidates
      };
      
      console.log("بيانات الاختبار بعد التنسيق:", formattedData);
      
      // التحقق من أن الاختبار يحتوي على معرف مركز الاختبار الصحيح
      if (!formattedData.testing_center_id) {
        formattedData.testing_center_id = req.user.id;
      }
      
      // إضافة الاختبار إلى قاعدة البيانات
      const result = await db.insert(examsTable).values(formattedData).returning();
      const createdExam = result[0]; // الحصول على الاختبار المنشأ
      
      console.log("تم إنشاء الاختبار بنجاح:", createdExam);
      return res.status(201).json(createdExam);
      
    } catch (error: any) {
      console.error("خطأ في إضافة الاختبار:", error);
      
      // معالجة أخطاء التحقق
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "بيانات الاختبار غير صالحة",
          errors: error.errors
        });
      }
      
      // معالجة أخطاء قاعدة البيانات
      if (error.code) {
        console.error("خطأ في قاعدة البيانات:", error.code, error.message);
        return res.status(500).json({ 
          message: "حدث خطأ أثناء حفظ البيانات في قاعدة البيانات" 
        });
      }
      
      // أخطاء عامة أخرى
      return res.status(400).json({ 
        message: error.message || "حدث خطأ أثناء إنشاء الاختبار" 
      });
    }
  });
  
  // الحصول على قائمة الاختبارات
  app.get('/api/exams', async (req: Request, res: Response) => {
    // التأكد من إرسال استجابة JSON دائماً
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // التحقق من أن المستخدم قد سجل الدخول
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: "يجب تسجيل الدخول للوصول إلى هذه البيانات",
          status: "unauthorized"
        });
      }
      
      let examsList;
      
      // التحقق من نوع المستخدم وتحديد الاختبارات المتاحة
      if (req.user.role === UserRole.TESTING_CENTER) {
        // مركز الاختبار يرى اختباراته فقط
        const testingCenterId = req.user.id;
        console.log(`الحصول على اختبارات مركز الاختبار ID: ${testingCenterId}`);
        
        examsList = await db.select()
          .from(examsTable)
          .where(eq(examsTable.testing_center_id, testingCenterId))
          .orderBy(examsTable.examDate);
      } else if (req.user.role === UserRole.STUDENT) {
        // الطالب يرى الاختبارات المتاحة فقط (المرئية)
        examsList = await db.select()
          .from(examsTable)
          .where(eq(examsTable.isVisible, true))
          .orderBy(examsTable.examDate);
      } else if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
        // المسؤول يرى جميع الاختبارات
        examsList = await db.select()
          .from(examsTable)
          .orderBy(examsTable.examDate);
      } else {
        // دور غير معروف
        return res.status(403).json({ 
          message: "غير مصرح لك بالوصول إلى هذه البيانات"
        });
      }
      
      console.log(`تم العثور على ${examsList.length} اختبارات`);
      return res.json(examsList);
      
    } catch (error: any) {
      console.error("خطأ في الحصول على الاختبارات:", error);
      return res.status(500).json({ 
        message: "حدث خطأ أثناء جلب الاختبارات المتاحة"
      });
    }
  });
  
  // الحصول على معلومات اختبار محدد بواسطة المعرف
  app.get('/api/exams/:id', async (req: Request, res: Response) => {
    // التأكد من إرسال استجابة JSON دائماً
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const examId = parseInt(req.params.id);
      
      if (isNaN(examId)) {
        return res.status(400).json({ message: "معرف اختبار غير صالح" });
      }
      
      // التحقق من أن المستخدم قد سجل الدخول
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: "يجب تسجيل الدخول للوصول إلى هذه البيانات"
        });
      }
      
      // الحصول على بيانات الاختبار
      const [exam] = await db.select()
        .from(examsTable)
        .where(eq(examsTable.id, examId));
      
      if (!exam) {
        return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
      }
      
      // التحقق من الصلاحيات
      if (req.user.role === UserRole.TESTING_CENTER && exam.testing_center_id !== req.user.id) {
        return res.status(403).json({ message: "ليس لديك صلاحية الوصول إلى هذا الاختبار" });
      }
      
      if (req.user.role === UserRole.STUDENT && !exam.isVisible) {
        return res.status(404).json({ message: "الاختبار غير متاح" });
      }
      
      return res.json(exam);
      
    } catch (error: any) {
      console.error("خطأ في الحصول على بيانات الاختبار:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات الاختبار" });
    }
  });
  
  // تحديث بيانات اختبار موجود
  app.put('/api/exams/:id', async (req: Request, res: Response) => {
    // التأكد من إرسال استجابة JSON دائماً
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const examId = parseInt(req.params.id);
      
      if (isNaN(examId)) {
        return res.status(400).json({ message: "معرف اختبار غير صالح" });
      }
      
      // التحقق من أن المستخدم قد سجل الدخول
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة"
        });
      }
      
      // التحقق من أن المستخدم هو مركز اختبار
      if (req.user.role !== UserRole.TESTING_CENTER && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ message: "غير مصرح لك بتعديل الاختبارات" });
      }
      
      // التحقق من وجود الاختبار
      const [existingExam] = await db.select()
        .from(examsTable)
        .where(eq(examsTable.id, examId));
      
      if (!existingExam) {
        return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
      }
      
      // التحقق من ملكية الاختبار (فقط لمراكز الاختبار)
      if (req.user.role === UserRole.TESTING_CENTER && existingExam.testing_center_id !== req.user.id) {
        return res.status(403).json({ message: "ليس لديك صلاحية تعديل هذا الاختبار" });
      }
      
      // تحويل أسماء الحقول للتنسيق المطلوب
      const { 
        examType, 
        examDate, 
        isVisible, 
        ...otherData 
      } = req.body;
      
      // تنسيق البيانات للتحديث
      const updateData = {
        ...otherData
      };
      
      // تحديث الحقول الخاصة إذا تم توفيرها
      if (examType !== undefined) updateData.exam_type = examType;
      if (examDate !== undefined) updateData.exam_date = examDate;
      if (isVisible !== undefined) updateData.is_visible = isVisible;
      
      // تحديث بيانات الاختبار
      const result = await db.update(examsTable)
        .set(updateData)
        .where(eq(examsTable.id, examId))
        .returning();
      
      const updatedExam = result[0];
      
      return res.json(updatedExam);
      
    } catch (error: any) {
      console.error("خطأ في تحديث بيانات الاختبار:", error);
      
      // معالجة أخطاء التحقق
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "بيانات الاختبار غير صالحة",
          errors: error.errors
        });
      }
      
      // معالجة أخطاء قاعدة البيانات
      if (error.code) {
        return res.status(500).json({ 
          message: "حدث خطأ أثناء تحديث البيانات في قاعدة البيانات" 
        });
      }
      
      // أخطاء عامة أخرى
      return res.status(400).json({ 
        message: error.message || "حدث خطأ أثناء تحديث بيانات الاختبار" 
      });
    }
  });
  
  // حذف اختبار
  app.delete('/api/exams/:id', async (req: Request, res: Response) => {
    // التأكد من إرسال استجابة JSON دائماً
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const examId = parseInt(req.params.id);
      
      if (isNaN(examId)) {
        return res.status(400).json({ message: "معرف اختبار غير صالح" });
      }
      
      // التحقق من أن المستخدم قد سجل الدخول
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة"
        });
      }
      
      // التحقق من أن المستخدم هو مركز اختبار أو مسؤول
      if (req.user.role !== UserRole.TESTING_CENTER && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ message: "غير مصرح لك بحذف الاختبارات" });
      }
      
      // التحقق من وجود الاختبار
      const [existingExam] = await db.select()
        .from(examsTable)
        .where(eq(examsTable.id, examId));
      
      if (!existingExam) {
        return res.status(404).json({ message: "لم يتم العثور على الاختبار" });
      }
      
      // التحقق من ملكية الاختبار (فقط لمراكز الاختبار)
      if (req.user.role === UserRole.TESTING_CENTER && existingExam.testing_center_id !== req.user.id) {
        return res.status(403).json({ message: "ليس لديك صلاحية حذف هذا الاختبار" });
      }
      
      // حذف الاختبار
      await db.delete(examsTable)
        .where(eq(examsTable.id, examId));
      
      return res.json({ message: "تم حذف الاختبار بنجاح" });
      
    } catch (error: any) {
      console.error("خطأ في حذف الاختبار:", error);
      return res.status(500).json({ message: "حدث خطأ أثناء حذف الاختبار" });
    }
  });
}