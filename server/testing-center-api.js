/**
 * وحدة API لمراكز الاختبار
 * هذا الملف يحتوي على API خاص بمراكز الاختبار
 */

const express = require('express');
const { getTestingCenterStats } = require('./testing-center-stats');

// إنشاء موجه خاص بالـ API
const router = express.Router();

/**
 * مسار API للحصول على إحصائيات مركز اختبار محدد
 */
router.get('/stats/:id', async (req, res) => {
  // قم بتسجيل معلومات الطلب للتشخيص
  console.log(`طلب إحصائيات مركز الاختبار رقم ${req.params.id}`);
  console.log(`حالة جلسة المستخدم:`, req.session?.user ? 'مُسجل دخول' : 'غير مُسجل دخول');
  
  try {
    const centerId = parseInt(req.params.id);
    
    if (isNaN(centerId)) {
      console.error(`معرف مركز اختبار غير صالح: ${req.params.id}`);
      return res.status(400).json({ message: "معرف مركز الاختبار غير صالح" });
    }

    console.log(`جلب إحصائيات مركز الاختبار: ${centerId}`);
    
    // جلب الإحصائيات باستخدام الدالة المستوردة (لاحظ انتظار الوظيفة الغير متزامنة)
    const stats = await getTestingCenterStats(centerId);
    
    console.log(`تم استخراج إحصائيات مركز الاختبار رقم ${centerId}`);
    
    // تأكد من أن الاستجابة هي من نوع JSON
    res.setHeader('Content-Type', 'application/json');
    return res.json(stats);
  } catch (error) {
    console.error("خطأ في الحصول على إحصائيات مركز الاختبار:", error);
    return res.status(500).json({ 
      message: "حدث خطأ أثناء جلب الإحصائيات", 
      error: String(error),
      // إرجاع قيم افتراضية لضمان اتساق الواجهة
      totalExams: 0,
      totalCandidates: 0,
      activeExams: 0,
      completedExams: 0,
      examTypeStats: [],
      resultDistribution: { passed: 0, failed: 0 },
      successRate: 0,
      averageScore: 0
    });
  }
});

// تصدير الموجه للاستخدام في الملف الرئيسي
module.exports = router;