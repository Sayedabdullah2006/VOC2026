/**
 * طبقة تشفير لخدمات التخزين
 */

import { storage, IStorage } from './storage';
import { 
  User, InsertUser, 
  Course, InsertCourse
} from '@shared/schema';
import { encryptSensitiveData, decryptSensitiveData } from './middleware/data-encryption';

/**
 * طبقة تشفير حول الخدمات الأساسية للتخزين
 * هذه الطبقة تعدل سلوك وظائف التخزين الحالية لإضافة التشفير/فك التشفير
 */
export class EncryptedStorage implements Partial<IStorage> {
  /**
   * الحصول على مستخدم مع فك تشفير البيانات الحساسة
   */
  async getUser(id: number): Promise<User | undefined> {
    const user = await storage.getUser(id);
    if (!user) return undefined;
    
    return decryptSensitiveData('users', user);
  }
  
  /**
   * البحث عن مستخدم باسم المستخدم مع فك تشفير البيانات الحساسة
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await storage.getUserByUsername(username);
    if (!user) return undefined;
    
    return decryptSensitiveData('users', user);
  }
  
  /**
   * إنشاء مستخدم جديد مع تشفير البيانات الحساسة
   */
  async createUser(user: InsertUser): Promise<User> {
    // تشفير البيانات الحساسة قبل الإرسال
    const encryptedUser = encryptSensitiveData('users', user);
    
    // استدعاء وظيفة التخزين الأصلية
    const createdUser = await storage.createUser(encryptedUser);
    
    // فك تشفير البيانات الحساسة قبل الإرجاع
    return decryptSensitiveData('users', createdUser);
  }
  
  /**
   * تحديث بيانات المستخدم مع تشفير البيانات الحساسة
   */
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    // تشفير البيانات الحساسة قبل الإرسال
    const encryptedUpdates = encryptSensitiveData('users', updates);
    
    // استدعاء وظيفة التخزين الأصلية
    const updatedUser = await storage.updateUser(id, encryptedUpdates);
    if (!updatedUser) return undefined;
    
    // فك تشفير البيانات الحساسة قبل الإرجاع
    return decryptSensitiveData('users', updatedUser);
  }
  
  /**
   * الحصول على جميع المستخدمين مع فك تشفير البيانات الحساسة
   */
  async listUsers(): Promise<User[]> {
    // استدعاء وظيفة التخزين الأصلية
    const users = await storage.listUsers();
    
    // فك تشفير البيانات الحساسة لكل مستخدم
    return users.map((user: User) => decryptSensitiveData('users', user));
  }
  
  /**
   * إنشاء دورة تدريبية جديدة مع تشفير البيانات الحساسة
   */
  async createCourse(course: InsertCourse): Promise<Course> {
    // تشفير البيانات الحساسة قبل الإرسال
    const encryptedCourseData = encryptSensitiveData('courses', { ...course, location: course.location || null });
    
    // استدعاء وظيفة التخزين الأصلية
    const createdCourse = await storage.createCourse(encryptedCourseData as InsertCourse);
    
    // فك تشفير البيانات الحساسة قبل الإرجاع
    return decryptSensitiveData('courses', createdCourse);
  }
  
  /**
   * الحصول على دورة تدريبية مع فك تشفير البيانات الحساسة
   */
  async getCourse(id: number): Promise<Course | undefined> {
    const course = await storage.getCourse(id);
    if (!course) return undefined;
    
    return decryptSensitiveData('courses', course);
  }
  
  /**
   * تحديث دورة تدريبية مع تشفير البيانات الحساسة
   */
  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    // تشفير البيانات الحساسة قبل الإرسال
    const encryptedUpdates = encryptSensitiveData('courses', updates);
    
    // استدعاء وظيفة التخزين الأصلية
    const updatedCourse = await storage.updateCourse(id, encryptedUpdates);
    if (!updatedCourse) return undefined;
    
    // فك تشفير البيانات الحساسة قبل الإرجاع
    return decryptSensitiveData('courses', updatedCourse);
  }
  
  /**
   * الحصول على جميع الدورات التدريبية مع فك تشفير البيانات الحساسة
   */
  async listCourses(): Promise<Course[]> {
    try {
      // استدعاء وظيفة التخزين الأصلية
      const courses = await storage.listCourses();
      
      // فك تشفير البيانات الحساسة لكل دورة
      return courses.map((course: Course) => decryptSensitiveData('courses', course));
    } catch (error) {
      console.error('Error in encrypted listCourses:', error);
      throw error;
    }
  }

  /**
   * الحصول على دورات مركز تدريبي محدد مع فك تشفير البيانات الحساسة
   */
  async listCoursesByTrainingCenter(trainingCenterId: number): Promise<Course[]> {
    try {
      // استدعاء وظيفة التخزين الأصلية
      console.log('Encrypted storage: Fetching courses for training center:', trainingCenterId);
      const courses = await storage.listCoursesByTrainingCenter(trainingCenterId);
      console.log('Encrypted storage: Retrieved courses count:', courses.length);
      
      // فك تشفير البيانات الحساسة لكل دورة
      return courses.map((course: Course) => decryptSensitiveData('courses', course));
    } catch (error) {
      console.error('Error in encrypted listCoursesByTrainingCenter:', error);
      throw error;
    }
  }
  
  /**
   * تسليم الوظائف الأخرى إلى التخزين الأصلي
   * هذه الوظائف لا تتطلب تشفير في هذا الإصدار
   */
}

/**
 * حالة مفردة من طبقة التشفير
 */
export const encryptedStorage = new EncryptedStorage();

/**
 * توجيه المكالمات غير المعرفة في طبقة التشفير إلى التخزين الأصلي
 * هذا يسمح باستخدام طبقة التشفير بدلاً من التخزين الأصلي دون الحاجة إلى تنفيذ كافة الوظائف
 */
export const proxyHandler = {
  get: function(target: EncryptedStorage, prop: string, receiver: any) {
    // الوصول إلى الخاصية في الهدف (طبقة التشفير) إذا كانت موجودة
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }
    
    // توجيه إلى التخزين الأصلي إذا لم تكن الخاصية موجودة في طبقة التشفير
    return Reflect.get(storage, prop, receiver);
  }
};

/**
 * التخزين المشفر مع توجيه الوظائف غير المنفذة إلى التخزين الأصلي
 */
export const encryptedStorageProxy = new Proxy(encryptedStorage, proxyHandler) as IStorage;