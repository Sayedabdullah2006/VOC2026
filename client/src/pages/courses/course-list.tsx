import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Clock, Users, Check, RefreshCw, Loader2, X, Info, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// تحديث أنواع البيانات مع المزيد من التفاصيل
interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  capacity: number;
  start_date: string;
  end_date: string;
  region: string;
  training_center_id: number;
  status: string;
  trainingCenter?: {
    name: string;
    id: number;
  };
  enrollmentCount?: number;
}

interface Enrollment {
  courseId: number;
  status: string;
}

// إصدار معاد تصميمه لصفحة الدورات
export default function CourseListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // جلب الدورات
  const { 
    data: courses = [], 
    isLoading: isCoursesLoading,
    refetch: refetchCourses
  } = useQuery<Course[]>({
    queryKey: ["/api/courses", refreshKey],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses");
      return response.json();
    }
  });

  // جلب تسجيلات المستخدم الحالي بصيغة مبسطة
  const { 
    data: enrollments = [], 
    isLoading: isEnrollmentsLoading,
    refetch: refetchEnrollments
  } = useQuery<Enrollment[]>({
    queryKey: ["/api/courses/enrolled", "simple", refreshKey],
    queryFn: async () => {
      if (!user || user.role !== UserRole.STUDENT) {
        return [];
      }
      console.log('جلب التسجيلات للمستخدم:', user.id);
      
      try {
        const response = await apiRequest("GET", "/api/courses/enrolled?format=simple");
        if (!response.ok) {
          throw new Error('فشل في جلب التسجيلات');
        }
        
        const data = await response.json();
        console.log('بيانات التسجيل المستلمة:', data);
        return data;
      } catch (error) {
        console.error('خطأ في جلب التسجيلات:', error);
        return [];
      }
    },
    enabled: !!user && user.role === UserRole.STUDENT,
    refetchInterval: 5000,     // تحديث كل 5 ثوانٍ
    staleTime: 0,              // البيانات دائماً غير محدثة (لضمان إعادة التحميل)
    refetchOnWindowFocus: true // إعادة التحميل عند استعادة تركيز النافذة
  });

  // وظيفة محسّنة لتحديث حالة تسجيلات الدورات بشكل كامل
  const refreshEnrollmentStatus = useCallback(async () => {
    if (!user || user.role !== UserRole.STUDENT) {
      return; // لا داعي للتحديث إذا لم يكن المستخدم متدرباً
    }
    
    setIsRefreshing(true);
    console.log('تحديث حالة التسجيل...');
    
    try {
      // 1. تحديث الدورات المسجل فيها (النسخة المبسطة)
      console.log('1. تحديث قائمة التسجيلات المبسطة...');
      const enrollmentsResponse = await apiRequest("GET", "/api/courses/enrolled?format=simple");
      if (!enrollmentsResponse.ok) {
        throw new Error('فشل في تحديث قائمة التسجيلات');
      }
      
      const enrollmentsData = await enrollmentsResponse.json();
      console.log('بيانات التسجيلات المستلمة:', enrollmentsData);
      
      // تحديث التخزين المؤقت للتسجيلات المبسطة
      queryClient.setQueryData(["/api/courses/enrolled", "simple"], enrollmentsData);
      
      // 2. تحديث التحقق المباشر من حالة التسجيل للدورات المعروضة
      console.log('2. التحقق المباشر من حالة التسجيل للدورات المعروضة...');
      if (courses.length > 0) {
        const courseIds = courses.map(course => course.id);
        
        const checkResponse = await apiRequest("POST", "/api/courses/check-enrollments", { courseIds });
        if (!checkResponse.ok) {
          throw new Error('فشل في التحقق من حالة التسجيل');
        }
        
        const statusData = await checkResponse.json();
        console.log('نتيجة التحقق المباشر من حالة التسجيل:', statusData);
        
        // تحديث كاش التحقق
        queryClient.setQueryData(["/api/courses/enrollment-status"], statusData);
        
        // 3. تحديث مجموعة الدورات المسجل فيها بناءً على نتائج التحقق
        const enrolledCourseIds = Object.entries(statusData)
          .filter(([_, isEnrolled]) => isEnrolled === true)
          .map(([id, _]) => parseInt(id));
          
        console.log('الدورات المسجل فيها حسب التحقق المباشر:', enrolledCourseIds);
        
        // إضافة الدورات المسجل فيها إلى التسجيلات المبسطة إذا لم تكن موجودة بالفعل
        if (enrolledCourseIds.length > 0) {
          queryClient.setQueryData(["/api/courses/enrolled", "simple"], (oldData: any[]) => {
            if (!oldData) {
              return enrolledCourseIds.map(id => ({ courseId: id, status: "مسجل" }));
            }
            
            const existingIds = new Set(oldData.map(item => item.courseId));
            const newEnrollments = [...oldData];
            
            enrolledCourseIds.forEach(courseId => {
              if (!existingIds.has(courseId)) {
                newEnrollments.push({ courseId, status: "مسجل" });
              }
            });
            
            return newEnrollments;
          });
        }
      }
      
      // 3. جلب التسجيلات المفصلة (لاستخدامها في صفحة تفاصيل الدورة)
      console.log('3. تحديث قائمة التسجيلات المفصلة...');
      const detailedResponse = await apiRequest("GET", "/api/courses/enrolled");
      if (detailedResponse.ok) {
        const detailedData = await detailedResponse.json();
        queryClient.setQueryData(["/api/courses/enrolled"], detailedData);
      }
      
      // 4. تحديث قائمة الدورات إذا كان ذلك ضرورياً
      await refetchCourses();
      
      // 5. إجبار إعادة رسم المكونات
      setRefreshKey(prev => prev + 1);
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة التسجيل بنجاح",
      });
    } catch (error) {
      console.error('فشل في تحديث حالة التسجيل:', error);
      toast({
        title: "فشل التحديث",
        description: "حدث خطأ أثناء تحديث حالة التسجيل",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [user, courses, queryClient, toast, refetchCourses]);

  // تنفيذ التحقق من حالة التسجيل عند تحميل الصفحة وعند تغير المستخدم
  useEffect(() => {
    // فقط قم بالتحقق مرة واحدة عند التحميل الأولي أو تغيير المستخدم
    if (user && user.role === UserRole.STUDENT && !isCoursesLoading) {
      console.log('تحميل الصفحة وتنفيذ التحقق من حالة التسجيل...');
      
      // إعادة تحميل الصفحة وتحديث حالة التسجيل
      refreshEnrollmentStatus();
      
      // للتأكد من صحة البيانات، نحدث التسجيلات مباشرة أيضاً
      refetchEnrollments();
    }
  }, [user]); // ربط فقط بالمستخدم للتأكد من تنفيذ هذا عند تغيير المستخدم
  
  // تحديث عندما تكتمل عملية تحميل الدورات
  useEffect(() => {
    if (courses.length > 0 && user && user.role === UserRole.STUDENT) {
      console.log('تحديث حالة التسجيل بعد تحميل الدورات:', courses.length);
      
      // تحقق مباشر من حالة التسجيل بعد تحميل الدورات
      const courseIds = courses.map(course => course.id);
      
      // استخدام apiRequest بدلاً من refreshEnrollmentStatus للتأكد من عدم حدوث تكرار
      apiRequest("POST", "/api/courses/check-enrollments", { courseIds })
        .then(async response => {
          if (response.ok) {
            const statusData = await response.json();
            console.log('حالة التسجيل المحدثة:', statusData);
            
            // تحديث كاش التحقق
            queryClient.setQueryData(["/api/courses/enrollment-status"], statusData);
            
            // إجبار إعادة الرسم
            setRefreshKey(prev => prev + 1);
          }
        })
        .catch(error => {
          console.error('فشل في التحقق من حالة التسجيل:', error);
        });
    }
  }, [courses, user, queryClient]);

  // وظيفة محسّنة للتحقق من حالة تسجيل المستخدم في دورة معينة
  const isEnrolled = useCallback((courseId: number): boolean => {
    // تم التأكد من أن هناك مشكلة في التحقق، لذلك سنستخدم أكثر من طريقة للتحقق

    // 1. التحقق من قائمة التسجيلات
    if (enrollments?.length > 0) {
      // بحث مباشر في قائمة التسجيلات
      const directMatch = enrollments.some(e => Number(e.courseId) === Number(courseId));
      if (directMatch) {
        console.log(`✓ الطريقة 1: معرف الدورة ${courseId} موجود في قائمة التسجيلات`, enrollments);
        return true;
      }
    }
    
    // 2. التحقق من كاش التحقق المباشر إذا كان موجوداً
    const enrollmentStatusCache = queryClient.getQueryData(["/api/courses/enrollment-status"]) as Record<string, boolean> | undefined;
    if (enrollmentStatusCache && enrollmentStatusCache[courseId]) {
      console.log(`✓ الطريقة 2: معرف الدورة ${courseId} موجود في كاش التحقق المباشر`);
      return true;
    }
    
    // 3. التحقق من عرض التفاصيل - من المحتمل أن تكون مخزنة في مكان آخر
    // نحن نستخدم هذه الطريقة لضمان الاتساق
    const allEnrollmentData = queryClient.getQueryData(["/api/courses/enrolled"]) as any[];
    if (allEnrollmentData?.length > 0) {
      const match = allEnrollmentData.some(item => 
        (item.courseId === courseId) || (item.course?.id === courseId)
      );
      if (match) {
        console.log(`✓ الطريقة 3: معرف الدورة ${courseId} موجود في بيانات التسجيلات المفصلة`);
        return true;
      }
    }

    // لم يتم العثور على أي تسجيل في أي مكان
    return false;
  }, [enrollments, queryClient]);

  // التحقق إذا كانت الدورة متاحة للتسجيل
  const isAvailableForEnrollment = useCallback((course: Course): boolean => {
    return course.status === 'مجدولة';
  }, []);

  // الحصول على نص حالة التسجيل
  const getEnrollmentStatusText = useCallback((course: Course): string => {
    if (!user) {
      return 'سجل دخول للتسجيل';
    }
    
    if (user.role !== UserRole.STUDENT) {
      return 'متاح للمتدربين فقط';
    }
    
    if (isEnrolled(course.id)) {
      return 'تم التسجيل ✓';
    }
    
    if (!isAvailableForEnrollment(course)) {
      return `الدورة ${course.status}`;
    }
    
    return 'سجل في الدورة';
  }, [user, isEnrolled, isAvailableForEnrollment]);

  // تكوين عملية التسجيل
  const registerMutation = useMutation({
    mutationFn: async (courseId: number) => {
      console.log('بدء تسجيل الدورة:', courseId);
      
      const response = await apiRequest("POST", `/api/courses/${courseId}/register`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل التسجيل في الدورة");
      }
      
      return response.json();
    },
    onSuccess: (data, courseId) => {
      console.log('تم التسجيل بنجاح:', data);
      
      // عرض رسالة النجاح
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الدورة بنجاح",
      });

      // تحديث كاش حالة التسجيل
      queryClient.setQueryData(["/api/courses/enrollment-status"], (oldData: any) => ({
        ...oldData,
        [courseId]: true
      }));
      
      // تحديث كاش التسجيلات
      queryClient.setQueryData(["/api/courses/enrolled", "simple"], (oldData: any) => {
        if (!oldData) {
          return [{ courseId, status: "مسجل" }];
        }
        
        // تجنب التكرار
        if (oldData.some((e: any) => e.courseId === courseId)) {
          return oldData;
        }
        
        return [...oldData, { courseId, status: "مسجل" }];
      });
      
      // إجبار إعادة تحميل البيانات من الخادم
      setTimeout(() => {
        refreshEnrollmentStatus();
      }, 500);
    },
    onError: (error: Error) => {
      console.error('خطأ في التسجيل:', error);
      
      toast({
        title: "فشل التسجيل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // معالجة طلب التسجيل
  const handleEnroll = async (course: Course) => {
    if (!user || user.role !== UserRole.STUDENT) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول كمتدرب للتسجيل في الدورة",
        variant: "destructive",
      });
      return;
    }

    if (isEnrolled(course.id)) {
      toast({
        title: "تنبيه",
        description: "أنت مسجل بالفعل في هذه الدورة",
        variant: "destructive",
      });
      return;
    }

    if (!isAvailableForEnrollment(course)) {
      toast({
        title: "تنبيه",
        description: `لا يمكن التسجيل في هذه الدورة. الدورة ${course.status}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync(course.id);
    } catch (error) {
      // تم معالجة الخطأ في onError
    }
  };

  // تصفية الدورات حسب المنطقة والبحث
  const filteredCourses = courses.filter(course => {
    const matchesRegion = !selectedRegion || course.region === selectedRegion;
    const matchesSearch = !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // عرض شاشة التحميل
  if (isCoursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل الدورات المتاحة...</p>
      </div>
    );
  }

  // استخراج المناطق المتاحة للتصفية
  const regions = Array.from(new Set(courses.map(course => course.region))).filter(Boolean);

  // تحديد ما إذا كان يجب عرض زر التحديث
  const showRefreshButton = user?.role === UserRole.STUDENT;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* رأس الصفحة */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الدورات التدريبية المتاحة</h1>
        <p className="text-muted-foreground">اكتشف الدورات المتاحة وسجل في الدورات التي تناسبك</p>
        
        {/* معلومات التسجيل للمتدرب */}
        {showRefreshButton && (
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="outline" className="text-sm px-3 py-1.5">
              <span>دوراتي المسجلة: {enrollments?.length || 0}</span>
            </Badge>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshEnrollmentStatus} 
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>جاري التحديث...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>تحديث حالة التسجيل</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* خيارات التصفية */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="اختر المنطقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">جميع المناطق</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="ابحث عن دورة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* عرض رسالة عندما لا توجد دورات */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 px-4 border rounded-lg bg-background">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">لا توجد دورات متاحة</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            لم يتم العثور على دورات تطابق معايير البحث. جرب تعديل البحث أو اختيار منطقة مختلفة.
          </p>
        </div>
      ) : (
        /* قائمة الدورات */
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            // التحقق من حالة التسجيل للدورة الحالية
            const enrolled = isEnrolled(course.id);
            
            // تحديد مظهر الزر بناءً على حالة التسجيل
            let buttonVariant: "default" | "secondary" | "outline" = "default";
            if (enrolled) buttonVariant = "secondary";
            if (!isAvailableForEnrollment(course)) buttonVariant = "outline";
            
            return (
              <Card 
                key={course.id} 
                className={`overflow-hidden border-t-4 ${
                  enrolled 
                    ? "border-t-green-500 bg-green-50" 
                    : "border-t-primary bg-white"
                }`}
              >
                {/* علامة مائلة تظهر إذا كان المتدرب مسجل في الدورة */}
                {enrolled && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold shadow-md transform -translate-y-1/2 translate-x-2 rounded-r-md z-10">
                    مسجل
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    
                    <div className="flex gap-2">
                      {/* شارة حالة التسجيل إذا كان المتدرب مسجل */}
                      {enrolled && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          تم التسجيل ✓
                        </Badge>
                      )}
                      
                      {/* شارة حالة الدورة */}
                      <Badge 
                        className="ml-2" 
                        variant={course.status === 'مجدولة' ? 'default' : 'secondary'}
                      >
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                  
                  {/* معلومات المركز التدريبي */}
                  {course.trainingCenter && (
                    <div className="text-sm text-muted-foreground mt-1">
                      المركز التدريبي: {course.trainingCenter.name}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pb-3 pt-1">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>المنطقة: {course.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>المدة: {course.duration} ساعة</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>السعة: {course.capacity} متدرب</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        البدء: {format(new Date(course.start_date), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-3">
                  {/* زر تفاصيل الدورة */}
                  <Link href={`/student/courses/${course.id}`} className="w-full">
                    <Button 
                      className="w-full flex items-center justify-center gap-2" 
                      variant="outline"
                    >
                      <Info className="h-4 w-4" />
                      <span>تفاصيل الدورة</span>
                    </Button>
                  </Link>

                  {/* إذا كان المستخدم مسجل في الدورة، أظهر علامة تم التسجيل بدون زر */}
                  {enrolled ? (
                    <div className="w-full bg-muted p-3 rounded-lg flex items-center justify-center gap-2 text-green-600 font-semibold">
                      <Check className="h-5 w-5" />
                      <span>تم التسجيل في هذه الدورة</span>
                    </div>
                  ) : registerMutation.isPending && registerMutation.variables === course.id ? (
                    <div className="w-full bg-muted p-3 rounded-lg flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري التسجيل...</span>
                    </div>
                  ) : (
                    /* إذا لم يكن مسجل، أظهر زر التسجيل العادي */
                    <Button
                      className="w-full"
                      onClick={() => {
                        // قبل إرسال الطلب، تحقق مباشرة من حالة التسجيل
                        // هذا يمنع إمكانية الضغط على الزر إذا كان المستخدم مسجل بالفعل (حماية إضافية)
                        const checkBeforeEnroll = async () => {
                          // تنفيذ التحقق المباشر قبل التسجيل
                          try {
                            const response = await apiRequest("POST", "/api/courses/check-enrollments", { 
                              courseIds: [course.id] 
                            });
                            
                            if (response.ok) {
                              const statusData = await response.json();
                              
                              // إذا كان المستخدم مسجل بالفعل
                              if (statusData[course.id]) {
                                // تحديث حالة التسجيل محلياً
                                queryClient.setQueryData(["/api/courses/enrollment-status"], (oldData: any) => ({
                                  ...oldData,
                                  [course.id]: true
                                }));
                                
                                // عرض رسالة للمستخدم
                                toast({
                                  title: "تنبيه",
                                  description: "أنت مسجل بالفعل في هذه الدورة",
                                  variant: "destructive",
                                });
                                
                                // تحديث الواجهة
                                setRefreshKey(prev => prev + 1);
                                return;
                              }
                              
                              // إذا لم يكن مسجل، قم بالتسجيل
                              handleEnroll(course);
                            } else {
                              // في حالة حدوث خطأ، تابع بالتسجيل العادي
                              handleEnroll(course);
                            }
                          } catch (error) {
                            // في حالة حدوث خطأ، تابع بالتسجيل العادي
                            handleEnroll(course);
                          }
                        };
                        
                        checkBeforeEnroll();
                      }}
                      disabled={
                        !user ||
                        user.role !== UserRole.STUDENT ||
                        !isAvailableForEnrollment(course)
                      }
                      variant={!isAvailableForEnrollment(course) ? "outline" : "default"}
                    >
                      <span>{getEnrollmentStatusText(course)}</span>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}