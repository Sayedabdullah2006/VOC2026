import { Request, Response, NextFunction } from 'express';
import { sanitizeText } from '../utilities/sanitize';

/**
 * وسيط لتنظيف جميع البيانات المدخلة من خلال جسم الطلب
 * يقوم بتنظيف جميع حقول النصوص بشكل تلقائي
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // تنظيف النصوص من الرموز الخطرة
        req.body[key] = sanitizeText(req.body[key]);
      }
    }
  }
  next();
}

/**
 * وسيط لتنظيف معلمات URL
 */
export function sanitizeParams(req: Request, _res: Response, next: NextFunction) {
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeText(req.params[key]);
      }
    }
  }
  next();
}

/**
 * وسيط لتنظيف معلمات الاستعلام
 */
export function sanitizeQuery(req: Request, _res: Response, next: NextFunction) {
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeText(req.query[key] as string);
      }
    }
  }
  next();
}