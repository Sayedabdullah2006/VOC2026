import { randomBytes } from 'crypto';
import { Request } from 'express';

// إضافة تعريفات للجلسة
declare module 'express-session' {
  interface SessionData {
    captcha?: {
      text: string;
      expiresAt: Date;
    };
    captchaFailedAttempts?: number;
    accountLocked?: boolean;
    accountLockedUntil?: Date;
  }
}

// تعريف واجهة الكابتشا
export interface Captcha {
  text: string;
  image: string;
  expiresAt: Date;
}

// توليد نص كابتشا عشوائي بطول محدد
export function generateCaptchaText(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  
  // استخدام randomBytes للحصول على قيم عشوائية آمنة
  const randomBuffer = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBuffer[i] % chars.length;
    result += chars.charAt(randomIndex);
  }
  
  return result;
}

// إنشاء صورة الكابتشا من النص باستخدام SVG
export function generateCaptchaImage(text: string): string {
  const width = 200;
  const height = 60;
  
  // إنشاء محتوى SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  // خلفية بيضاء
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // إضافة بعض الخطوط العشوائية للتشويش
  for (let i = 0; i < 5; i++) {
    const r = Math.floor(Math.random() * 100);
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(${r}, ${g}, ${b}, 0.3)" />`;
  }
  
  // إضافة نقاط عشوائية للتشويش
  for (let i = 0; i < 40; i++) {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    const x = Math.random() * width;
    const y = Math.random() * height;
    
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="rgba(${r}, ${g}, ${b}, 0.3)" />`;
  }
  
  // إضافة خطوط متعرجة للتشويش
  for (let i = 0; i < 2; i++) {
    const r = Math.floor(Math.random() * 150);
    const g = Math.floor(Math.random() * 150);
    const b = Math.floor(Math.random() * 150);
    
    let path = `<path d="M0,${Math.random() * height}`;
    
    for (let j = 0; j < width; j += width / 10) {
      const y = Math.sin(j * 0.05) * 5 + (height / 2);
      path += ` L${j},${y}`;
    }
    
    path += `" stroke="rgba(${r}, ${g}, ${b}, 0.4)" fill="none" />`;
    svg += path;
  }
  
  // رسم النص
  const fontSize = Math.floor(height * 0.5);
  const startY = height / 2 + fontSize / 3;
  const charWidth = width / (text.length + 2); // توزيع الأحرف بشكل متساوٍ
  
  for (let i = 0; i < text.length; i++) {
    const x = charWidth + (i * charWidth);
    const y = startY;
    const rotation = (Math.random() - 0.5) * 20; // دوران عشوائي
    
    // تحديد لون عشوائي للنص
    const r = Math.floor(Math.random() * 50);
    const g = Math.floor(Math.random() * 50);
    const b = Math.floor(Math.random() * 150 + 100); // دائماً أزرق غامق
    
    svg += `<text x="${x}" y="${y}" font-family="Arial" font-size="${fontSize}" font-weight="bold" fill="rgb(${r}, ${g}, ${b})" transform="rotate(${rotation}, ${x}, ${y})">${text[i]}</text>`;
  }
  
  svg += '</svg>';
  
  // تحويل SVG إلى صيغة data URL
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// إنشاء كابتشا جديدة
export function createCaptcha(length: number = 6): Captcha {
  const text = generateCaptchaText(length);
  const image = generateCaptchaImage(text);
  
  // تعيين وقت انتهاء الصلاحية (5 دقائق من الآن)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  
  return {
    text,
    image,
    expiresAt
  };
}

// التحقق من صحة الكابتشا
export function verifyCaptcha(
  sessionCaptcha: { text: string, expiresAt: Date } | undefined, 
  captchaInput: string
): boolean {
  // التحقق من وجود الكابتشا في الجلسة
  if (!sessionCaptcha) {
    return false;
  }
  
  // التحقق من عدم انتهاء صلاحية الكابتشا
  const now = new Date();
  const expiresAt = typeof sessionCaptcha.expiresAt === 'string' 
    ? new Date(sessionCaptcha.expiresAt) 
    : sessionCaptcha.expiresAt;
    
  if (now > expiresAt) {
    return false;
  }
  
  // المقارنة غير حساسة لحالة الأحرف
  return sessionCaptcha.text.toLowerCase() === captchaInput.toLowerCase();
}

// تسجيل محاولة فاشلة للكابتشا
export function recordFailedCaptchaAttempt(req: Request): number {
  if (!req.session.captchaFailedAttempts) {
    req.session.captchaFailedAttempts = 0;
  }
  
  req.session.captchaFailedAttempts += 1;
  return req.session.captchaFailedAttempts;
}

// إعادة تعيين عداد المحاولات الفاشلة
export function resetCaptchaFailedAttempts(req: Request): void {
  req.session.captchaFailedAttempts = 0;
}

// الحصول على عدد المحاولات الفاشلة
export function getCaptchaFailedAttempts(req: Request): number {
  return req.session.captchaFailedAttempts || 0;
}

// التحقق مما إذا كان ينبغي تأمين الحساب
export function shouldLockAccount(req: Request, maxAttempts: number = 5): boolean {
  return getCaptchaFailedAttempts(req) >= maxAttempts;
}

// تأمين الحساب
export function lockAccount(req: Request): void {
  req.session.accountLocked = true;
  req.session.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 دقيقة
}

// التحقق مما إذا كان الحساب مؤمنًا
export function isAccountLocked(req: Request): boolean {
  if (!req.session.accountLocked) {
    return false;
  }
  
  const now = new Date();
  const unlockTime = req.session.accountLockedUntil;
  
  if (unlockTime) {
    const unlockDate = typeof unlockTime === 'object' ? unlockTime : new Date(String(unlockTime));
    if (now > unlockDate) {
      // إلغاء تأمين الحساب إذا انتهت مدة التأمين
      req.session.accountLocked = false;
      resetCaptchaFailedAttempts(req);
      return false;
    }
  }
  
  return true;
}

// الحصول على وقت فك تأمين الحساب
export function getAccountUnlockTime(req: Request): Date | null {
  if (!req.session.accountLocked || !req.session.accountLockedUntil) {
    return null;
  }
  
  // استخدام التحويل الصريح لتجنب أخطاء التحويل
  const unlockTime = req.session.accountLockedUntil;
  return typeof unlockTime === 'object' ? unlockTime : new Date(String(unlockTime));
}