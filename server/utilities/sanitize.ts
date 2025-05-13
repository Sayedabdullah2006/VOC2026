import { escape } from 'html-escaper';
import validator from 'validator';

/**
 * تنظيف المدخلات من أية رموز HTML خطيرة
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return escape(input);
}

/**
 * تنظيف النص من الرموز منخفضة المستوى وغير المرئية
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return validator.stripLow(input, true);
}

/**
 * تنظيف كائن كامل من المدخلات
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    const value = result[key as keyof typeof result];
    if (typeof value === 'string') {
      (result as any)[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      (result as any)[key] = sanitizeObject(value);
    }
  });
  
  return result as T;
}