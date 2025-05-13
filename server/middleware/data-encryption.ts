/**
 * وسيط لتشفير وفك تشفير البيانات الحساسة
 */

import { Request, Response, NextFunction } from 'express';
import { encrypt, decrypt, shouldEncryptField } from '../utilities/encryption';

/**
 * تشفير البيانات الحساسة قبل الحفظ في قاعدة البيانات
 * @param modelName اسم الكائن الذي يتم التعامل معه (مثل 'users', 'certificates')
 * @param data البيانات المراد تشفيرها
 * @returns البيانات بعد التشفير
 */
export function encryptSensitiveData<T>(modelName: string, data: T): T {
  if (!data) return data;
  
  const encryptedData = { ...data } as any;
  
  // تكرار على جميع حقول البيانات
  for (const key in encryptedData) {
    // تحقق ما إذا كان الحقل يحتاج إلى تشفير
    if (shouldEncryptField(key) && encryptedData[key] && typeof encryptedData[key] === 'string') {
      // تشفير البيانات الحساسة
      encryptedData[key] = encrypt(encryptedData[key]);
    } else if (typeof encryptedData[key] === 'object' && encryptedData[key] !== null) {
      // تكرار على الكائنات المتداخلة
      if (Array.isArray(encryptedData[key])) {
        // إذا كان الحقل مصفوفة، قم بتكرار كل عنصر
        encryptedData[key] = encryptedData[key].map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            return encryptSensitiveData(`${modelName}.${key}`, item);
          }
          return item;
        });
      } else {
        // إذا كان الحقل كائنًا، قم بتشفير حقوله الحساسة
        encryptedData[key] = encryptSensitiveData(`${modelName}.${key}`, encryptedData[key]);
      }
    }
  }
  
  return encryptedData as T;
}

/**
 * فك تشفير البيانات الحساسة بعد استرجاعها من قاعدة البيانات
 * @param modelName اسم الكائن الذي يتم التعامل معه
 * @param data البيانات المراد فك تشفيرها
 * @returns البيانات بعد فك التشفير
 */
export function decryptSensitiveData<T>(modelName: string, data: T): T {
  if (!data) return data;
  
  const decryptedData = { ...data } as any;
  
  // تكرار على جميع حقول البيانات
  for (const key in decryptedData) {
    // تحقق ما إذا كان الحقل يحتاج إلى فك تشفير
    if (shouldEncryptField(key) && decryptedData[key] && typeof decryptedData[key] === 'string') {
      // فك تشفير البيانات الحساسة
      decryptedData[key] = decrypt(decryptedData[key]);
    } else if (typeof decryptedData[key] === 'object' && decryptedData[key] !== null) {
      // تكرار على الكائنات المتداخلة
      if (Array.isArray(decryptedData[key])) {
        // إذا كان الحقل مصفوفة، قم بتكرار كل عنصر
        decryptedData[key] = decryptedData[key].map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            return decryptSensitiveData(`${modelName}.${key}`, item);
          }
          return item;
        });
      } else {
        // إذا كان الحقل كائنًا، قم بفك تشفير حقوله الحساسة
        decryptedData[key] = decryptSensitiveData(`${modelName}.${key}`, decryptedData[key]);
      }
    }
  }
  
  return decryptedData as T;
}

/**
 * وسيط لفك تشفير البيانات الحساسة في استجابة API
 * @param modelName اسم الكائن الذي يتم التعامل معه
 */
export function decryptResponseMiddleware(modelName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // حفظ دالة الاستجابة الأصلية
    const originalJson = res.json;
    
    // تعديل دالة الاستجابة لفك تشفير البيانات قبل إرسالها
    res.json = function(body: any) {
      // في حالة البيانات المشفرة، قم بفك التشفير
      const decryptedBody = decryptSensitiveData(modelName, body);
      
      // استعادة الدالة الأصلية مع البيانات المفككة
      return originalJson.call(this, decryptedBody);
    };
    
    next();
  };
}