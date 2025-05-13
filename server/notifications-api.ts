/**
 * إدارة API الإشعارات
 * ملف منفصل لتسهيل إدارة وتنظيم كود الإشعارات
 */

import express, { Request, Response, Router } from 'express';

// إنشاء موجه للإشعارات
const notificationsRouter = Router();

// التخزين المؤقت للإشعارات (يمكن استبداله بقاعدة بيانات)
const notificationsCache: { [userId: string]: any[] } = {};

/**
 * ضمان إرسال استجابة JSON فقط
 */
function ensureJsonResponse(req: Request, res: Response, next: express.NextFunction) {
  // تعيين نوع المحتوى إلى JSON
  res.setHeader('Content-Type', 'application/json');
  next();
}

// تطبيق وسيط ضمان استجابة JSON على جميع مسارات الإشعارات
notificationsRouter.use(ensureJsonResponse);

// جلب الإشعارات للمستخدم الحالي
notificationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // التحقق من وجود req.user وليس isAuthenticated() لأنها قد تكون غير معرفة
    if (!req.user || !req.user.id) {
      // إرجاع مصفوفة فارغة للمستخدمين غير المسجلين
      return res.status(200).json([]); 
    }

    const userId = req.user.id;
    
    // بيانات تجريبية للإشعارات
    const notificationsData = notificationsCache[userId] || [
      {
        id: 1,
        title: "إشعار تجريبي",
        message: "هذا إشعار للتشخيص فقط",
        userId: userId,
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    // حفظ في الذاكرة المؤقتة
    notificationsCache[userId] = notificationsData;
    
    // تصدير كـ JSON بشكل صريح
    res.status(200).json(notificationsData);
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    
    // ضمان تصدير JSON وليس HTML في حالة الخطأ
    res.status(500).json({ 
      message: 'حدث خطأ في جلب الإشعارات', 
      error: String(error)
    });
  }
});

// تحديث حالة قراءة الإشعار
notificationsRouter.post('/:id/read', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح بالوصول' });
    }
    
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'معرف الإشعار غير صالح' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث حالة قراءة الإشعار:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في تحديث حالة قراءة الإشعار', 
      error: String(error)
    });
  }
});

// قراءة جميع الإشعارات
notificationsRouter.post('/read-all', async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'غير مصرح بالوصول' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('خطأ في تحديث حالة قراءة جميع الإشعارات:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في تحديث حالة قراءة جميع الإشعارات',
      error: String(error)
    });
  }
});

export default notificationsRouter;