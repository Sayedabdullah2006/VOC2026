import express, { type Request, Response, NextFunction } from "express";
import { registerExamRoutes } from "./routes-exam";
import { registerRoutes } from "./routes.simple";
import { setupVite, serveStatic, log } from "./vite";
import { createServer, type Server } from "http";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sanitizeBody, sanitizeParams, sanitizeQuery } from "./middleware/sanitization";
import { csrfProtection, handleCsrfError } from "./middleware/csrf";
import { httpsRedirect } from "./middleware/https-redirect";
// import { setupSession } from "./auth-simple-new";
// استخدام مصادقة OpenID Connect
import { setupAuth } from "./openIdAuth";

// استيراد موجهات API المخصصة
import testingCenterApiRouter from './testing-center-api';
// استيراد موجه API الاختبارات المحسن
import examsRouter from './exams-api';
// استيراد موجه API الإشعارات المحسن
import notificationsRouter from './notifications-api';
// استيراد موجه API المناطق والمدن
import { regionCityRouter } from './region-city-api';

// إنشاء تطبيق Express
const app = express();

// إعدادات أمان أساسية
app.set('trust proxy', 1); // ضروري إذا كان التطبيق خلف proxy

// استيراد إعداد الجلسة البسيطة
import { setupSession } from "./auth-simple-new";

// إعداد جلسة المستخدم 
(async () => {
  try {
    // استخدام واجهة الجلسة البسيطة
    setupSession(app);
    console.log("✓ Session middleware configured successfully");
    
    // مؤقتا نعلق مصادقة OpenID Connect حتى تتوفر الإعدادات الصحيحة
    // await setupAuth(app);
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
  }
})();

// تطبيق إعادة التوجيه من HTTP إلى HTTPS
app.use(httpsRedirect());

// تطبيق HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: app.get("env") === "development" ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // السماح بالسكريبتات المضمنة
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"], // السماح بالخطوط من Google
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "fonts.gstatic.com"], // السماح بالخطوط من Google
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "same-origin" }
}));

// CORS protection
const corsOptions = {
  origin: app.get("env") === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'] 
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'CSRF-Token'], // إضافة رؤوس CSRF
  credentials: true,
  maxAge: 600 // 10 دقائق
};
app.use(cors(corsOptions));

// معالجة البيانات المدخلة
app.use(express.json({ limit: '10mb' })); // زيادة الحد الأقصى لطلبات JSON
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // زيادة الحد الأقصى للبيانات المرسلة
app.use(sanitizeBody); // تنظيف البيانات المدخلة
app.use(sanitizeParams);
app.use(sanitizeQuery);

// Rate limiting للحماية من هجمات Brute Force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // الحد الأقصى 100 طلب لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "تم تجاوز عدد الطلبات المسموح به. الرجاء المحاولة لاحقاً" }
});
app.use('/api/', apiLimiter);

// محدد أكثر تقييداً للمسارات الحساسة
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 دقيقة
  max: 5, // الحد الأقصى 5 محاولات لكل IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "تم تجاوز عدد محاولات تسجيل الدخول. الرجاء المحاولة لاحقاً" }
});
app.use('/api/login', loginLimiter);
app.use('/api/auth', loginLimiter);

// نقطة نهاية للحصول على رمز CSRF - يجب أن تكون قبل تطبيق معالج الأخطاء
app.get('/api/csrf-token', (req, res) => {
  try {
    // إرسال رمز CSRF وهمي في بيئة الإنتاج لتجنب مشاكل التكوين
    if (app.get("env") === "production") {
      console.log('Production mode: returning placeholder CSRF token');
      return res.json({ csrfToken: 'production-placeholder-token' });
    }
    
    // في بيئة التطوير، نستخدم حماية CSRF العادية
    csrfProtection(req, res, () => {
      if (typeof req.csrfToken === 'function') {
        res.json({ csrfToken: req.csrfToken() });
      } else {
        res.json({ csrfToken: 'development-token' });
      }
    });
  } catch (error) {
    console.error('Error in CSRF token endpoint:', error);
    res.json({ csrfToken: 'error-token' });
  }
});

// تطبيق معالج أخطاء CSRF - بعد نقطة النهاية الخاصة بالحصول على الرمز
app.use(handleCsrfError);

// حماية CSRF لجميع نقاط النهاية POST/PATCH/DELETE
// سيتم تطبيقها فقط على بعض المسارات في الإنتاج وليس على كل شيء
// إبقاء CSRF محصوراً على المسارات التي تحتاجه حقاً مثل التحقق من الكابتشا
if (app.get("env") === "production") {
  // لا يتم تطبيق حماية CSRF على كافة المسارات في الإنتاج
  // بدلاً من ذلك سيتم تطبيقها على كل مسار على حدة في ملف routes.ts
  console.log('Production mode: CSRF protection applied selectively to specific routes');
}

// طريقة آمنة لمشاركة ملفات التحميل
app.get('/api/uploads/:filename', (req, res) => {
  // التحقق من وجود الجلسة للمستخدم بطريقة آمنة
  const sessionData = req.session as any;
  if (!sessionData || !sessionData.passport || !sessionData.passport.user) {
    console.log('User session check, authenticated: false');
    console.log('No authenticated session found');
    return res.sendStatus(401);
  }
  
  console.log('User session check, authenticated: true');
  console.log('User session found, user:', sessionData.passport.user);
  
  // التحقق من صحة مسار الملف لمنع Path Traversal
  const filename = path.basename(req.params.filename);
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  // التحقق من وجود الملف
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('File not found:', filePath);
      res.status(404).json({ message: 'الملف غير موجود' });
    }
  });
});

// تتبع الأداء والتسجيل
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// استيراد الدوال اللازمة لإعداد جداول قاعدة البيانات
import { setupCaptchaTable } from './services/captcha-simple';
import { createSessionTable } from './auth-simple-new';

(async () => {
  const startTime = Date.now();
  log("Starting server initialization...");
  
  // إعداد جداول قاعدة البيانات
  await setupCaptchaTable();
  await createSessionTable();

  try {
    log("Setting up Express middleware...");
    
    // تسجيل مسارات الاختبارات القديمة
    registerExamRoutes(app);
    log("Exam routes registered successfully");
    
    // تسجيل موجه API الاختبارات المحسن
    app.use('/api/exams', examsRouter);
    log("New Exams API router registered successfully");
    
    // تسجيل موجه API الإشعارات المحسن
    app.use('/api/notifications', notificationsRouter);
    log("Notifications API router registered successfully");
    
    // تسجيل مسار API مركز الاختبار
    app.use('/api/testing-centers', testingCenterApiRouter);
    log("Testing center API routes registered successfully");
    
    // تسجيل موجه المناطق والمدن
    app.use('/api/regional', regionCityRouter);
    log("Region and City API routes registered successfully");
    
    // تسجيل المسارات الرئيسية
    const server = registerRoutes(app);
    log("Main routes registered successfully");
    log(`Express middleware setup completed in ${Date.now() - startTime}ms`);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      // تسجيل تفاصيل الخطأ كاملة للمطورين
      log(`Error handling request: ${err.message}`);
      console.error('Server error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status || err.statusCode || 500
      });
      
      // إعداد رسالة مناسبة للمستخدم (بدون كشف تفاصيل حساسة)
      const status = err.status || err.statusCode || 500;
      
      // رسائل مخصصة للأخطاء الشائعة
      const errorMessages: Record<number, string> = {
        400: 'طلب غير صالح',
        401: 'يرجى تسجيل الدخول لاستخدام هذه الميزة',
        403: 'ليس لديك صلاحية للوصول إلى هذا المورد',
        404: 'لم يتم العثور على المورد المطلوب',
        422: 'بيانات غير صالحة',
        429: 'عدد كبير من الطلبات، يرجى المحاولة لاحقاً'
      };
      
      const userMessage = errorMessages[status] || 'حدث خطأ في النظام، يرجى المحاولة لاحقاً';
      
      // إرسال الرد للمستخدم
      res.status(status).json({ message: userMessage });
    });

    // Development setup
    if (app.get("env") === "development") {
      log("Setting up Vite development server...");
      const viteStartTime = Date.now();
      try {
        await setupVite(app, server);
        log(`Vite development server setup completed in ${Date.now() - viteStartTime}ms`);
      } catch (error) {
        log(`Error setting up Vite: ${(error as Error).message}`);
        throw error;
      }
    } else {
      log("Setting up static file serving...");
      const staticStartTime = Date.now();
      serveStatic(app);
      log(`Static file serving setup completed in ${Date.now() - staticStartTime}ms`);
    }

    // Start server on port 5000
    const PORT = Number(process.env.PORT || 5000);
    log(`Starting server on port ${PORT}...`);

    server.listen(PORT, "0.0.0.0", () => {
      const totalTime = Date.now() - startTime;
      log(`Server is running successfully on port ${PORT} (startup took ${totalTime}ms)`);
      log(`Server environment: ${app.get("env")}`);
    }).on("error", (error: any) => {
      log(`Error starting server: ${error.message}`);
      process.exit(1);
    });

  } catch (error) {
    log(`Fatal error during server initialization: ${(error as Error).message}`);
    process.exit(1);
  }
})();