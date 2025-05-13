import { eq } from 'drizzle-orm';
import { db } from './db';
import { examsTable } from '@shared/schema';
import { Request, Response } from 'express';

/**
 * معالج تحديث بيانات الاختبار
 * تم فصله في ملف منفصل لتسهيل الصيانة والتطوير
 */
export async function handleExamUpdate(req: Request, res: Response) {
  try {
    const examId = parseInt(req.params.id, 10);
    
    if (isNaN(examId)) {
      return res.status(400).json({ message: "معرف الاختبار غير صالح" });
    }
    
    // التحقق من وجود الاختبار
    const [exam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId));
    
    if (!exam) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }
    
    // التحقق من وجود المستخدم ومن أن هذا الاختبار ينتمي لمركز الاختبار الحالي
    if (!req.user || exam.testing_center_id !== req.user.id) {
      return res.status(403).json({ message: "غير مصرح لك بتعديل هذا الاختبار" });
    }
    
    // سجل بيانات التحديث المستلمة من العميل للتشخيص
    console.log("بيانات التحديث المستلمة:", JSON.stringify(req.body, null, 2));
    
    // إنشاء كائن جديد فقط بالحقول المسموح بها - نهج أكثر أمانًا
    const allowedFields = [
      'title',
      'description',
      'location',
      'capacity',
      'isVisible',
      'examType',
      'examDate',  // إضافة حقل تاريخ الاختبار للسماح بتحديثه
      'status'
    ];
    
    // استخدام كائن جديد مع تحديد الأنواع بشكل أفضل
    const cleanUpdateFields: Record<string, string | number | boolean | Date | null> = {};
    
    // معالجة التاريخ بشكل منفصل وخاص - استخدام التاريخ كنص بدلاً من Date
    let parsedDate: Date | null = null;
    let examDateStr: string | null = null;
    
    if (req.body.exam_date !== undefined) {
      try {
        console.log("تنسيق التاريخ المستلم (exam_date):", req.body.exam_date);
        
        // إذا كان التاريخ المستلم سلسلة نصية فارغة أو null، فسنضع null
        if (req.body.exam_date === null || (typeof req.body.exam_date === 'string' && req.body.exam_date.trim() === '')) {
          console.log("تم استلام قيمة فارغة للتاريخ، سيتم تعيينه كـ null");
          examDateStr = null;
        } else {
          // تعيين التاريخ مباشرةً كنص
          examDateStr = req.body.exam_date;
          console.log("تم تعيين التاريخ كنص:", examDateStr);
          
          // التحقق أيضًا إذا كان التنسيق صالحًا (للتأكد)
          try {
            const tempDate = new Date(req.body.exam_date);
            if (!isNaN(tempDate.getTime())) {
              parsedDate = tempDate;
              console.log("تم التحقق من صلاحية التاريخ:", parsedDate);
            } else {
              console.warn("التاريخ ليس بتنسيق صالح لكائن Date، لكن سيتم استخدامه كنص");
            }
          } catch (err) {
            console.warn("تحذير: لا يمكن تحويل التاريخ إلى كائن Date:", err);
          }
        }
      } catch (dateError) {
        console.error("خطأ في معالجة التاريخ:", dateError);
        return res.status(400).json({ message: "حدث خطأ أثناء معالجة تاريخ الاختبار" });
      }
    } else if (req.body.examDate !== undefined) {
      // للتوافق مع الطلبات القديمة التي تستخدم examDate بدلاً من exam_date
      try {
        console.log("تنسيق التاريخ المستلم (examDate):", req.body.examDate);
        
        if (req.body.examDate === null || (typeof req.body.examDate === 'string' && req.body.examDate.trim() === '')) {
          console.log("تم استلام قيمة فارغة للتاريخ، سيتم تعيينه كـ null");
          examDateStr = null;
        } else {
          examDateStr = req.body.examDate;
          console.log("تم تعيين التاريخ كنص من examDate:", examDateStr);
        }
      } catch (dateError) {
        console.error("خطأ في معالجة التاريخ من examDate:", dateError);
        return res.status(400).json({ message: "حدث خطأ أثناء معالجة تاريخ الاختبار" });
      }
    }
    
    // نسخ الحقول المسموح بها فقط مع معالجة القيم الفارغة بشكل صحيح
    for (const field of allowedFields) {
      // التعامل مع القيم الفارغة والمحددة فقط (غير المعرفة)
      if (req.body[field] !== undefined) {
        // تحويل النصوص الفارغة إلى null
        if (typeof req.body[field] === 'string' && req.body[field].trim() === '') {
          cleanUpdateFields[field] = null;
        } else {
          cleanUpdateFields[field] = req.body[field];
        }
      }
    }
    
    // إضافة التاريخ بناءً على المعالجة السابقة
    if (examDateStr !== undefined) {
      // نستخدم قيمة التاريخ كنص مباشرة (بدلاً من كائن Date)
      cleanUpdateFields.exam_date = examDateStr;
    } else if (req.body.examDate !== undefined || req.body.exam_date !== undefined) {
      const dateValue = req.body.exam_date || req.body.examDate;
      if (dateValue === null || (typeof dateValue === 'string' && dateValue.trim() === '')) {
        // إذا كان التاريخ null أو سلسلة نصية فارغة، نعين قيمة null
        cleanUpdateFields.exam_date = null;
      }
    }
    
    // معالجة تحويل حالة الأحرف من camelCase إلى snake_case مع تعريف جميع الحقول
    const camelToSnakeMapping: Record<string, string> = {
      'isVisible': 'is_visible',
      'examType': 'exam_type'
      // لا نضيف examDate هنا لأننا نتعامل معه بشكل خاص
    };
    
    // التحويل المنظم من camelCase إلى snake_case
    for (const [camelCase, snakeCase] of Object.entries(camelToSnakeMapping)) {
      if (camelCase in cleanUpdateFields) {
        cleanUpdateFields[snakeCase] = cleanUpdateFields[camelCase];
        delete cleanUpdateFields[camelCase];
      }
    }
    
    // إضافة تاريخ التحديث الحالي
    cleanUpdateFields.updated_at = new Date();
    
    console.log("الحقول النظيفة للتحديث:", JSON.stringify(cleanUpdateFields, null, 2));
    
    // إجراء التحديث الفعلي باستخدام المعاملات لضمان التكامل
    try {
      console.log("جاري تنفيذ استعلام التحديث للاختبار رقم:", examId);
      
      // بدء معاملة قاعدة البيانات
      const updatedExam = await db.transaction(async (tx) => {
        // تنفيذ الاستعلام داخل المعاملة
        const [result] = await tx
          .update(examsTable)
          .set(cleanUpdateFields)
          .where(eq(examsTable.id, examId))
          .returning();
          
        if (!result) {
          throw new Error("فشل تحديث الاختبار - لم يتم إرجاع أي نتائج");
        }
        
        return result;
      });
      
      console.log("تم تحديث الاختبار بنجاح:", JSON.stringify(updatedExam, null, 2));
      return res.json(updatedExam);
    } catch (updateError: any) {
      console.error("خطأ في تحديث الاختبار:", updateError);
      console.error("نص الخطأ:", updateError.message);
      console.error("تفاصيل الخطأ الكاملة:", JSON.stringify(updateError, null, 2));
      
      // إرسال استجابة خطأ منسقة بشكل صحيح
      return res.status(500).json({ 
        message: "حدث خطأ أثناء تحديث بيانات الاختبار: " + (updateError.message || "خطأ غير معروف") 
      });
    }
  } catch (error: any) {
    console.error("خطأ عام في تحديث الاختبار:", error);
    console.error("تفاصيل الخطأ العام:", error.message);
    console.error("تفاصيل الخطأ الكاملة:", JSON.stringify(error, null, 2));
    
    // تقديم رسالة خطأ أكثر تفصيلاً للمستخدم
    return res.status(500).json({ 
      message: "حدث خطأ في خادم API: " + (error.message || "خطأ غير معروف")
    });
  }
}