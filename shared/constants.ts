// تعريف حالات الطلب
export const ApplicationStatus = {
  PENDING: "تحت المراجعة",
  FIELD_VISIT: "زيارة ميدانية",
  UNDER_EVALUATION: "تحت التقييم",
  REJECTED: "مرفوض",
  ACCEPTED: "مقبول"
} as const;

// نوع للحالات المتاحة
export type ApplicationStatusType = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// القائمة المنسدلة لحالات الطلب
export const statusOptions = [
  { value: "تحت المراجعة", label: "تحت المراجعة" },
  { value: "زيارة ميدانية", label: "زيارة ميدانية" },
  { value: "تحت التقييم", label: "تحت التقييم" },
  { value: "مرفوض", label: "مرفوض" },
  { value: "مقبول", label: "مقبول" }
];

// دالة مساعدة للحصول على شارة الحالة
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return { variant: "secondary", label: "تحت المراجعة" };
    case "زيارة ميدانية":
      return { variant: "info", label: "زيارة ميدانية" };
    case "تحت التقييم":
      return { variant: "warning", label: "تحت التقييم" };
    case "مرفوض":
      return { variant: "destructive", label: "مرفوض" };
    case "مقبول":
      return { 
        variant: "outline",
        label: "مقبول",
        className: "bg-green-50 text-green-700 border-green-200"
      };
    default:
      return { variant: "secondary", label: status };
  }
};

// أنواع المستخدمين في النظام
export const UserRole = {
  STUDENT: 'STUDENT',
  TRAINING_CENTER: 'TRAINING_CENTER',
  TESTING_CENTER: 'TESTING_CENTER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

// نوع لأنواع المستخدمين
export type UserRoleType = typeof UserRole[keyof typeof UserRole];