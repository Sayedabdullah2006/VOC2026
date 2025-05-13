/**
 * إدارة API الاختبارات
 * ملف منفصل لتسهيل إدارة وتنظيم كود الاختبارات
 */

import express, { Request, Response, Router, NextFunction } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { examsTable, trainingCenterApplications } from '../shared/schema';
import { 
  handleCreateExam,
  handleGetExam,
  handleGetExams,
  handleExamUpdate,
  handleDeleteExam
} from './handlers/exam-handlers';

// تعريف أدوار المستخدمين
enum UserRole {
  STUDENT = 'STUDENT',
  TRAINING_CENTER = 'TRAINING_CENTER',
  TESTING_CENTER = 'TESTING_CENTER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// إنشاء موجه للاختبارات
const examsRouter = Router();

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
 * ضمان إرسال استجابة JSON فقط
 */
function ensureJsonResponse(req: Request, res: Response, next: express.NextFunction) {
  // تعيين نوع المحتوى إلى JSON
  res.setHeader('Content-Type', 'application/json');
  next();
}

// ميدلوير للتأكد من أن المستخدم مسجل الدخول
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  // طريقة 1: التحقق من req.user (الطريقة القياسية لـ Passport)
  if (req.user && (req.user as any).id) {
    console.log("المستخدم متصل عبر passport:", req.user);
    return next();
  }
  
  // طريقة 2: التحقق من req.session.user (الطريقة المستخدمة في auth-simple-new)
  if (req.session && req.session.user) {
    console.log("المستخدم متصل عبر الجلسة المخصصة:", req.session.user);
    // إضافة المعلومات إلى req.user
    req.user = req.session.user;
    return next();
  }
  
  // المستخدم غير متصل
  console.error("محاولة الوصول بدون تسجيل دخول");
  return res.status(401).json({ 
    message: "يجب تسجيل الدخول للوصول إلى هذه الخدمة",
    status: "unauthorized"
  });
}

// تطبيق وسائط على جميع مسارات الاختبارات
examsRouter.use(ensureJsonResponse);
examsRouter.use(ensureAuthenticated);

// إنشاء اختبار جديد
examsRouter.post('/', async (req: Request, res: Response) => {
  console.log("استلام طلب إنشاء اختبار جديد");
  
  try {
    // نفترض الآن أن req.user متوفر بسبب استخدام ensureAuthenticated
    
    // التحقق من أن المستخدم هو مركز اختبار - لكن بطريقة مرنة تتوافق مع الجلسة
    if (req.user && (req.user as any).role !== UserRole.TESTING_CENTER) {
      console.error(`محاولة إضافة اختبار من قِبل مستخدم بدور: ${(req.user as any).role}`);
      return res.status(403).json({ 
        message: "غير مصرح لك بإضافة اختبارات",
        status: "forbidden" 
      });
    }
    
    // استخدام معالج الاختبار الجديد
    return handleCreateExam(req, res);
    
  } catch (error: any) {
    console.error("خطأ في إضافة الاختبار:", error);
    
    return res.status(500).json({ 
      message: error.message || "حدث خطأ أثناء إنشاء الاختبار",
      status: "error"
    });
  }
});

// الحصول على قائمة الاختبارات
examsRouter.get('/', (req: Request, res: Response) => {
  // استخدام معالج الحصول على قائمة الاختبارات من ملف المعالجات
  return handleGetExams(req, res);
});

// الحصول على معلومات اختبار محدد بواسطة المعرف
examsRouter.get('/:id', (req: Request, res: Response) => {
  // استخدام معالج الحصول على اختبار من ملف المعالجات
  return handleGetExam(req, res);
});

// تحديث بيانات اختبار موجود
examsRouter.put('/:id', (req: Request, res: Response) => {
  // استخدام معالج تحديث الاختبار من ملف المعالجات
  return handleExamUpdate(req, res);
});

// حذف اختبار
examsRouter.delete('/:id', (req: Request, res: Response) => {
  // استخدام معالج حذف الاختبار من ملف المعالجات
  return handleDeleteExam(req, res);
});

export default examsRouter;