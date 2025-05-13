import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Course as SchemaCourse, CourseStatus, type CourseStatusType } from "@shared/schema";
import { UserRole } from "@shared/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin, ArrowLeft, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useCallback, useEffect, useState } from "react";

// واجهة لمعلومات مركز التدريب
interface TrainingCenterInfo {
  id: number;
  name: string;
  region: string;
  city: string;
  contactPhone: string;
  email: string;
}

// تعديل واجهة الدورة لتشمل معلومات مركز التدريب
interface Course extends SchemaCourse {
  trainingCenter?: TrainingCenterInfo;
}

// مكون لعرض الأخطاء
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

// دالة تنسيق التاريخ بشكل آمن
function formatSafeDate(date: any): string {
  // إذا كان التاريخ فارغًا أو كائنًا فارغًا، ارجع تاريخًا افتراضيًا
  if (!date || (typeof date === 'object' && Object.keys(date).length === 0)) {
    return format(new Date(), 'dd MMMM yyyy', { locale: ar });
  }
  
  // محاولة تحويل التاريخ بأمان
  try {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ar });
  } catch (e) {
    console.error('Error formatting date:', e);
    return format(new Date(), 'dd MMMM yyyy', { locale: ar });
  }
}

export default function StudentCourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // حالة محلية لعرض التسجيل
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

  // استعلام عن تفاصيل الدورة
  const { 
    data: course, 
    isLoading: isLoadingCourse, 
    error
  } = useQuery<Course>({
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

  // التحقق من حالة التسجيل للطالب مباشرة
  useEffect(() => {
    async function checkRegistration() {
      if (!user || user.role !== UserRole.STUDENT || !id) {
        setIsCheckingRegistration(false);
        return;
      }
      
      try {
        setIsCheckingRegistration(true);
        const response = await apiRequest("GET", `/api/courses/${id}/registration-status`);
        if (!response.ok) {
          console.error('Failed to check registration status');
          setIsRegistered(false);
        } else {
          const data = await response.json();
          console.log('Registration status check result:', data);
          setIsRegistered(data.isRegistered);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        setIsRegistered(false);
      } finally {
        setIsCheckingRegistration(false);
      }
    }
    
    if (course) {
      checkRegistration();
    }
  }, [user, id, course]);

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
    onSuccess: (data) => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الدورة بنجاح. يمكنك متابعة الدورة من لوحة التحكم الخاصة بك",
      });
      
      // تحديث حالة التسجيل في الواجهة
      setIsRegistered(true);
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل التسجيل في الدورة. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  });
  
  // التسجيل في الدورة
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
    
    if (isRegistered) {
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
  
  // التحقق من سلامة بيانات الدورة وإضافة محاولة إصلاح البيانات
  if (!course) {
    console.error('Invalid course data: Course is undefined');
    return <ErrorDisplay error={new Error("لم يتم العثور على بيانات الدورة")} />;
  }
  
  // طباعة البيانات كاملة للتشخيص
  console.log('Complete course data:', JSON.stringify(course, null, 2));
  
  // التحقق من وجود العنوان
  if (!course.title) {
    console.error('Invalid course data: Title is missing', course);
    return <ErrorDisplay error={new Error("بيانات الدورة غير مكتملة")} />;
  }
  
  // التأكد من أن كل البيانات موجودة مع قيم افتراضية
  const sanitizedCourse = {
    ...course,
    title: course.title || 'دورة تدريبية',
    description: course.description || 'لا يوجد وصف',
    duration: course.duration || 0,
    capacity: course.capacity || 0,
    start_date: course.start_date || {},
    end_date: course.end_date || {},
    status: course.status || 'مجدولة',
    location: course.location || 'غير محدد',
    trainingCenter: course.trainingCenter || {
      id: 0,
      name: 'غير متوفر',
      region: 'غير متوفر',
      city: 'غير متوفر',
      contactPhone: 'غير متوفر',
      email: 'غير متوفر'
    }
  };
  
  // تسجيل نوع البيانات للتحقق
  console.log('Start date type:', typeof sanitizedCourse.start_date, 'Value:', sanitizedCourse.start_date);
  console.log('End date type:', typeof sanitizedCourse.end_date, 'Value:', sanitizedCourse.end_date);
  
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{sanitizedCourse.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-white/90">
                    <Calendar className="h-5 w-5" />
                    <span>{formatSafeDate(sanitizedCourse.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="h-5 w-5" />
                    <span>{sanitizedCourse.duration} ساعة</span>
                  </div>
                  {sanitizedCourse.location && (
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span>{sanitizedCourse.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {user?.role === 'STUDENT' && (
                <div className="flex-shrink-0">
                  {isRegistered ? (
                    <div className="bg-green-500/20 border border-green-200 py-3 px-6 rounded-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      <span className="font-medium">أنت مسجل في هذه الدورة</span>
                    </div>
                  ) : (
                    course.status === CourseStatus.SCHEDULED && (
                      <Button 
                        onClick={handleRegister} 
                        disabled={isCheckingRegistration || registerMutation.isPending}
                        size="lg"
                        className="bg-white text-cyan-700 hover:bg-white/90"
                      >
                        {isCheckingRegistration 
                          ? "جاري التحقق..." 
                          : registerMutation.isPending 
                            ? "جاري التسجيل..." 
                            : "التسجيل في الدورة"
                        }
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
                    {sanitizedCourse.description || "لا يوجد وصف متاح لهذه الدورة."}
                  </p>
                </CardContent>
              </Card>

              {/* أهداف الدورة - تمت إزالتها مؤقتاً لتطابق البيانات المعروضة مع البيانات المدخلة */}

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
                          <div><strong>البداية:</strong> {formatSafeDate(sanitizedCourse.start_date)}</div>
                          <div><strong>النهاية:</strong> {formatSafeDate(sanitizedCourse.end_date)}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">حالة الدورة</h4>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sanitizedCourse.status === CourseStatus.SCHEDULED ? 'bg-blue-100 text-blue-800' :
                          sanitizedCourse.status === CourseStatus.IN_PROGRESS ? 'bg-green-100 text-green-800' :
                          sanitizedCourse.status === CourseStatus.COMPLETED ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sanitizedCourse.status}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">عدد المتدربين</h4>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span>الحد الأقصى: {sanitizedCourse.capacity} متدرب</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">معلومات مركز التدريب</h4>
                      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <div><strong>اسم المركز:</strong> {sanitizedCourse.trainingCenter?.name || 'غير متوفر'}</div>
                        <div><strong>المنطقة:</strong> {sanitizedCourse.trainingCenter?.region || 'غير متوفر'}</div>
                        <div><strong>المدينة:</strong> {sanitizedCourse.trainingCenter?.city || 'غير متوفر'}</div>
                        {sanitizedCourse.trainingCenter?.contactPhone && (
                          <div><strong>رقم التواصل:</strong> {sanitizedCourse.trainingCenter.contactPhone}</div>
                        )}
                      </div>
                    </div>
                    {sanitizedCourse.location && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">موقع الدورة</h4>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <span>{sanitizedCourse.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {isRegistered && (
                <Card className="border-0 bg-green-50 shadow-sm overflow-hidden">
                  <div className="h-2 bg-green-500"></div>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">أنت مسجل في هذه الدورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-green-700">
                      تم تسجيلك بنجاح في هذه الدورة. يمكنك متابعة تفاصيل التدريب من خلال لوحة التحكم الخاصة بك.
                    </p>
                    <Link href="/student/dashboard">
                      <Button className="mt-2 bg-green-600 hover:bg-green-700">
                        الذهاب إلى لوحة التحكم
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right column - Training Center Info */}
            <div>
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-l from-teal-500 to-cyan-500"></div>
                <CardHeader>
                  <CardTitle>مركز التدريب</CardTitle>
                  <CardDescription>معلومات عن مركز التدريب المقدم للدورة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{sanitizedCourse.trainingCenter?.name || 'مركز تدريب'}</h4>
                      <p className="text-sm text-muted-foreground">{sanitizedCourse.trainingCenter?.region || 'المنطقة'} - {sanitizedCourse.trainingCenter?.city || 'المدينة'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <h5 className="text-sm font-medium mb-2">تفاصيل الاتصال</h5>
                    {sanitizedCourse.trainingCenter?.contactPhone && (
                      <div className="text-sm mb-1.5 flex justify-between">
                        <span className="text-gray-500">الهاتف:</span>
                        <span dir="ltr">{sanitizedCourse.trainingCenter.contactPhone}</span>
                      </div>
                    )}
                    {sanitizedCourse.trainingCenter?.email && (
                      <div className="text-sm mb-1.5 flex justify-between">
                        <span className="text-gray-500">البريد:</span>
                        <span dir="ltr">{sanitizedCourse.trainingCenter.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm overflow-hidden mt-6">
                <div className="h-2 bg-gradient-to-l from-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle>خطوات التسجيل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">اطلع على تفاصيل الدورة</h4>
                        <p className="text-sm text-gray-500">تأكد من ملاءمة محتوى الدورة لاحتياجاتك</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">التسجيل في الدورة</h4>
                        <p className="text-sm text-gray-500">انقر على زر "التسجيل في الدورة" أعلاه</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">متابعة حالة التسجيل</h4>
                        <p className="text-sm text-gray-500">راقب حالة تسجيلك من خلال لوحة التحكم</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">حضور الدورة</h4>
                        <p className="text-sm text-gray-500">احضر الدورة في الموعد والمكان المحددين</p>
                      </div>
                    </div>
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