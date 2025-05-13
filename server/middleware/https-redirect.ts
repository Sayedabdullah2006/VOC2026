/**
 * وسيط لإعادة توجيه HTTP إلى HTTPS
 * يتم استخدامه في بيئة الإنتاج فقط
 */

import { Request, Response, NextFunction } from 'express';

/**
 * وسيط لإعادة توجيه طلبات HTTP إلى HTTPS
 */
export function httpsRedirect() {
  return (req: Request, res: Response, next: NextFunction) => {
    // التحقق مما إذا كان الطلب عبر بروتوكول HTTPS
    // يأتي هذا من خلال الـ proxy كـ x-forwarded-proto
    const isSecure = req.secure || (req.headers['x-forwarded-proto'] === 'https');
    
    // في حالة طلب HTTP (غير آمن) في بيئة الإنتاج، يتم إعادة التوجيه إلى HTTPS
    if (!isSecure && process.env.NODE_ENV === 'production') {
      // بناء رابط HTTPS من رابط HTTP الحالي
      const secureUrl = `https://${req.headers.host}${req.url}`;
      
      // سجل إعادة التوجيه في سجلات النظام
      console.log(`Redirecting HTTP request to HTTPS: ${secureUrl}`);
      
      // إعادة التوجيه إلى الرابط الآمن (301 - إعادة توجيه دائمة)
      return res.redirect(301, secureUrl);
    }
    
    // الاستمرار للطلب التالي إذا كان الطلب آمنًا أو في بيئة التطوير
    next();
  };
}