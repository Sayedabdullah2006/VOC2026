import session from "express-session";
import connectPg from "connect-pg-simple";
import { Express, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { createCaptcha } from "./services/captcha";
import { pool } from "./db";

// تعريفات إضافية للطلب
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// تعريفات جلسة مخصصة
declare module 'express-session' {
  interface SessionData {
    user?: any;
    captcha?: {
      text: string;
      expires: number;
    };
  }
}

/**
 * واجهة الكابتشا المبسطة
 */
export interface SimpleCaptcha {
  text: string;
  image: string;
  expires: Date;
}

/**
 * إنشاء كابتشا جديد
 */
export function createSimpleCaptcha(): SimpleCaptcha {
  const captcha = createCaptcha();
  
  return {
    text: captcha.text,
    image: captcha.image,
    expires: captcha.expiresAt
  };
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

/**
 * إنشاء جدول الجلسات
 */
export async function createSessionTable() {
  try {
    // استخدام التنفيذ المباشر لـ SQL لإنشاء جدول الجلسات
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
    `);
    console.log("✓ Sessions table created or already exists");
  } catch (error) {
    console.error("Error creating sessions table:", error);
    throw error;
  }
}

/**
 * إعداد الجلسة - استخدم مخزن PostgreSQL
 */
export function setupSession(app: Express) {
  // تكوين Postgres
  const pgStore = connectPg(session);
  
  // إنشاء مخزن الجلسة
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // إنشاء الجدول إذا لم يكن موجودًا
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

/**
 * وظيفة تخزين الكابتشا في الجلسة
 */
export function storeCaptchaInSession(req: Request, captchaText: string, expiresAt: Date): boolean {
  if (!req.session) {
    console.error("لا يمكن تخزين الكابتشا: جلسة غير متوفرة");
    return false;
  }
  
  try {
    // تخزين قيمة الكابتشا وتاريخ انتهاء الصلاحية
    req.session.captcha = {
      text: captchaText,
      expires: expiresAt.getTime()
    };
    
    // طباعة معلومات التصحيح
    console.log(`تم تخزين الكابتشا في الجلسة: ${captchaText}`);
    console.log(`تاريخ انتهاء الصلاحية: ${expiresAt.toISOString()}`);
    
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

/**
 * وظيفة التحقق من الكابتشا
 */
export function validateCaptcha(req: Request, userInput: string): boolean {
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
    const storedText = req.session.captcha.text;
    const expiresTime = req.session.captcha.expires;
    const now = Date.now();
    
    // طباعة معلومات التصحيح
    console.log(`التحقق من الكابتشا:`);
    console.log(`- كابتشا المخزن: ${storedText}`);
    console.log(`- كابتشا المدخل: ${userInput}`);
    console.log(`- تاريخ الانتهاء: ${new Date(expiresTime).toISOString()}`);
    console.log(`- الآن: ${new Date(now).toISOString()}`);
    console.log(`- منتهي الصلاحية؟ ${now > expiresTime}`);
    
    // التحقق من انتهاء الصلاحية
    if (now > expiresTime) {
      console.error("الكابتشا منتهي الصلاحية");
      return false;
    }
    
    // المقارنة غير حساسة لحالة الأحرف
    const isValid = storedText.toLowerCase() === userInput.toLowerCase();
    console.log(`نتيجة التحقق: ${isValid}`);
    
    // إذا كان صحيحًا، نحذف الكابتشا من الجلسة لمنع إعادة الاستخدام
    if (isValid && req.session.captcha) {
      req.session.captcha = undefined;
      req.session.save();
    }
    
    return isValid;
  } catch (error) {
    console.error("خطأ أثناء التحقق من الكابتشا:", error);
    return false;
  }
}