/**
 * نظام كابتشا مبسط يستخدم المعرفات وقاعدة البيانات
 */
import { randomBytes } from 'crypto';
import { db, pool } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// واجهة الكابتشا
export interface SimpleCaptcha {
  id: string;
  text: string;
  image: string;
}

/**
 * إنشاء نص كابتشا عشوائي
 */
function generateCaptchaText(length: number = 6): string {
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

/**
 * إنشاء صورة الكابتشا من النص باستخدام SVG
 */
function generateCaptchaImage(text: string): string {
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

/**
 * إنشاء كابتشا جديد
 */
export async function createSimpleCaptcha(): Promise<SimpleCaptcha> {
  try {
    // إنشاء معرف فريد
    const id = uuidv4();
    
    // إنشاء نص عشوائي
    const text = generateCaptchaText();
    
    // إنشاء صورة من النص
    const image = generateCaptchaImage(text);
    
    // حساب وقت انتهاء الصلاحية (5 دقائق)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // تخزين الكابتشا في قاعدة البيانات باستخدام pool مباشرة
    await pool.query(`
      INSERT INTO captchas (id, text, expires_at)
      VALUES ($1, $2, $3)
    `, [id, text, expiresAt]);
    
    // طباعة معلومات للتصحيح
    console.log(`تم إنشاء كابتشا جديد: ${id}, النص: ${text}`);
    
    // إرجاع الكابتشا
    return {
      id,
      text,
      image
    };
  } catch (error) {
    console.error('خطأ في إنشاء الكابتشا:', error);
    throw error;
  }
}

/**
 * التحقق من صحة الكابتشا
 */
export async function verifySimpleCaptcha(id: string, text: string): Promise<boolean> {
  try {
    // طباعة معلومات للتصحيح
    console.log(`التحقق من الكابتشا: المعرف: ${id}, النص: ${text}`);
    
    // الحصول على الكابتشا من قاعدة البيانات باستخدام pool مباشرة
    const result = await pool.query(`
      SELECT text, expires_at FROM captchas 
      WHERE id = $1
    `, [id]);
    
    // التحقق من وجود الكابتشا
    if (result.rows.length === 0) {
      console.log('الكابتشا غير موجود');
      return false;
    }
    
    const captcha = result.rows[0];
    
    // التحقق من انتهاء الصلاحية
    const expiresAt = new Date(captcha.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.log('الكابتشا منتهي الصلاحية');
      
      // حذف الكابتشا من قاعدة البيانات
      await pool.query(`
        DELETE FROM captchas WHERE id = $1
      `, [id]);
      
      return false;
    }
    
    // المقارنة غير حساسة لحالة الأحرف
    const isValid = captcha.text.toLowerCase() === text.toLowerCase();
    console.log(`نتيجة التحقق: ${isValid}`);
    
    // حذف الكابتشا من قاعدة البيانات إذا كان صحيحًا
    if (isValid) {
      await pool.query(`
        DELETE FROM captchas WHERE id = $1
      `, [id]);
    }
    
    return isValid;
  } catch (error) {
    console.error('خطأ في التحقق من الكابتشا:', error);
    return false;
  }
}

/**
 * تنظيف الكابتشا المنتهية الصلاحية
 */
export async function cleanupExpiredCaptchas(): Promise<void> {
  try {
    // حذف الكابتشا المنتهية الصلاحية
    const result = await pool.query(`
      DELETE FROM captchas WHERE expires_at < NOW()
    `);
    
    console.log('تم تنظيف الكابتشا المنتهية الصلاحية');
  } catch (error) {
    console.error('خطأ في تنظيف الكابتشا المنتهية الصلاحية:', error);
  }
}

/**
 * إنشاء جدول الكابتشا في قاعدة البيانات
 */
export async function setupCaptchaTable(): Promise<void> {
  try {
    // جدول الكابتشا
    await pool.query(`
      CREATE TABLE IF NOT EXISTS captchas (
        id VARCHAR(36) PRIMARY KEY,
        text VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // مؤشر للبحث
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_captchas_expires_at ON captchas (expires_at)
    `);
    
    console.log('تم إنشاء جدول الكابتشا بنجاح');
  } catch (error) {
    console.error('خطأ في إنشاء جدول الكابتشا:', error);
  }
}