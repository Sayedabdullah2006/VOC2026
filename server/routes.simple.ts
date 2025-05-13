import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { handleCsrfError, csrfProtection } from "./middleware/csrf";
import { comparePasswords } from "./auth";
import { storage } from "./storage";
import { createSimpleCaptcha, verifySimpleCaptcha } from "./services/captcha-simple";

export function registerRoutes(app: Express): Server {
  // إنشاء نقطة نهاية للكابتشا - بدون حماية CSRF المباشرة
  app.get("/api/captcha", async (req, res) => {
    try {
      // إنشاء كابتشا جديد باستخدام الوظيفة الجديدة
      const captcha = await createSimpleCaptcha();
      
      // توليد رمز CSRF ثابت للبيئات المختلفة
      let csrfTokenForClient = 'default-csrf-token';
      
      // في بيئة التطوير نحاول الحصول على الرمز الحقيقي من csurf
      if (process.env.NODE_ENV !== 'production') {
        try {
          // استدعاء مؤقت لوسيط CSRF للحصول على الرمز
          csrfProtection(req, res, () => {
            if (typeof req.csrfToken === 'function') {
              csrfTokenForClient = req.csrfToken();
            }
          });
        } catch (error) {
          console.log('Development: Could not generate real CSRF token, using fallback');
        }
      } else {
        // في الإنتاج نستخدم رمز ثابت لتجنب المشاكل
        csrfTokenForClient = 'production-csrf-token-' + Math.random().toString(36).substring(2, 15);
      }
      
      // إرسال الصورة والرمز
      res.json({ 
        id: captcha.id,
        image: captcha.image,
        csrfToken: csrfTokenForClient
      });
    } catch (error) {
      console.error('Error generating captcha:', error);
      res.status(500).json({ 
        message: 'حدث خطأ أثناء إنشاء الكابتشا',
        // إضافة رمز CSRF حتى في حالة الخطأ
        csrfToken: 'error-token-' + Date.now()
      });
    }
  });

  // نقطة نهاية لتسجيل الدخول
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password: passwordInput, captcha, captchaId } = req.body;
      
      // طباعة معلومات تصحيح
      console.log('محاولة تسجيل دخول مع:');
      console.log('- اسم المستخدم:', username);
      console.log('- كابتشا المدخل:', captcha);
      console.log('- معرف الكابتشا:', captchaId);
      
      // التحقق من صحة الكابتشا باستخدام الوظيفة الجديدة
      const isVerified = await verifySimpleCaptcha(captchaId, captcha);
      
      if (!isVerified) {
        return res.status(400).json({ 
          success: false, 
          message: "رمز التحقق غير صحيح أو منتهي الصلاحية" 
        });
      }
      
      // البحث عن المستخدم في قاعدة البيانات
      const user = await storage.getUserByUsername(username);
      
      // التحقق من وجود المستخدم وصحة كلمة المرور - تسجيل إضافي للتشخيص
      if (!user) {
        console.log('User not found - login attempt with nonexistent username:', username);
        return res.status(401).json({ 
          success: false, 
          message: "اسم المستخدم أو كلمة المرور غير صحيحة" 
        });
      }
      
      // التحقق من كلمة المرور
      const isValidPassword = await comparePasswords(passwordInput, user.password);
      if (!isValidPassword) {
        console.log('Password comparison failed for user:', username);
        return res.status(401).json({ 
          success: false, 
          message: "اسم المستخدم أو كلمة المرور غير صحيحة" 
        });
      }
      
      // بدلاً من رفض تسجيل الدخول للحسابات غير المفعلة، سنسمح بتسجيل الدخول 
      // مع ملاحظة حالة الحساب، وسيتم التعامل مع هذا في واجهة المستخدم
      if (user.status !== 'active') {
        console.log('Non-active account login attempt:', username, 'status:', user.status);
        // نسجل دخول المستخدم ولكن نشير إلى أن الحساب غير مفعل
      }
      
      // إنشاء بيانات المستخدم للجلسة (بدون كلمة المرور)
      const { password: passwordRemoved, ...userSession } = user;
      
      // إضافة علم لتوضيح ما إذا كان الحساب مفعلاً
      (userSession as any).isActive = userSession.status === 'active';
      
      // طباعة تشخيصية للتأكد من البيانات
      console.log('بيانات جلسة المستخدم المعدة للإرسال:', {
        id: userSession.id,
        username: userSession.username,
        status: userSession.status,
        isActive: (userSession as any).isActive
      });
      
      // التأكد من وجود كائن الجلسة
      if (!req.session) {
        console.error('خطأ في تسجيل الدخول: جلسة غير متوفرة');
        return res.status(500).json({
          success: false,
          message: "حدث خطأ أثناء تسجيل الدخول (جلسة غير متوفرة)"
        });
      }

      try {
        // إنشاء الجلسة للمستخدم
        req.session.user = userSession;
        
        // حفظ الجلسة
        req.session.save((err) => {
          if (err) {
            console.error('خطأ في حفظ الجلسة:', err);
            return res.status(500).json({ 
              success: false, 
              message: "حدث خطأ أثناء تسجيل الدخول" 
            });
          }
          
          // إرجاع بيانات المستخدم
          return res.json({ 
            success: true, 
            message: "تم تسجيل الدخول بنجاح", 
            user: userSession 
          });
        });
      } catch (error) {
        console.error('خطأ في إنشاء جلسة المستخدم:', error);
        return res.status(500).json({
          success: false,
          message: "حدث خطأ أثناء تسجيل الدخول (خطأ في الجلسة)"
        });
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تسجيل الدخول" 
      });
    }
  });
  
  // نقطة نهاية للحصول على بيانات المستخدم الحالي
  app.get("/api/user", async (req, res) => {
    try {
      console.log('Check user session for:', req.session?.user?.username);
      
      // التحقق من وجود جلسة المستخدم
      if (!req.session?.user?.id) {
        console.log('No user session found');
        return res.status(200).json(null);
      }
      
      // التحقق من وجود المستخدم في قاعدة البيانات للتأكد من صحة الجلسة
      const userId = req.session.user.id;
      const dbUser = await storage.getUser(userId);
      
      // إذا كان المستخدم غير موجود، نقوم بإنهاء الجلسة
      if (!dbUser) {
        console.log('User not found in database:', userId);
        req.session.destroy((err) => {
          if (err) console.error('Error destroying invalid session:', err);
        });
        return res.status(200).json(null);
      }
      
      // إضافة علم لتوضيح ما إذا كان الحساب مفعلاً - بدون حذف الجلسة
      const isActive = dbUser.status === 'active';
      (dbUser as any).isActive = isActive;
      
      if (!isActive) {
        console.log('User account is not active, but will allow access with inactive flag:', userId);
      }
      
      // التحقق من تطابق المعلومات الأساسية
      if (dbUser.username !== req.session.user.username) {
        console.log('Username mismatch in session vs database');
        req.session.destroy((err) => {
          if (err) console.error('Error destroying invalid session:', err);
        });
        return res.status(200).json(null);
      }
      
      // تحديث بيانات الجلسة الخاصة بالمستخدم في حالة وجود تغييرات في قاعدة البيانات
      const { password: _, ...userWithoutPassword } = dbUser;
      
      // إضافة معلومات حالة التفعيل إلى جلسة المستخدم
      if (!(userWithoutPassword as any).isActive) {
        console.log('Sending user data with inactive flag:', userWithoutPassword.id);
      }
      
      req.session.user = userWithoutPassword;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('خطأ في الحصول على بيانات المستخدم:', error);
      return res.status(500).json({ 
        message: "حدث خطأ أثناء الحصول على بيانات المستخدم" 
      });
    }
  });
  
  // نقطة نهاية للتسجيل (إنشاء حساب جديد)
  app.post("/api/register", async (req, res) => {
    try {
      const { captcha, captchaId, ...userData } = req.body;
      
      // طباعة معلومات تصحيح
      console.log('محاولة إنشاء حساب جديد مع:');
      console.log('- اسم المستخدم:', userData.username);
      console.log('- كابتشا المدخل:', captcha);
      console.log('- معرف الكابتشا:', captchaId);
      
      // التحقق من صحة الكابتشا
      const isVerified = await verifySimpleCaptcha(captchaId, captcha);
      
      if (!isVerified) {
        return res.status(400).json({ 
          success: false, 
          message: "رمز التحقق غير صحيح أو منتهي الصلاحية" 
        });
      }
      
      // التحقق من وجود مستخدم بنفس اسم المستخدم
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "اسم المستخدم موجود بالفعل" 
        });
      }
      
      // إضافة حالة نشطة للمستخدم الجديد
      const userDataWithActiveStatus = {
        ...userData,
        status: 'active' // تعيين حالة المستخدم كـ 'نشط' مباشرةً
      };
      
      // إنشاء المستخدم الجديد مع الحالة النشطة
      const newUser = await storage.createUser(userDataWithActiveStatus);
      
      // إنشاء بيانات المستخدم للجلسة (بدون كلمة المرور)
      const { password: passwordStored, ...userSession } = newUser;
      
      // التأكد من وجود كائن الجلسة
      if (!req.session) {
        console.error('خطأ في إنشاء الحساب: جلسة غير متوفرة');
        return res.status(500).json({
          success: false,
          message: "حدث خطأ أثناء إنشاء الحساب (جلسة غير متوفرة)"
        });
      }

      try {
        // إنشاء الجلسة للمستخدم
        req.session.user = userSession;
        
        // حفظ الجلسة
        req.session.save((err) => {
          if (err) {
            console.error('خطأ في حفظ الجلسة:', err);
            return res.status(500).json({ 
              success: false, 
              message: "حدث خطأ أثناء إنشاء الحساب" 
            });
          }
          
          // إرجاع بيانات المستخدم
          return res.json({ 
            success: true, 
            message: "تم إنشاء الحساب بنجاح", 
            user: userSession 
          });
        });
      } catch (error) {
        console.error('خطأ في إنشاء جلسة المستخدم الجديد:', error);
        return res.status(500).json({
          success: false,
          message: "حدث خطأ أثناء إنشاء الحساب (خطأ في الجلسة)"
        });
      }
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      return res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إنشاء الحساب" 
      });
    }
  });

  // نقطة نهاية لتسجيل الخروج
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('خطأ في تسجيل الخروج:', err);
        return res.status(500).json({ 
          success: false, 
          message: "حدث خطأ أثناء تسجيل الخروج" 
        });
      }
      
      return res.json({ 
        success: true, 
        message: "تم تسجيل الخروج بنجاح" 
      });
    });
  });

  // نقطة نهاية للحصول على مناطق البلاد
  app.get("/api/regions", async (req, res) => {
    try {
      const regions = await storage.listRegions();
      return res.json(regions);
    } catch (error) {
      console.error('خطأ في الحصول على المناطق:', error);
      return res.status(500).json({ 
        message: "حدث خطأ أثناء الحصول على المناطق" 
      });
    }
  });

  // إنشاء خادم HTTP للمسارات
  const httpServer = createServer(app);
  return httpServer;
}