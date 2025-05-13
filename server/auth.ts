import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { 
  createCaptcha, 
  verifyCaptcha, 
  recordFailedCaptchaAttempt, 
  resetCaptchaFailedAttempts,
  isAccountLocked,
  shouldLockAccount,
  lockAccount,
  getAccountUnlockTime
} from "./services/captcha";
import { 
  recordFailedLoginAttempt, 
  recordSuccessfulLogin, 
  loginAttemptCheck 
} from "./middleware/login-monitoring";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    const hashedPassword = derivedKey.toString('hex');
    return `${hashedPassword}.${salt}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('حدث خطأ أثناء تشفير كلمة المرور');
  }
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashedPassword, salt] = stored.split('.');
    if (!hashedPassword || !salt) {
      console.error('Invalid stored password format');
      return false;
    }

    const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const suppliedHash = derivedKey.toString('hex');

    return hashedPassword === suppliedHash;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false, // تغيير إلى false لتحسين الأداء ومنع إعادة الكتابة غير الضرورية
    saveUninitialized: false, // تغيير إلى false لمنع تخزين الجلسات الفارغة
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production", // HTTPS فقط في الإنتاج
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
      httpOnly: true, // منع الوصول عبر JavaScript
      sameSite: 'lax', // حماية إضافية من CSRF
      path: '/' // تعيين مسار الكوكي
    },
    name: 'tga_session_id', // تغيير اسم الجلسة لإخفاء التقنية المستخدمة
    rolling: true // تجديد الجلسة مع كل طلب لمنع انتهاء الصلاحية مع الاستخدام النشط
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        console.log('Login attempt for username:', username);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log('User not found');
          return done(null, false, { message: "اسم المستخدم غير موجود" });
        }

        const isValid = await comparePasswords(password, user.password);

        if (!isValid) {
          console.log('Password comparison failed');
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }

        if (user.status !== 'active') {
          console.log('Account not active');
          return done(null, false, { message: "الحساب غير مفعل" });
        }

        console.log('Login successful');
        return done(null, user);
      } catch (err) {
        console.error('Authentication error:', err);
        return done(null, false, { message: "حدث خطأ أثناء المصادقة" });
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      // تسجيل إضافي لتتبع عمليات استرجاع الجلسة
      console.log('Session deserialization attempt for ID:', id);
      
      // التحقق من صحة معرف المستخدم
      if (!id || isNaN(id) || id <= 0) {
        console.log('Invalid user ID during session deserialization:', id);
        return done(null, false);
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found during session deserialization, ID:', id);
        return done(null, false);
      }
      
      // التحقق من حالة المستخدم أثناء استرجاع الجلسة
      if (user.status !== 'active') {
        console.log('Inactive user attempted to use session, ID:', id, 'Status:', user.status);
        return done(null, false);
      }
      
      // التحقق من وجود حقول إلزامية
      if (!user.username || !user.role) {
        console.log('User has missing required fields, ID:', id);
        return done(null, false);
      }
      
      console.log('Session deserialization successful for user:', user.username);
      done(null, user);
    } catch (err) {
      console.error('Error during session deserialization:', err);
      done(null, false);
    }
  });

  // ملاحظة: مسار إنشاء الكابتشا موجود في ملف routes.ts

  // التحقق من حالة الحساب قبل طلب تسجيل الدخول أو التسجيل
  app.get("/api/account-status", (req, res) => {
    if (isAccountLocked(req)) {
      const unlockTime = getAccountUnlockTime(req);
      return res.json({ 
        locked: true, 
        unlockTime,
        message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة' 
      });
    }
    
    res.json({ locked: false });
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // التحقق مما إذا كان الحساب مؤمنًا
      if (isAccountLocked(req)) {
        const unlockTime = getAccountUnlockTime(req);
        return res.status(403).json({ 
          message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة',
          unlockTime
        });
      }
      
      // التحقق من الكابتشا
      if (!verifyCaptcha(req, req.body.captcha)) {
        // تسجيل محاولة فاشلة
        const failedAttempts = recordFailedCaptchaAttempt(req);
        
        // تأمين الحساب بعد 5 محاولات فاشلة
        if (shouldLockAccount(req)) {
          lockAccount(req);
          return res.status(403).json({ 
            message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة',
            unlockTime: getAccountUnlockTime(req)
          });
        }
        
        return res.status(400).json({ 
          message: 'الكود الأمني غير صحيح',
          remainingAttempts: 5 - failedAttempts
        });
      }
      
      // إعادة تعيين عداد المحاولات الفاشلة عند النجاح
      resetCaptchaFailedAttempts(req);

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        status: 'active'
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", loginAttemptCheck, async (req, res, next) => {
    console.log('Login attempt received:', req.body.username);
    
    // التحقق مما إذا كان الحساب مؤمنًا من خلال الكابتشا
    if (isAccountLocked(req)) {
      const unlockTime = getAccountUnlockTime(req);
      return res.status(403).json({ 
        message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة',
        unlockTime
      });
    }
    
    // التحقق من الكابتشا
    if (!verifyCaptcha(req, req.body.captcha)) {
      // تسجيل محاولة فاشلة
      const failedAttempts = recordFailedCaptchaAttempt(req);
      
      // تأمين الحساب بعد 5 محاولات فاشلة
      if (shouldLockAccount(req)) {
        lockAccount(req);
        return res.status(403).json({ 
          message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة',
          unlockTime: getAccountUnlockTime(req)
        });
      }
      
      return res.status(400).json({ 
        message: 'الكود الأمني غير صحيح',
        remainingAttempts: 5 - failedAttempts
      });
    }

    try {
      // بدلاً من استخدام Passport للمصادقة مباشرة، سنقوم بالتحقق يدويًا
      const { username, password } = req.body;
      
      // 1. التحقق من وجود المستخدم
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log('User not found');
        
        // تسجيل محاولة فاشلة للتسجيل
        const failedAttempts = recordFailedCaptchaAttempt(req);
        
        // تسجيل محاولة فاشلة للوصول (IP Address)
        const ipAddress = req.ip || '0.0.0.0';
        recordFailedLoginAttempt(ipAddress);

        return res.status(401).json({ 
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
          remainingAttempts: 5 - failedAttempts
        });
      }
      
      // 2. التحقق من كلمة المرور
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        console.log('Password comparison failed');
        
        // تسجيل محاولة فاشلة للتسجيل
        const failedAttempts = recordFailedCaptchaAttempt(req);
        
        // تسجيل محاولة فاشلة للوصول (IP Address)
        const ipAddress = req.ip || '0.0.0.0';
        const isBlocked = recordFailedLoginAttempt(ipAddress);
        
        // تسجيل محاولة فاشلة للمستخدم
        recordFailedLoginAttempt(username);
        
        // تأمين الحساب بعد 5 محاولات فاشلة
        if (shouldLockAccount(req) || isBlocked) {
          lockAccount(req);
          return res.status(403).json({ 
            message: 'تم تأمين الحساب مؤقتًا بسبب العديد من المحاولات الفاشلة',
            unlockTime: getAccountUnlockTime(req)
          });
        }
        
        return res.status(401).json({ 
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
          remainingAttempts: 5 - failedAttempts
        });
      }
      
      // 3. تسجيل حالة الحساب (لكن نسمح بالدخول مع أي حالة)
      if (user.status !== 'active') {
        console.log('Account exists but not active - login allowed with status:', user.status, 'for user:', username);
        // سنسمح بتسجيل الدخول وسيتم التعامل مع الحالة في واجهة المستخدم
      }
      
      // 4. جميع التحققات ناجحة، يمكننا الآن إنشاء جلسة للمستخدم
      console.log('Authentication successful, creating session for:', user.username);
      console.log('User details:', {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        isActive: user.status === 'active'
      });
      
      // إعادة تعيين عداد المحاولات الفاشلة عند النجاح
      resetCaptchaFailedAttempts(req);
      
      // تسجيل تسجيل دخول ناجح (IP)
      recordSuccessfulLogin(req.ip || '0.0.0.0');
      
      // تسجيل تسجيل دخول ناجح (اسم المستخدم)
      recordSuccessfulLogin(user.username);
      
      // استخدام req.login لإنشاء الجلسة
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.status(500).json({ message: "حدث خطأ أثناء إنشاء الجلسة" });
        }
        
        console.log('Login successful, user session established for:', user.username);
        const { password, ...userWithoutPassword } = user;
        
        // التأكد من أن حالة المستخدم مضبوطة بشكل صحيح في الاستجابة
        console.log('Sending user data with status:', userWithoutPassword.status);
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ message: "حدث خطأ أثناء المصادقة" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    const ipAddress = req.ip || '0.0.0.0';
    console.log('Check user session for:', ipAddress);
    
    if (!req.isAuthenticated() || !req.user) {
      console.log('No user session found');
      // تغيير الاستجابة إلى 200 مع قيمة null بدلاً من 401
      // لضمان التعامل الصحيح في العميل
      return res.status(200).json(null);
    }
    
    try {
      // التحقق من وجود المستخدم في قاعدة البيانات
      const dbUser = await storage.getUser(req.user.id);
      if (!dbUser) {
        console.log('User not found in database but exists in session:', req.user.id);
        req.logout((err) => {
          if (err) console.error('Error logging out user not in database:', err);
        });
        return res.status(200).json(null);
      }
      
      // في حال كان المستخدم غير نشط، نسجل ذلك فقط دون إلغاء الجلسة
      if (dbUser.status !== 'active') {
        console.log('User account exists but not active:', dbUser.username, 'Status:', dbUser.status);
        // سنستمر في إعادة معلومات المستخدم بغض النظر عن حالته، 
        // وسيتم عرض رسالة مناسبة للمستخدم من خلال واجهة المستخدم
      }
      
      console.log('User session found, user:', dbUser.username);
      const { password, ...userWithoutPassword } = dbUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error in /api/user endpoint:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء التحقق من المستخدم' });
    }
  });
}