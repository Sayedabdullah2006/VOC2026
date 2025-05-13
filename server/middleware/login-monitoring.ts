import { Request, Response, NextFunction } from 'express';

// مخزن مؤقت لتتبع محاولات تسجيل الدخول الفاشلة
// يتم حفظ كل محاولة فاشلة مع الوقت وعدد المحاولات
interface FailedAttempt {
  count: number;
  lastAttempt: number;
  isBlocked: boolean;
  blockExpires: number;
}

const failedLoginAttempts: Map<string, FailedAttempt> = new Map();

// وقت حظر الحساب بعد عدة محاولات فاشلة (بالمللي ثانية)
const BLOCK_DURATION = 15 * 60 * 1000; // 15 دقيقة
const MAX_ATTEMPTS = 5; // عدد المحاولات المسموح بها قبل الحظر

/**
 * تنظيف محاولات تسجيل الدخول القديمة
 * يتم استدعاؤها بشكل دوري لتحرير الذاكرة
 */
function cleanupOldAttempts() {
  const now = Date.now();
  // استخدام طريقة بديلة للتكرار على المفاتيح بدلاً من entries()
  const keys = Array.from(failedLoginAttempts.keys());
  
  for (const key of keys) {
    const attempt = failedLoginAttempts.get(key);
    if (!attempt) continue;
    
    if (attempt.isBlocked && now > attempt.blockExpires) {
      // إزالة الحظر بعد انتهاء فترة الحظر
      failedLoginAttempts.delete(key);
    } else if (!attempt.isBlocked && now - attempt.lastAttempt > 3600000) {
      // إزالة المحاولات الفاشلة القديمة (أكثر من ساعة)
      failedLoginAttempts.delete(key);
    }
  }
}

// تنظيف كل ساعة
setInterval(cleanupOldAttempts, 3600000);

/**
 * تسجيل محاولة تسجيل دخول فاشلة
 * @param identifier معرّف المستخدم (اسم المستخدم أو عنوان IP)
 * @returns إذا كان المستخدم محظورًا حاليًا
 */
export function recordFailedLoginAttempt(identifier: string): boolean {
  const now = Date.now();
  
  // إذا كان هذا أول فشل للمستخدم
  if (!failedLoginAttempts.has(identifier)) {
    failedLoginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
      isBlocked: false,
      blockExpires: 0
    });
    return false;
  }
  
  // تحديث محاولات الفشل الحالية
  const attempt = failedLoginAttempts.get(identifier)!;
  
  // التحقق ما إذا كان المستخدم محظورًا حاليًا
  if (attempt.isBlocked) {
    if (now < attempt.blockExpires) {
      // لا يزال المستخدم محظورًا
      return true;
    } else {
      // انتهت مدة الحظر، إعادة التعيين
      failedLoginAttempts.set(identifier, {
        count: 1,
        lastAttempt: now,
        isBlocked: false,
        blockExpires: 0
      });
      return false;
    }
  }
  
  // زيادة عدد المحاولات الفاشلة
  attempt.count += 1;
  attempt.lastAttempt = now;
  
  // التحقق من الحد الأقصى للمحاولات
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.isBlocked = true;
    attempt.blockExpires = now + BLOCK_DURATION;
    console.log(`تم حظر المستخدم ${identifier} بعد ${MAX_ATTEMPTS} محاولات فاشلة. ينتهي الحظر بعد ${BLOCK_DURATION / 60000} دقيقة.`);
  }
  
  failedLoginAttempts.set(identifier, attempt);
  return attempt.isBlocked;
}

/**
 * تسجيل محاولة تسجيل دخول ناجحة
 * @param identifier معرّف المستخدم (اسم المستخدم أو عنوان IP)
 */
export function recordSuccessfulLogin(identifier: string): void {
  // إزالة أي محاولات فاشلة سابقة
  failedLoginAttempts.delete(identifier);
}

/**
 * وسيط للتحقق من حظر المستخدم قبل محاولات تسجيل الدخول
 */
export function loginAttemptCheck(req: Request, res: Response, next: NextFunction) {
  // استخدام اسم المستخدم أو عنوان IP كمعرف
  const identifier = req.body.username || req.ip;
  
  // التحقق ما إذا كان المستخدم محظورًا
  const attempt = failedLoginAttempts.get(identifier);
  if (attempt?.isBlocked && Date.now() < attempt.blockExpires) {
    const waitMinutes = Math.ceil((attempt.blockExpires - Date.now()) / 60000);
    return res.status(429).json({
      message: `تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة مرة أخرى بعد ${waitMinutes} دقائق.`
    });
  }
  
  next();
}