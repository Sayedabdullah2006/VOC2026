/**
 * تشفير البيانات الحساسة في قاعدة البيانات
 * هذا الملف يحتوي على وظائف لتشفير وفك تشفير البيانات الشخصية
 */

import crypto from 'crypto';

// مفتاح التشفير - يجب استخدام متغير بيئي في الإنتاج
// نستخدم حاليًا معرف البيئة Replit لتحقيق أمان أفضل من المفتاح الثابت
const ENCRYPTION_KEY = process.env.REPL_ID || 'default-encryption-key';

// الخوارزمية المستخدمة للتشفير
const ALGORITHM = 'aes-256-gcm';
// طول معامل التحقق
const AUTH_TAG_LENGTH = 16;
// طول المتجه الابتدائي
const IV_LENGTH = 12;

/**
 * تشفير نص عادي إلى نص مشفر
 * @param text النص المراد تشفيره
 * @returns النص بعد التشفير (base64) مع المتجه الابتدائي ومعامل التحقق
 */
export function encrypt(text: string): string {
  try {
    if (!text) return '';
    
    // إنشاء مفتاح من السلسلة النصية (32 بايت للخوارزمية aes-256)
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // إنشاء متجه ابتدائي عشوائي
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // إنشاء خوارزمية التشفير
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    
    // تشفير النص
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // الحصول على معامل التحقق
    const authTag = cipher.getAuthTag();
    
    // دمج المتجه الابتدائي ومعامل التحقق مع النص المشفر
    return Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]).toString('base64');
  } catch (error) {
    console.error('خطأ في تشفير البيانات:', error);
    return text; // إرجاع النص الأصلي في حالة حدوث خطأ
  }
}

/**
 * فك تشفير نص مشفر إلى نص عادي
 * @param encryptedText النص المشفر
 * @returns النص الأصلي بعد فك التشفير
 */
export function decrypt(encryptedText: string): string {
  try {
    if (!encryptedText) return '';
    
    // إنشاء مفتاح من السلسلة النصية
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // تحويل النص المشفر إلى تنسيق Buffer
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    
    // استخراج المتجه الابتدائي ومعامل التحقق والنص المشفر
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const authTag = encryptedBuffer.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedContent = encryptedBuffer.slice(IV_LENGTH + AUTH_TAG_LENGTH).toString('base64');
    
    // إنشاء خوارزمية فك التشفير
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    
    // تعيين معامل التحقق
    decipher.setAuthTag(authTag);
    
    // فك تشفير النص
    let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('خطأ في فك تشفير البيانات:', error);
    return encryptedText; // إرجاع النص المشفر في حالة حدوث خطأ
  }
}

/**
 * تحديد ما إذا كان الحقل يحتاج إلى تشفير بناءً على اسمه
 * @param fieldName اسم الحقل
 * @returns حالة ما إذا كان الحقل يحتاج إلى تشفير
 */
export function shouldEncryptField(fieldName: string): boolean {
  // قائمة الحقول التي تحتوي على بيانات حساسة تحتاج إلى تشفير
  const sensitiveFields = [
    'fullName',
    'email',
    'phone',
    'identityNumber',
    'dateOfBirth',
    'nationality',
    'address',
    'employerAddress',
    'contactPerson',
    'contactPhone',
    'bankAccount',
    'emergencyContact'
  ];
  
  return sensitiveFields.includes(fieldName);
}