// تحديث بيانات الاختبار - الإصدار المصحح
app.patch('/api/exams/:id', [authenticate, authenticateTestingCenter], async (req, res) => {
  try {
    const examId = parseInt(req.params.id, 10);
    // تحقق من وجود الاختبار
    const [exam] = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, examId));
    
    if (!exam) {
      return res.status(404).json({ message: "الاختبار غير موجود" });
    }
    
    // تأكد من أن المستخدم هو صاحب الاختبار
    if (exam.testing_center_id !== req.user.id) {
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
      'status'
    ];
    
    // استخدام كائن جديد بدلاً من استخدام req.body مباشرةً
    const cleanUpdateFields: Record<string, any> = {};
    
    // نسخ الحقول المسموح بها فقط
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        cleanUpdateFields[field] = req.body[field];
      }
    }
    
    // معالجة تحويل حالة الأحرف من camelCase إلى snake_case
    if (cleanUpdateFields.isVisible !== undefined) {
      cleanUpdateFields.is_visible = cleanUpdateFields.isVisible;
      delete cleanUpdateFields.isVisible;
    }
    
    if (cleanUpdateFields.examType !== undefined) {
      cleanUpdateFields.exam_type = cleanUpdateFields.examType;
      delete cleanUpdateFields.examType;
    }
    
    // معالجة التاريخ بشكل منفصل وخاص
    if (req.body.examDate) {
      try {
        console.log("تنسيق التاريخ المستلم:", req.body.examDate);
        // محاولة تحويل التاريخ إلى كائن Date صالح
        const parsedDate = new Date(req.body.examDate);
        
        // التحقق من صحة التاريخ باستخدام getTime()
        if (isNaN(parsedDate.getTime())) {
          console.error("تاريخ غير صالح:", req.body.examDate);
          return res.status(400).json({ message: "تنسيق تاريخ الاختبار غير صالح" });
        }
        
        // استخدام حقل exam_date (snake_case) مباشرةً
        cleanUpdateFields.exam_date = parsedDate;
        console.log("تم تحويل التاريخ بنجاح:", parsedDate);
      } catch (dateError) {
        console.error("خطأ في معالجة التاريخ:", dateError);
        return res.status(400).json({ message: "حدث خطأ أثناء معالجة تاريخ الاختبار" });
      }
    }
    
    // إضافة تاريخ التحديث الحالي
    cleanUpdateFields.updated_at = new Date();
    
    console.log("الحقول النظيفة للتحديث:", cleanUpdateFields);
    
    try {
      const [updatedExam] = await db
        .update(examsTable)
        .set(cleanUpdateFields)
        .where(eq(examsTable.id, examId))
        .returning();
      
      console.log("تم تحديث الاختبار بنجاح:", updatedExam);
      res.json(updatedExam);
    } catch (updateError: any) {
      console.error("خطأ في تحديث الاختبار:", updateError);
      // إعادة تعيين رأس Content-Type لضمان إرجاع JSON
      res.setHeader('Content-Type', 'application/json');
      // إرسال استجابة خطأ منسقة بشكل صحيح
      return res.status(500).json({ 
        message: "حدث خطأ أثناء تحديث بيانات الاختبار: " + (updateError.message || "خطأ غير معروف") 
      });
    }
  } catch (error: any) {
    console.error("خطأ عام في تحديث الاختبار:", error);
    return res.status(500).json({ message: "حدث خطأ في تحديث بيانات الاختبار" });
  }
});