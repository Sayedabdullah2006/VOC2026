import session from "express-session";
import connectPg from "connect-pg-simple";
import { Express, Request } from "express";
import { v4 as uuidv4 } from "uuid";

// تعريفات إضافية للجلسة
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// تعريفات الجلسة
declare module 'express-session' {
  interface SessionData {
    user?: any;
    captcha?: {
      value: string;
      expires: number;
    };
  }
}

// تأكد من وجود سر للجلسة
if (!process.env.SESSION_SECRET) {
  const tempSecret = uuidv4();
  console.warn(`⚠️ Warning: SESSION_SECRET is not defined. Using temporary secret: ${tempSecret.substring(0, 8)}...`);
  process.env.SESSION_SECRET = tempSecret;
}

// تأكد من وجود رابط لقاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for session storage");
}

// تعريف واجهة الكابتشا المتوافقة مع تعريف الجلسة
export interface SimpleCaptcha {
  text: string;
  image: string;
  expiresAt: Date;
}

// إعداد الجلسة - استخدم مخزن PostgreSQL
export function setupSession(app: Express) {
  // تكوين Postgres
  const pgStore = connectPg(session);
  
  // إنشاء مخزن الجلسة
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false, // جدول الجلسات موجود بالفعل
    tableName: 'sessions', // اسم الجدول
    pruneSessionInterval: 60, // تنظيف كل دقيقة (افتراضي: 60)
  });
  
  // تكوين الجلسة
  const sessionConfig: session.SessionOptions = {
    name: 'sid', // اسم الكوكي
    secret: process.env.SESSION_SECRET,
    resave: false, // عدم إعادة الحفظ في كل طلب
    saveUninitialized: false, // تخزين الجلسات فقط عند الحاجة
    store: sessionStore,
    genid: () => uuidv4(), // توليد معرف فريد للجلسة
    cookie: {
      httpOnly: true, // غير قابل للوصول من JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS فقط في الإنتاج
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة بالمللي ثانية
      sameSite: 'lax', // يحمي ضد CSRF
    },
  };
  
  // استخدام الجلسة في التطبيق
  app.use(session(sessionConfig));
  
  console.log("✓ Session middleware configured successfully");
}

// وظيفة تخزين الكابتشا في الجلسة
export function storeCaptchaInSession(req: Express.Request, captcha: SimpleCaptcha): boolean {
  if (!req.session) {
    console.error("لا يمكن تخزين الكابتشا: جلسة غير متوفرة");
    return false;
  }
  
  try {
    // تخزين قيمة الكابتشا وتاريخ انتهاء الصلاحية
    req.session.captcha = {
      value: captcha.text,
      expires: captcha.expiresAt.getTime() // نخزن كرقم للتبسيط
    };
    
    // طباعة معلومات التصحيح
    console.log(`تم تخزين الكابتشا في الجلسة: ${captcha.text}`);
    console.log(`تاريخ انتهاء الصلاحية: ${captcha.expiresAt.toISOString()}`);
    
    // حفظ الجلسة بشكل متزامن
    req.session.save((err) => {
      if (err) {
        console.error("خطأ في حفظ جلسة الكابتشا:", err);
      } else {
        console.log("تم حفظ جلسة الكابتشا بنجاح");
      }
    });
    
    return true;
  } catch (error) {
    console.error("خطأ أثناء تخزين الكابتشا:", error);
    return false;
  }
}

// وظيفة التحقق من الكابتشا
export function validateCaptcha(req: Express.Request, userInput: string): boolean {
  if (!req.session) {
    console.error("لا يمكن التحقق من الكابتشا: جلسة غير متوفرة");
    return false;
  }
  
  if (!req.session.captcha) {
    console.error("لا يمكن التحقق من الكابتشا: كابتشا غير متوفر في الجلسة");
    return false;
  }
  
  try {
    // الحصول على قيمة الكابتشا وتاريخ انتهاء الصلاحية
    const value = req.session.captcha.value;
    const expires = req.session.captcha.expires;
    const now = Date.now();
    
    // طباعة معلومات التصحيح
    console.log(`التحقق من الكابتشا:`);
    console.log(`- كابتشا المخزن: ${value}`);
    console.log(`- كابتشا المدخل: ${userInput}`);
    console.log(`- تاريخ الانتهاء: ${new Date(expires).toISOString()}`);
    console.log(`- الآن: ${new Date(now).toISOString()}`);
    console.log(`- منتهي الصلاحية؟ ${now > expires}`);
    
    // التحقق من انتهاء الصلاحية
    if (now > expires) {
      console.error("الكابتشا منتهي الصلاحية");
      return false;
    }
    
    // المقارنة غير حساسة لحالة الأحرف
    const isValid = value.toLowerCase() === userInput.toLowerCase();
    console.log(`نتيجة التحقق: ${isValid}`);
    
    // إذا كان صحيحًا، نحذف الكابتشا من الجلسة لمنع إعادة الاستخدام
    if (isValid && req.session.captcha) {
      delete req.session.captcha;
      req.session.save();
    }
    
    return isValid;
  } catch (error) {
    console.error("خطأ أثناء التحقق من الكابتشا:", error);
    return false;
  }
}