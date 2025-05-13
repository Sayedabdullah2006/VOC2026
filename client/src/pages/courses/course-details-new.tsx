import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Course, CourseStatus, type CourseStatusType } from "@shared/schema";
import { UserRole } from "@shared/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, ArrowLeft, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useCallback, useEffect, useState } from "react";

// مكون لمعالجة الأخطاء
function ErrorDisplay({ error, onBack }: { error: any, onBack?: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="text-center">
        <h2 className="text-lg font-medium mb-2">حدث خطأ</h2>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
        </p>
        <Link href="/student/courses">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للقائمة
          </Button>
        </Link>
      </div>
    </div>
  );
}

// مكون للتحميل
function Loading() {
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="text-center">جاري التحميل...</div>
    </div>
  );
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // استعلام عن تفاصيل الدورة
  const { data: course, isLoading: isLoadingCourse, error } = useQuery<Course>({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        console.log('Course details response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error data:', errorData);
          throw new Error(errorData.message || 'فشل في جلب تفاصيل الدورة');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
      }
    },
    retry: 1, // حاول مرة واحدة فقط إذا فشل الطلب
  });

  // استعلام عن حالة التسجيل (للمتدربين فقط)
  const { data: enrolledCourses = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["/api/courses/enrolled"],
    queryFn: async () => {
      if (!user || user.role !== 'STUDENT') {
        console.log('User is not a student, not fetching enrollments');
        return [];
      }
      
      console.log('Fetching enrollments for course detail, user:', user.id);
      try {
        const response = await apiRequest("GET", "/api/courses/enrolled");
        if (!response.ok) {
          console.error('Failed to fetch enrollments:', await response.text());
          return [];
        }
        
        const data = await response.json();
        console.log('Detail page: Fetched enrollments data:', data);
        
        // استخراج رقم الدورة الحالية
        const courseId = parseInt(id || '0');
        console.log('Current course ID being viewed:', courseId);
        
        return data;
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }
    },
    enabled: !!user && user.role === 'STUDENT',
    // تحديث البيانات كل 1 ثانية عند الحاجة
    refetchInterval: 1000,
    // التحديث تلقائيًا عندما تستعيد النافذة التركيز
    refetchOnWindowFocus: true
  });
  
  // التحقق المباشر من حالة التسجيل باستخدام نقطة نهاية محددة
  const checkRegistrationStatus = useCallback(async () => {
    if (!user || user.role !== UserRole.STUDENT || !id) return;
    
    try {
      console.log(`Detail page: Checking enrollment status directly for course ${id}`);
      const response = await apiRequest("GET", `/api/courses/${id}/registration-status`);
      if (!response.ok) {
        throw new Error('Failed to check registration status');
      }
      
      const data = await response.json();
      console.log('Detail page: Direct registration status check result:', data);
      
      // قم بتعديل حالة التسجيل استنادًا إلى النتيجة
      return data.isRegistered;
    } catch (error) {
      console.error('Detail page: Error checking registration status:', error);
      return false;
    }
  }, [user, id]);
  
  // حالة التسجيل للعرض
  const [directRegistrationStatus, setDirectRegistrationStatus] = useState<{ isRegistered: boolean, checked: boolean }>({ 
    isRegistered: false, 
    checked: false 
  });
  
  // تحديد متغير الحالة
  const isLoadingStatus = isEnrollmentsLoading || (!directRegistrationStatus.checked && !!user);
  
  // استخدام التحقق المباشر عند تحميل الصفحة
  useEffect(() => {
    if (!isEnrollmentsLoading && course && user?.role === UserRole.STUDENT) {
      checkRegistrationStatus();
    }
  }, [checkRegistrationStatus, isEnrollmentsLoading, course, user?.role]);

  // معرفة ما إذا كان المتدرب مسجل في هذه الدورة
  const isEnrolled = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      console.log('Detail page: No enrollments found for user');
      return false;
    }
    
    const courseId = parseInt(id || '0');
    // تحقق مباشر من البيانات
    const enrolled = enrolledCourses.some((enrollment: any) => {
      const match = enrollment.courseId === courseId;
      if (match) console.log('Detail page: Found enrollment match:', enrollment);
      return match;
    });
    
    console.log(`Detail page: Checking if enrolled in course ${courseId}:`, enrolled, 
      'Enrollments:', enrolledCourses.map((e: any) => e.courseId));
    
    return enrolled;
  }, [enrolledCourses, id]);
  
  // استخدام التحقق المباشر مع تخزين النتيجة
  useEffect(() => {
    async function checkAndUpdateStatus() {
      if (!user || user.role !== UserRole.STUDENT || !id) return;
      
      try {
        const isDirectlyRegistered = await checkRegistrationStatus();
        setDirectRegistrationStatus({ 
          isRegistered: isDirectlyRegistered || false, 
          checked: true 
        });
        console.log('Updated direct registration status:', isDirectlyRegistered);
      } catch (error) {
        console.error('Error in direct status check effect:', error);
      }
    }
    
    if (!directRegistrationStatus.checked && !isEnrollmentsLoading && course) {
      checkAndUpdateStatus();
    }
  }, [user, id, course, isEnrollmentsLoading, checkRegistrationStatus, directRegistrationStatus.checked]);
  
  // استخدم كلا من الوضعين للتحقق
  const registrationStatus = { 
    isRegistered: directRegistrationStatus.checked 
      ? directRegistrationStatus.isRegistered 
      : isEnrolled 
  };
  
  // تم تعريف متغير isLoadingStatus مسبقاً في السطر 105

  const queryClient = useQueryClient();
  
  // تعريف الطلب للتسجيل في الدورة باستخدام useMutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/courses/${id}/register`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل التسجيل في الدورة");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الدورة بنجاح. يمكنك متابعة الدورة من لوحة التحكم الخاصة بك",
      });
      
      console.log('Registration successful, updating cache with data:', data);
      
      // 1. تحديث ذاكرة التخزين المؤقت للدورات المسجلة
      queryClient.invalidateQueries({ queryKey: ["/api/courses/enrolled"] });
      
      // 2. تحديث العرض فورا بإضافة الدورة المسجلة إلى الذاكرة المؤقتة
      const previousData = queryClient.getQueryData(["/api/courses/enrolled"]) || [];
      
      // استخدام وظيفة setQueryData لتحديث حالة الدورات المسجلة فورًا
      queryClient.setQueryData(["/api/courses/enrolled"], (oldData: any) => {
        // تأكد من أن البيانات السابقة موجودة
        if (!oldData) return [data.enrollment];
        
        // أضف التسجيل الجديد إلى القائمة
        // تحقق أولاً من عدم وجود التسجيل بالفعل (لتجنب التكرار)
        const exists = oldData.some((item: any) => item.courseId === data.enrollment.courseId);
        if (exists) return oldData;
        
        return [...oldData, {
          id: data.enrollment.id,
          courseId: data.enrollment.courseId,
          studentId: data.enrollment.studentId,
          enrollmentDate: data.enrollment.enrollmentDate,
          status: data.enrollment.status
        }];
      });
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل التسجيل في الدورة. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  });
  
  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول للتسجيل في هذه الدورة",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (isEnrolled) {
      toast({
        title: "تنبيه",
        description: "أنت مسجل بالفعل في هذه الدورة",
      });
      return;
    }
    
    try {
      await registerMutation.mutateAsync();
    } catch (error) {
      // الخطأ سيتم معالجته في onError للـ useMutation
      console.error('Error in handleRegister:', error);
    }
  };

  // معالجة حالات الخطأ والتحميل
  if (error) {
    console.error('Error in course details query:', error);
    return <ErrorDisplay error={error} />;
  }

  if (isLoadingCourse) {
    return <Loading />;
  }

  if (!course) {
    return <ErrorDisplay error={new Error("لم يتم العثور على الدورة")} />;
  }
  
  // التحقق من سلامة بيانات الدورة
  if (!course.title || !course.start_date || !course.end_date) {
    console.error('Invalid course data:', course);
    return <ErrorDisplay error={new Error("بيانات الدورة غير مكتملة")} />;
  }

  // للتأكد من أن البيانات متاحة وصحيحة قبل عرضها
  console.log('Final course data being rendered:', course);
  
  // عرض تفاصيل الدورة
  return (
    <div className="bg-gray-50 min-h-screen" dir="rtl">
      {/* Hero section with course title */}
      <div className="bg-gradient-to-l from-cyan-700 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-3">
              <Link href="/student/courses">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة للقائمة
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(course.start_date), 'dd MMMM yyyy', { locale: ar })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration} ساعة</span>
                  </div>
                  {course.location && (
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span>{course.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {user?.role === 'STUDENT' && (
                <div className="flex-shrink-0">
                  {registrationStatus?.isRegistered ? (
                    <div className="bg-green-500/20 border border-green-200 py-3 px-6 rounded-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      <span className="font-medium">أنت مسجل في هذه الدورة</span>
                    </div>
                  ) : (
                    course.status === CourseStatus.SCHEDULED && (
                      <Button 
                        onClick={handleRegister} 
                        disabled={isLoadingStatus}
                        size="lg"
                        className="bg-white text-cyan-700 hover:bg-white/90"
                      >
                        {isLoadingStatus ? "جاري التحقق..." : "التسجيل في الدورة"}
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left column - Course details */}
            <div className="md:col-span-2 space-y-8">
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-l from-cyan-500 to-teal-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl">وصف الدورة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {course.description || "لا يوجد وصف متاح لهذه الدورة."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-l from-purple-500 to-indigo-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl">أهداف الدورة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 mb-4">سيتمكن المتدربون بعد إتمام هذه الدورة من:</p>
                  <ul className="space-y-3 text-gray-700 list-disc pr-6">
                    <li>تطبيق معايير السلامة المرورية الحديثة أثناء القيادة</li>
                    <li>التعامل مع المواقف الطارئة على الطريق بكفاءة واحترافية</li>
                    <li>تحديد المخاطر المحتملة ومنع وقوعها قبل حدوثها</li>
                    <li>تطبيق التقنيات الحديثة في مجال القيادة الآمنة</li>
                    <li>الالتزام بالأنظمة واللوائح الجديدة للنقل والمرور</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-l from-amber-500 to-orange-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl">معلومات إضافية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">الجدول الزمني</h4>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <div><strong>البداية:</strong> {format(new Date(course.start_date), 'dd MMMM yyyy', { locale: ar })}</div>
                          <div><strong>النهاية:</strong> {format(new Date(course.end_date), 'dd MMMM yyyy', { locale: ar })}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">حالة الدورة</h4>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          course.status === CourseStatus.SCHEDULED ? 'bg-blue-100 text-blue-800' :
                          course.status === CourseStatus.IN_PROGRESS ? 'bg-green-100 text-green-800' :
                          course.status === CourseStatus.COMPLETED ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.status}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">عدد المتدربين</h4>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span>الحد الأقصى: {course.capacity} متدرب</span>
                      </div>
                    </div>
                    {course.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">موقع الدورة</h4>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <span>{course.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {registrationStatus?.isRegistered && (
                <Card className="border-0 bg-green-50 shadow-sm overflow-hidden">
                  <div className="h-2 bg-green-500"></div>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">أنت مسجل في هذه الدورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-green-700 text-sm">
                      يمكنك متابعة تفاصيل الدورة وموادها التدريبية من خلال لوحة التحكم الخاصة بك.
                    </p>
                    <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                      <Link href="/student/dashboard">
                        الذهاب إلى لوحة التحكم
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right column - Course curriculum */}
            <div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl">محتوى الدورة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs">1</div>
                    <span>أساسيات القيادة الآمنة وقواعد المرور</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs">2</div>
                    <span>تقنيات القيادة الاحترافية</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs">3</div>
                    <span>حالات الطوارئ والإسعافات الأولية</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs">4</div>
                    <span>القوانين واللوائح المرورية الحديثة</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}