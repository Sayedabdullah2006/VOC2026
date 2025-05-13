import { ProgressStep } from './vertical-progress-tracker';

// مراحل طلب مركز التدريب/الاختبار
export const getApplicationProgressSteps = (status: string): ProgressStep[] => {
  // المراحل الأساسية لطلب المركز
  const steps: ProgressStep[] = [
    {
      id: 'submission',
      title: 'تقديم الطلب',
      description: 'تم تقديم طلب الاعتماد بنجاح',
      status: 'completed'
    },
    {
      id: 'initial-review',
      title: 'المراجعة الأولية',
      description: 'مراجعة المستندات والمعلومات المقدمة',
      status: 'pending'
    },
    {
      id: 'field-visit',
      title: 'الزيارة الميدانية',
      description: 'زيارة المركز للتحقق من المعايير المطلوبة',
      status: 'pending'
    },
    {
      id: 'evaluation',
      title: 'التقييم النهائي',
      description: 'مراجعة نتائج الزيارة الميدانية والتقييم النهائي',
      status: 'pending'
    },
    {
      id: 'decision',
      title: 'القرار النهائي',
      description: 'إصدار القرار النهائي بشأن الطلب',
      status: 'pending'
    }
  ];

  // تحديث حالة المراحل بناءً على حالة الطلب الحالية
  switch (status) {
    case 'تحت المراجعة':
      steps[1].status = 'current';
      break;
    case 'زيارة ميدانية':
      steps[1].status = 'completed';
      steps[2].status = 'current';
      break;
    case 'تحت التقييم':
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[3].status = 'current';
      break;
    case 'مقبول':
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[3].status = 'completed';
      steps[4].status = 'completed';
      break;
    case 'مرفوض':
      // إذا تم رفض الطلب، سنعتمد على المرحلة التي وصل إليها
      if (steps[3].status === 'current' || steps[3].status === 'completed') {
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'completed';
        steps[4].status = 'rejected';
      } else if (steps[2].status === 'current' || steps[2].status === 'completed') {
        steps[1].status = 'completed';
        steps[2].status = 'completed';
        steps[3].status = 'rejected';
        steps[4].status = 'rejected';
      } else {
        steps[1].status = 'completed';
        steps[2].status = 'rejected';
        steps[3].status = 'rejected';
        steps[4].status = 'rejected';
      }
      break;
    default:
      // الإعدادات الافتراضية
      break;
  }

  return steps;
};