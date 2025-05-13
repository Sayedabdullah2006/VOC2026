import { Router } from 'express';
import { 
  handleCreateExam, 
  handleGetExam, 
  handleGetExams, 
  handleExamUpdate, 
  handleDeleteExam 
} from './handlers/exam-handlers';

// إنشاء راوتر جديد للتعامل مع الاختبارات
const examsRouter = Router();

// الحصول على قائمة الاختبارات
examsRouter.get('/', handleGetExams);

// الحصول على اختبار محدد
examsRouter.get('/:id', handleGetExam);

// إنشاء اختبار جديد
examsRouter.post('/', handleCreateExam);

// تحديث اختبار
examsRouter.patch('/:id', handleExamUpdate);

// حذف اختبار
examsRouter.delete('/:id', handleDeleteExam);

export default examsRouter;