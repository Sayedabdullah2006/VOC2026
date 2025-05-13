import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { examsTable } from '@shared/schema';

/**
 * معالج تحديث بيانات الاختبار
 */
export async function handleExamUpdate(req: Request, res: Response) {
  try {
    const examId = parseInt(req.params.id, 10);
    
    if (isNaN(examId)) {
      return res.status(400).json({ message: "معرف الاختبار غير صالح" });
    }
    
    // التحقق من وجود الاختبار
    const [exam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId));
    
    if (!exam) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }
    
    // التحقق من وجود المستخدم ومن أن هذا الاختبار ينتمي لمركز الاختبار الحالي
    if (!req.user || exam.testing_center_id !== req.user.id) {
      return res.status(403).json({ message: "غير مصرح لك بتعديل هذا الاختبار" });
    }
    
    console.log("بيانات التحديث المستلمة:", req.body);
    
    // قائمة الحقول المسموح بتعديلها
    const allowedFields = [
      'title',
      'description',
      'exam_type',
      'location',
      'capacity',
      'exam_date',
      'is_visible',
      'status'
    ];
    
    // تجهيز كائن التحديث
    const updateData: Record<string, any> = {};
    
    // نسخ الحقول المسموح بها فقط
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    // معالجة التاريخ (إذا كان موجوداً)
    if (req.body.exam_date !== undefined) {
      // استخدام التاريخ كما هو بدون تحويل إلى كائن Date
      updateData.exam_date = req.body.exam_date;
    }
    
    // إضافة تاريخ التحديث
    updateData.updatedAt = new Date();
    
    console.log("بيانات التحديث النهائية:", updateData);
    
    try {
      // تنفيذ عملية التحديث
      const [updatedExam] = await db
        .update(examsTable)
        .set(updateData)
        .where(eq(examsTable.id, examId))
        .returning();
      
      if (!updatedExam) {
        throw new Error("فشل تحديث الاختبار - لم يتم إرجاع أي نتائج");
      }
      
      return res.json(updatedExam);
    } catch (error: any) {
      console.error("خطأ في تحديث الاختبار:", error);
      return res.status(500).json({ 
        message: "حدث خطأ أثناء تحديث بيانات الاختبار: " + (error.message || "خطأ غير معروف") 
      });
    }
  } catch (error: any) {
    console.error("خطأ عام في تحديث الاختبار:", error);
    return res.status(500).json({ 
      message: "حدث خطأ في خادم API: " + (error.message || "خطأ غير معروف")
    });
  }
}

/**
 * معالج إنشاء اختبار جديد
 */
export async function handleCreateExam(req: Request, res: Response) {
  try {
    // التحقق من وجود مستخدم مسجل دخوله
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
    }
    
    // التحقق من أن المستخدم هو مركز اختبار
    if (req.user.role !== 'TESTING_CENTER') {
      return res.status(403).json({ message: "فقط مراكز الاختبار يمكنها إضافة اختبارات" });
    }
    
    console.log("بيانات الاختبار المستلمة:", req.body);
    
    // تجهيز بيانات الاختبار الجديد
    const examData = {
      title: req.body.title,
      description: req.body.description,
      examType: req.body.exam_type,
      location: req.body.location,
      capacity: parseInt(req.body.capacity, 10),
      // استخدام التاريخ كما هو بدون تحويل
      examDate: req.body.exam_date,
      testing_center_id: req.user.id,
      isVisible: req.body.is_visible !== undefined ? req.body.is_visible : true,
      status: 'قادم',
      registeredCandidates: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // التحقق من صحة البيانات المطلوبة
    if (!examData.title || !examData.description || !examData.examType || !examData.location || !examData.examDate) {
      return res.status(400).json({ message: "جميع الحقول المطلوبة يجب أن تكون موجودة" });
    }
    
    // إنشاء الاختبار في قاعدة البيانات
    try {
      const [newExam] = await db
        .insert(examsTable)
        .values(examData)
        .returning();
      
      return res.status(201).json(newExam);
    } catch (error: any) {
      console.error("خطأ في إنشاء الاختبار:", error);
      return res.status(500).json({ 
        message: "حدث خطأ أثناء إنشاء الاختبار: " + (error.message || "خطأ غير معروف") 
      });
    }
  } catch (error: any) {
    console.error("خطأ عام في إنشاء الاختبار:", error);
    return res.status(500).json({ 
      message: "حدث خطأ في خادم API: " + (error.message || "خطأ غير معروف")
    });
  }
}

/**
 * معالج الحصول على اختبار محدد
 */
export async function handleGetExam(req: Request, res: Response) {
  try {
    const examId = parseInt(req.params.id, 10);
    
    if (isNaN(examId)) {
      return res.status(400).json({ message: "معرف الاختبار غير صالح" });
    }
    
    // الحصول على الاختبار من قاعدة البيانات
    const [exam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId));
    
    if (!exam) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }
    
    // تحويل اسماء الحقول لتتوافق مع توقعات واجهة المستخدم
    const formattedExam = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      exam_type: exam.examType,
      capacity: exam.capacity,
      registeredCandidates: exam.registeredCandidates,
      exam_date: exam.examDate,
      location: exam.location,
      status: exam.status,
      testing_center_id: exam.testing_center_id,
      is_visible: exam.isVisible,
      price: 0, // حقل إضافي قد يكون مطلوباً في المستقبل
    };
    
    return res.json(formattedExam);
  } catch (error: any) {
    console.error("خطأ في الحصول على الاختبار:", error);
    return res.status(500).json({ 
      message: "حدث خطأ أثناء جلب بيانات الاختبار: " + (error.message || "خطأ غير معروف") 
    });
  }
}

/**
 * معالج الحصول على قائمة الاختبارات
 */
export async function handleGetExams(req: Request, res: Response) {
  try {
    // في حالة كان هناك فلترة مطلوبة حسب مركز اختبار
    let testingCenterId = null;
    
    // إذا كان المستخدم مركز اختبار، نقوم بعرض اختباراته فقط
    if (req.user && req.user.role === 'TESTING_CENTER') {
      testingCenterId = req.user.id;
    } else if (req.query.testingCenterId) {
      // أو إذا تم تمرير معرف مركز اختبار في الاستعلام
      testingCenterId = parseInt(req.query.testingCenterId as string, 10);
    }
    
    // إنشاء استعلام قاعدة البيانات
    let query = db.select().from(examsTable);
    
    // إضافة فلتر مركز الاختبار إذا كان متوفراً
    if (testingCenterId) {
      query = query.where(eq(examsTable.testing_center_id, testingCenterId));
    }
    
    // تنفيذ الاستعلام
    const exams = await query;
    
    // تنسيق البيانات لواجهة المستخدم (تحويل camelCase إلى snake_case)
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      examType: exam.examType,
      capacity: exam.capacity,
      registeredCandidates: exam.registeredCandidates,
      examDate: exam.examDate,
      location: exam.location,
      status: exam.status,
      testing_center_id: exam.testing_center_id,
      isVisible: exam.isVisible,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    }));
    
    return res.json(formattedExams);
  } catch (error: any) {
    console.error("خطأ في الحصول على قائمة الاختبارات:", error);
    return res.status(500).json({ 
      message: "حدث خطأ أثناء جلب قائمة الاختبارات: " + (error.message || "خطأ غير معروف") 
    });
  }
}

/**
 * معالج حذف اختبار
 */
export async function handleDeleteExam(req: Request, res: Response) {
  try {
    const examId = parseInt(req.params.id, 10);
    
    if (isNaN(examId)) {
      return res.status(400).json({ message: "معرف الاختبار غير صالح" });
    }
    
    // التحقق من وجود الاختبار
    const [exam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId));
    
    if (!exam) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }
    
    // التحقق من أن المستخدم هو صاحب الاختبار
    if (!req.user || exam.testing_center_id !== req.user.id) {
      return res.status(403).json({ message: "غير مصرح لك بحذف هذا الاختبار" });
    }
    
    // حذف الاختبار
    await db
      .delete(examsTable)
      .where(eq(examsTable.id, examId));
    
    return res.json({ message: "تم حذف الاختبار بنجاح" });
  } catch (error: any) {
    console.error("خطأ في حذف الاختبار:", error);
    return res.status(500).json({ 
      message: "حدث خطأ أثناء حذف الاختبار: " + (error.message || "خطأ غير معروف") 
    });
  }
}