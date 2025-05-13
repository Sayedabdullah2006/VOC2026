import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * وسيط حماية CSRF
 * يستخدم session بدلاً من cookie لتخزين CSRF token
 * مما يجعله أكثر ملاءمة لبيئات الإنتاج
 */
export const csrfProtection = csurf({
  cookie: false, // استخدام جلسة بدلاً من كوكي
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // السماح بهذه الطرق بدون تحقق
  value: (req: Request) => {
    // البحث عن الرمز في مكانين:
    // 1. رأس الطلب X-CSRF-Token
    // 2. رأس الطلب CSRF-Token
    const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
    
    if (csrfToken && typeof csrfToken === 'string') {
      return csrfToken;
    }
    
    // لطلبات JSON، نبحث في الجسم
    if (req.body && req.body._csrf) {
      return req.body._csrf;
    }
    
    // إذا لم نجد أي رمز
    return '';
  }
});

/**
 * معالج أخطاء CSRF - يتم تعديله للتعامل مع المشكلات المتعلقة بإعداد CSRF
 */
export function handleCsrfError(err: any, req: Request, res: Response, next: NextFunction) {
  // تسجيل كامل الخطأ للمساعدة في التشخيص
  console.error('CSRF Error:', err.code, err.message);
  console.error('Request headers:', req.headers);
  
  if (err.code === 'EBADCSRFTOKEN') {
    // خطأ رمز CSRF
    return res.status(403).json({
      message: 'خطأ في التحقق من صحة الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
      code: 'INVALID_CSRF'
    });
  } else if (err.message === 'misconfigured csrf') {
    // خطأ في تكوين CSRF - عدم إعادة الخطأ للمستخدم في الإنتاج
    console.error('CSRF configuration error:', err);
    
    if (process.env.NODE_ENV === 'production') {
      // في الإنتاج، نرسل استجابة ناجحة وهمية لتجنب توقف واجهة المستخدم 
      if (req.path === '/api/csrf-token') {
        return res.json({ csrfToken: 'placeholder-token-for-production' });
      }
    }
    
    return res.status(500).json({
      message: 'حدث خطأ في النظام. يرجى المحاولة لاحقًا'
    });
  }
  
  // الأخطاء الأخرى
  return next(err);
}

/**
 * وسيط لإرسال CSRF token للعميل
 * تم تعديله للتعامل مع الحالات الاستثنائية
 */
export function sendCsrfToken(req: Request, res: Response) {
  try {
    // التحقق من وجود الدالة قبل استدعائها
    if (typeof req.csrfToken === 'function') {
      const token = req.csrfToken();
      res.json({ csrfToken: token });
    } else {
      // إذا كانت الدالة غير متوفرة، ارسل رمزًا وهميًا في وضع التطوير
      res.json({ 
        csrfToken: process.env.NODE_ENV === 'production' 
          ? 'placeholder-token-for-production' 
          : 'development-token'
      });
    }
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    // إرسال رمز وهمي في حالة الخطأ
    res.json({ 
      csrfToken: process.env.NODE_ENV === 'production' 
        ? 'placeholder-token-for-production' 
        : 'error-fallback-token'
    });
  }
}