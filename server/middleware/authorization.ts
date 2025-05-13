import { Request, Response, NextFunction } from 'express';

/**
 * تعريف الصلاحيات المتاحة في النظام
 */
export enum Permission {
  READ_COURSES = 'READ_COURSES',
  CREATE_COURSE = 'CREATE_COURSE',
  UPDATE_COURSE = 'UPDATE_COURSE',
  DELETE_COURSE = 'DELETE_COURSE',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CENTER_APPLICATIONS = 'MANAGE_CENTER_APPLICATIONS',
  MANAGE_CERTIFICATES = 'MANAGE_CERTIFICATES',
  MANAGE_NOTIFICATIONS = 'MANAGE_NOTIFICATIONS',
  REGISTER_FOR_COURSE = 'REGISTER_FOR_COURSE',
  UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  ISSUE_CERTIFICATES = 'ISSUE_CERTIFICATES',
}

/**
 * تعريف الأدوار والصلاحيات المرتبطة بها
 */
const rolePermissions: Record<string, Permission[]> = {
  'SUPER_ADMIN': [
    Permission.READ_COURSES,
    Permission.CREATE_COURSE,
    Permission.UPDATE_COURSE,
    Permission.DELETE_COURSE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_CENTER_APPLICATIONS,
    Permission.MANAGE_CERTIFICATES,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.VIEW_REPORTS,
    Permission.ISSUE_CERTIFICATES,
  ],
  'ADMIN': [
    Permission.READ_COURSES,
    Permission.MANAGE_USERS,
    Permission.MANAGE_CENTER_APPLICATIONS,
    Permission.MANAGE_CERTIFICATES,
    Permission.VIEW_REPORTS,
    Permission.ISSUE_CERTIFICATES,
  ],
  'TRAINING_CENTER': [
    Permission.READ_COURSES,
    Permission.CREATE_COURSE,
    Permission.UPDATE_COURSE,
    Permission.DELETE_COURSE,
    Permission.MANAGE_CERTIFICATES,
    Permission.ISSUE_CERTIFICATES,
    Permission.UPLOAD_DOCUMENTS,
  ],
  'TESTING_CENTER': [
    Permission.READ_COURSES,
    Permission.MANAGE_CERTIFICATES,
    Permission.ISSUE_CERTIFICATES,
    Permission.UPLOAD_DOCUMENTS,
  ],
  'STUDENT': [
    Permission.READ_COURSES,
    Permission.REGISTER_FOR_COURSE,
    Permission.UPLOAD_DOCUMENTS,
  ],
};

/**
 * التحقق من وجود صلاحية معينة
 * @param permission الصلاحية المطلوبة
 */
export function checkPermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول' });
    }

    const userRole = req.user.role;
    const userPermissions = rolePermissions[userRole] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ message: 'لا تملك الصلاحية للقيام بهذه العملية' });
    }

    next();
  };
}

/**
 * التحقق من أن المستخدم هو مالك المورد
 * @param getResourceOwner دالة لاسترجاع معرف مالك المورد
 */
export function checkOwnership(getResourceOwner: (req: Request) => Promise<number | null>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول' });
    }

    try {
      const ownerId = await getResourceOwner(req);
      
      if (ownerId === null) {
        return res.status(404).json({ message: 'المورد غير موجود' });
      }

      if (ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'لا تملك الصلاحية للوصول إلى هذا المورد' });
      }

      next();
    } catch (error) {
      console.error('Error checking ownership:', error);
      res.status(500).json({ message: 'حدث خطأ أثناء التحقق من الصلاحيات' });
    }
  };
}