// بيانات إحصائية ثابتة للعرض - استدعاء مباشر بدون أي منطق معقد
const STATS_DATA = {
  totalCandidates: 42,
  activeExams: 3,
  completedExams: 8,
  passRate: 75,
  examsByStatus: {
    'مجدولة': 2,
    'قيد التنفيذ': 1,
    'منتهية': 8
  },
  resultsByMonth: [
    { month: "ديسمبر 2024", passed: 7, failed: 2 },
    { month: "يناير 2025", passed: 5, failed: 3 },
    { month: "فبراير 2025", passed: 8, failed: 1 },
    { month: "مارس 2025", passed: 6, failed: 4 },
    { month: "أبريل 2025", passed: 9, failed: 2 },
    { month: "مايو 2025", passed: 7, failed: 3 }
  ]
};

// تصدير دالة بسيطة جدًا
exports.getTestingCenterStats = () => {
  return STATS_DATA;
};