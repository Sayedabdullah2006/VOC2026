import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * وسيط للتحقق من المدخلات باستخدام مخطط Zod
 * يمكن استخدامه للتحقق من جسم الطلب ومعلمات الاستعلام والعناوين
 */
export const validateRequest = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      console.error('Validation error:', error.format ? error.format() : error);
      return res.status(400).json({ 
        message: "بيانات غير صالحة", 
        errors: error.format ? error.format() : { _errors: [error.message || 'خطأ غير معروف'] }
      });
    }
  };