/**
 * وحدة API لمراكز الاختبار
 * هذا الملف يحتوي على API خاص بمراكز الاختبار
 */

import express from 'express';
import { storage } from './storage';
import { log } from './vite';
import { getTestingCenterStats } from './testing-center-stats.js';

const router = express.Router();

/**
 * التحقق من الجلسة والصلاحيات
 * ميدلوير للتحقق من أن المستخدم مسجل دخول وأنه مركز اختبار
 */
const checkTestingCenterSession = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // طريقة 1: التحقق من session.user 
    if (req.session && req.session.user) {
      const sessionUser = req.session.user;
      log(`Testing center API: Direct user session found, user ID: ${sessionUser.id || sessionUser.userId}`);
      
      // التحقق من الدور
      if (sessionUser.role !== 'TESTING_CENTER') {
        log(`Testing center API: Direct user is not a testing center (role: ${sessionUser.role})`);
        return res.status(403).json({ 
          message: 'ليس لديك صلاحية للوصول إلى هذه الخدمة. مسموح فقط لمراكز الاختبار.',
          authenticated: true,
          authorized: false 
        });
      }
      
      // تخزين بيانات المستخدم في الطلب
      (req as any).user = sessionUser;
      log(`Testing center API: User loaded directly from session: ${sessionUser.id || sessionUser.userId}`);
      return next();
    }
    
    // طريقة 2: التحقق من passport
    const sessionData = req.session as any;
    if (!sessionData || !sessionData.passport || !sessionData.passport.user) {
      if (!sessionData) {
        log('Testing center API: Session is completely missing');
      } else if (!sessionData.passport) {
        log('Testing center API: passport object is missing in session');
      } else {
        log('Testing center API: user ID is missing in passport');
      }
      
      log('Testing center API: No authenticated session found');
      return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً', authenticated: false });
    }
    
    const userId = sessionData.passport.user;
    log(`Testing center API: User session found via passport, user ID: ${userId}`);
    
    try {
      // التحقق من أن المستخدم لديه دور مركز اختبار
      const user = await storage.getUser(Number(userId));
      
      if (!user) {
        log(`Testing center API: User not found (ID: ${userId})`);
        return res.status(401).json({ message: 'المستخدم غير موجود', authenticated: false });
      }
      
      // التحقق من الدور
      if (user.role !== 'TESTING_CENTER') {
        log(`Testing center API: User is not a testing center (role: ${user.role})`);
        return res.status(403).json({ 
          message: 'ليس لديك صلاحية للوصول إلى هذه الخدمة. مسموح فقط لمراكز الاختبار.',
          authenticated: true,
          authorized: false 
        });
      }
      
      // تخزين بيانات المستخدم في الطلب لاستخدامها لاحقاً
      (req as any).user = user;
      
      // عرض معلومات المستخدم في السجل للتصحيح
      log(`Testing center API: User authenticated successfully, ID: ${user.id}, Role: ${user.role}`);
      
      next();
    } catch (userError) {
      log(`Testing center API: Error checking user: ${userError}`);
      res.status(500).json({ message: 'حدث خطأ أثناء التحقق من صلاحيات المستخدم', error: String(userError) });
    }
  } catch (error) {
    log(`Testing center API: Unexpected error in session check: ${error}`);
    res.status(500).json({ message: 'حدث خطأ غير متوقع أثناء التحقق من الجلسة', error: String(error) });
  }
};

/**
 * مسار للحصول على طلبات مركز الاختبار
 */
router.get('/applications', checkTestingCenterSession, async (req, res) => {
  try {
    const user = (req as any).user;
    log(`Getting testing center applications for user ID: ${user.id}`);
    
    // استخدام الدالة المخصصة للحصول على طلبات مركز الاختبار
    const applications = await storage.getTestingCenterApplicationsByUser(user.id);
    
    // تنسيق البيانات للواجهة
    const formattedApplications = applications.map(app => ({
      id: app.id,
      applicationId: app.applicationId || app.id,
      status: app.status,
      centerName: app.centerName,
      managerName: app.managerName,
      city: app.city || 'غير محدد',
      submittedAt: app.submittedAt || app.createdAt || new Date().toISOString(),
      type: app.type || 'testing_center'
    }));
    
    log(`Found ${applications.length} applications for testing center ${user.id}`);
    res.json(formattedApplications);
  } catch (error) {
    log(`Error getting testing center applications: ${error}`);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات الطلبات', error: String(error) });
  }
});

/**
 * مسار للحصول على تفاصيل طلب محدد
 */
router.get('/applications/:id', checkTestingCenterSession, async (req, res) => {
  try {
    const user = (req as any).user;
    const applicationId = Number(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: 'معرف الطلب غير صالح' });
    }
    
    log(`Getting application details for ID: ${applicationId}`);
    
    // الحصول على تفاصيل الطلب (نستخدم getTestingCenterApplication بدلاً من getTrainingCenterApplication)
    const application = await storage.getTestingCenterApplication(applicationId);
    
    if (!application) {
      return res.status(404).json({ message: 'لم يتم العثور على الطلب' });
    }
    
    // التحقق من أن الطلب ينتمي لهذا المستخدم
    if (application.userId !== user.id) {
      log(`User ${user.id} attempted to access application ${applicationId} that belongs to user ${application.userId}`);
      return res.status(403).json({ message: 'ليس لديك صلاحية للوصول إلى هذا الطلب' });
    }
    
    // تنسيق البيانات للعرض في الواجهة
    const formattedApplication = {
      id: application.id,
      applicationId: application.id, // استخدام ID مباشرة
      status: application.status,
      centerName: application.centerName,
      managerName: application.managerName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      city: application.city || 'غير محدد',
      submittedAt: application.submittedAt || new Date().toISOString(),
      reviewNotes: application.reviewNotes || '',
      type: application.type || 'testing_center',
      documents: {
        commercialRecord: application.commercialRecordPath,
        facilityLicense: null, // لا توجد حاليا
        trainerCertificates: null, // لا توجد حاليا
        identityDocuments: application.identityDocumentsPath
      },
      reviewedAt: application.reviewedAt,
      certificateId: application.certificateId
    };
    
    log(`Retrieved application details for ID: ${applicationId}`);
    res.json(formattedApplication);
  } catch (error) {
    log(`Error getting application details: ${error}`);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب تفاصيل الطلب', 
      error: String(error) 
    });
  }
});

/**
 * مسار للحصول على إحصائيات مركز الاختبار
 */
router.get('/stats', checkTestingCenterSession, async (req, res) => {
  try {
    const user = (req as any).user;
    log(`Getting stats for testing center ID: ${user.id}`);
    
    // استدعاء الدالة التي تجمع الإحصائيات
    const stats = await getTestingCenterStats(user.id);
    
    log(`Retrieved stats for testing center ${user.id}: ${JSON.stringify(stats)}`);
    res.json(stats);
  } catch (error) {
    log(`Error getting testing center stats: ${error}`);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب إحصائيات مركز الاختبار', 
      error: String(error) 
    });
  }
});

router.get('/stats/:id', async (req, res) => {
  console.log(`Request for testing center stats ID ${req.params.id}`);
  console.log(`Session state:`, req.session?.user ? 'logged in' : 'not logged in');

  try {
    const centerId = parseInt(req.params.id);

    if (isNaN(centerId)) {
      console.error(`Invalid testing center ID: ${req.params.id}`);
      return res.status(400).json({ message: "Invalid testing center ID" });
    }

    console.log(`Fetching stats for testing center: ${centerId}`);
    const stats = await getTestingCenterStats(centerId);
    console.log(`Retrieved stats for testing center ${centerId}`);

    res.setHeader('Content-Type', 'application/json');
    return res.json(stats);
  } catch (error) {
    console.error("Error getting testing center stats:", error);
    return res.status(500).json({ 
      message: "Error fetching stats",
      error: String(error)
    });
  }
});

/**
 * مسار للحصول على تفاصيل مركز الاختبار
 */
router.get('/profile', checkTestingCenterSession, async (req, res) => {
  try {
    const user = (req as any).user;
    log(`Getting profile for testing center ID: ${user.id}`);
    
    // الحصول على بيانات مركز الاختبار
    const testCenter = await storage.getTestingCenterByUserId(user.id);
    
    if (!testCenter) {
      log(`Testing center not found for user ID: ${user.id}`);
      return res.status(404).json({ 
        message: 'لم يتم العثور على بيانات مركز الاختبار',
        userId: user.id
      });
    }
    
    // تنسيق البيانات للواجهة
    const profileData = {
      id: testCenter.id,
      name: testCenter.name,
      address: testCenter.address,
      userId: testCenter.userId,
      licenseNumber: testCenter.licenseNumber,
      facilityId: testCenter.facilityId,
      status: testCenter.status,
      approvalDate: testCenter.approvalDate,
      expiryDate: testCenter.expiryDate
    };
    
    log(`Retrieved profile for testing center ${user.id}`);
    res.json(profileData);
  } catch (error) {
    log(`Error getting testing center profile: ${error}`);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء جلب بيانات مركز الاختبار', 
      error: String(error) 
    });
  }
});

export default router;