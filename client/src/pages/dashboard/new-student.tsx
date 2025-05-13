import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Building,
  User,
  Calendar as CalendarIcon,
  MapPin,
  Hourglass,
  BarChart,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// مؤشر الحالة للتسجيلات
const StatusBadge = ({ status }: { status: string }) => {
  let color;
  let label;

  switch (status?.toLowerCase()) {
    case "completed":
    case "مكتمل":
    case "منتهية":
      color = "bg-green-100 text-green-800 border-green-200";
      label = "مكتمل";
      break;
    case "pending":
    case "قيد التسجيل":
      color = "bg-yellow-100 text-yellow-800 border-yellow-200";
      label = "قيد التسجيل";
      break;
    case "approved":
    case "معتمد":
    case "قيد التنفيذ":
      color = "bg-blue-100 text-blue-800 border-blue-200";
      label = "قيد التنفيذ";
      break;
    case "rejected":
    case "مرفوض":
    case "ملغاة":
      color = "bg-red-100 text-red-800 border-red-200";
      label = "ملغى";
      break;
    default:
      color = "bg-gray-100 text-gray-800 border-gray-200";
      label = status || "غير معروف";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

// بطاقة الدورة
const CourseCard = ({ course, showActions = true }: any) => {
  if (!course) return null;

  // حساب نسبة التقدم
  const progress = course.enrollment.progress || 0;
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-1">{course.course.title}</CardTitle>
            <CardDescription className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              {course.course.trainingCenter?.name || "مركز تدريب"}
            </CardDescription>
          </div>
          <StatusBadge status={course.enrollment.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 ml-1" />
              {course.course.duration} ساعة تدريبية
            </span>
            <span className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 ml-1" />
              {course.course.trainingCenter?.city || "الرياض"}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>مستوى التقدم</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 ml-1 text-gray-400" />
              <span>تاريخ التسجيل:</span>
            </div>
            <div className="text-left">{formatDate(course.enrollment.date)}</div>
            
            {course.enrollment.completionDate && (
              <>
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 ml-1 text-gray-400" />
                  <span>تاريخ الإكمال:</span>
                </div>
                <div className="text-left">{formatDate(course.enrollment.completionDate)}</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="pt-0 pb-3 flex justify-between">
          <Link 
            href={`/courses/${course.course.id}`} 
            className={buttonVariants({ 
              variant: "outline", 
              size: "sm", 
              className: "text-xs"
            })}
          >
            تفاصيل الدورة
          </Link>
          
          {course.certificate && (
            <Link 
              href={`/certificates/${course.certificate.id}`} 
              className={buttonVariants({ 
                variant: "default", 
                size: "sm", 
                className: "text-xs bg-gradient-to-r from-emerald-600 to-teal-600"
              })}
            >
              <Award className="h-3 w-3 ml-1" />
              عرض الشهادة
            </Link>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

// بطاقة الإحصائيات
const StatCard = ({ icon: Icon, title, value, description, className = "", bgClass = "" }: { 
  icon: React.ElementType; 
  title: string; 
  value: number | string; 
  description?: string; 
  className?: string;
  bgClass?: string;
}) => (
  <Card className={`relative overflow-hidden transition-all hover:shadow-md ${className}`}>
    <div className={`absolute inset-0 opacity-10 ${bgClass}`} />
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-1 rtl:space-x-reverse">
            <h2 className="text-3xl font-bold">{value}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-full ${bgClass} bg-opacity-10`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// بطاقة الشهادة
const CertificateCard = ({ certificate }: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-1">{certificate.courseName}</CardTitle>
            <CardDescription className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              {certificate.centerName}
            </CardDescription>
          </div>
          <Award className="h-5 w-5 text-amber-500" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm rounded-md bg-amber-50 p-2 border border-amber-100">
            <span className="text-amber-800 font-medium">رقم الشهادة:</span>
            <span className="font-mono text-gray-600">{certificate.number}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 ml-1 text-gray-400" />
              <span>تاريخ الإصدار:</span>
            </div>
            <div className="text-left">{formatDate(certificate.issueDate)}</div>
            
            {certificate.expiryDate && (
              <>
                <div className="flex items-center">
                  <Hourglass className="h-3 w-3 ml-1 text-gray-400" />
                  <span>تاريخ الانتهاء:</span>
                </div>
                <div className="text-left">{formatDate(certificate.expiryDate)}</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3">
        <Link 
          href={`/certificates/${certificate.id}`} 
          className={buttonVariants({ 
            variant: "default", 
            className: "w-full text-sm bg-gradient-to-r from-amber-600 to-orange-600"
          })}
        >
          <Award className="h-4 w-4 ml-2" />
          عرض الشهادة
        </Link>
      </CardFooter>
    </Card>
  );
};

// حالة التحميل
const DashboardSkeleton = () => (
  <div className="space-y-6" dir="rtl">
    <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// مكون الدورة التالية
const NextCourseCard = ({ course }: any) => {
  if (!course) return null;
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };
  
  // عدد الأيام المتبقية
  const daysLeft = () => {
    if (!course.course.startDate) return null;
    
    const start = new Date(course.course.startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "بدأت الدورة";
    return `متبقي ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`;
  };
  
  const remainingDays = daysLeft();
  
  return (
    <Card className="overflow-hidden border-2 border-cyan-100">
      <CardHeader className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white pb-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">الدورة القادمة</h3>
          <CalendarIcon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">{course.course.title}</h4>
            <p className="text-sm text-gray-600 flex items-center">
              <Building className="h-4 w-4 ml-1" />
              {course.course.trainingCenter?.name || "مركز تدريب"}
            </p>
          </div>
          
          <div className="flex items-center justify-between bg-cyan-50 p-2 rounded-md">
            <span className="text-sm text-cyan-800">تاريخ البدء:</span>
            <span className="text-sm font-medium">{formatDate(course.course.startDate)}</span>
          </div>
          
          {remainingDays && (
            <div className="flex items-center justify-center p-2 bg-cyan-100 rounded-md">
              <span className="text-sm font-bold text-cyan-900">{remainingDays}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3">
        <Link 
          href={`/courses/${course.course.id}`} 
          className={buttonVariants({ 
            variant: "default", 
            className: "w-full text-sm bg-cyan-600 hover:bg-cyan-700"
          })}
        >
          عرض تفاصيل الدورة
          <ArrowRight className="h-4 w-4 mr-2" />
        </Link>
      </CardFooter>
    </Card>
  );
};

// مكون البيانات الشخصية
const ProfileCard = ({ student, stats }: any) => {
  if (!student) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 pb-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">البيانات الشخصية</h3>
          <User className="h-5 w-5 text-gray-600" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {student.name?.charAt(0) || "م"}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{student.name || "متدرب"}</h4>
            <p className="text-sm text-gray-600">{student.email || "بريد إلكتروني غير متوفر"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-gray-50 p-2 rounded-md">
            <div className="text-sm text-gray-500">البريد الإلكتروني</div>
            <div className="text-sm font-medium truncate">{student.email || "غير متوفر"}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-md">
            <div className="text-sm text-gray-500">رقم الجوال</div>
            <div className="text-sm font-medium">{student.phone || "غير متوفر"}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-md">
            <div className="text-sm text-gray-500">الدورات المسجلة</div>
            <div className="text-sm font-medium">{stats.totalEnrolled} دورة</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-md">
            <div className="text-sm text-gray-500">الشهادات</div>
            <div className="text-sm font-medium">{stats.certificatesCount} شهادة</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون صفحة الطالب الرئيسية
const NewStudentDashboard: React.FC = () => {
  // حالة عرض المزيد من الشهادات
  const [showMoreCerts, setShowMoreCerts] = useState(false);
  
  // استدعاء بيانات لوحة التحكم
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/student/dashboard"],
    queryFn: async () => {
      try {
        console.log("Fetching new dashboard data...");
        const response = await apiRequest("GET", "/api/student/dashboard");
        
        if (!response.ok) {
          throw new Error(`Error fetching dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Dashboard data received:", data);
        
        // تحويل بنية البيانات من واجهة API القديمة إلى البنية الجديدة
        const formattedData = {
          student: {
            id: data.enrollments[0]?.enrollment.studentId || 0,
            name: "المتدرب",
            email: "",
            phone: "",
            profilePicture: null,
            joinedDate: new Date()
          },
          courses: {
            all: data.enrollments || [],
            active: data.enrollments?.filter(item => 
              item.enrollment.status === 'pending' || 
              item.enrollment.status === 'approved' ||
              item.enrollment.status === 'قيد التنفيذ' ||
              item.enrollment.status === 'قيد التسجيل' ||
              item.enrollment.status === 'معتمد'
            ) || [],
            completed: data.enrollments?.filter(item => 
              item.enrollment.status === 'completed' || 
              item.enrollment.status === 'مكتمل' ||
              item.enrollment.status === 'منتهية'
            ) || []
          },
          certificates: data.enrollments
            ?.filter(e => e.enrollment.certificate)
            ?.map(e => ({
              id: e.enrollment.certificate.id,
              number: e.enrollment.certificate.certificateNumber,
              courseId: e.course.id,
              courseName: e.course.title,
              centerName: e.course.trainingCenter?.name || 'مركز تدريب',
              issueDate: e.enrollment.certificate.issuedAt,
              expiryDate: e.enrollment.certificate.expiresAt
            })) || [],
          stats: {
            totalEnrolled: data.stats.totalEnrolled || 0,
            active: data.stats.active || 0,
            completed: data.stats.completed || 0,
            certificatesCount: data.stats.certificates || 0,
            totalHours: data.enrollments
              ?.filter(item => item.enrollment.status === 'completed' || item.enrollment.status === 'مكتمل')
              ?.reduce((total, item) => total + (item.course.duration || 0), 0) || 0,
            averageProgress: data.enrollments?.length > 0 
              ? Math.round(data.enrollments.reduce((total, item) => {
                  let progress = 0;
                  switch(item.enrollment.status) {
                    case 'pending':
                    case 'قيد التسجيل':
                      progress = 25;
                      break;
                    case 'approved':
                    case 'معتمد':
                    case 'قيد التنفيذ':
                      progress = 50;
                      break;
                    case 'completed':
                    case 'مكتمل':
                    case 'منتهية':
                      progress = 100;
                      break;
                    default:
                      progress = 0;
                  }
                  return total + progress;
                }, 0) / data.enrollments.length) 
              : 0
          },
          nextCourse: data.enrollments
            ?.filter(item => 
              item.enrollment.status === 'pending' || 
              item.enrollment.status === 'approved' ||
              item.enrollment.status === 'قيد التنفيذ' ||
              item.enrollment.status === 'قيد التسجيل'
            )
            ?.sort((a, b) => new Date(a.course.start_date).getTime() - new Date(b.course.start_date).getTime())[0] || null
        };
        
        console.log("Formatted dashboard data:", formattedData);
        return formattedData;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }
    },
  });
  
  // عرض حالة التحميل
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }
  
  // للتأكد من وجود البيانات
  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]" dir="rtl">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">تعذر تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل بيانات لوحة التحكم</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // استخراج البيانات
  const { student, courses, certificates, stats, nextCourse } = dashboardData;
  
  // تحديد عدد الشهادات المعروضة
  const displayedCertificates = showMoreCerts 
    ? certificates 
    : certificates.slice(0, 3);
  
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-gray-500">تاريخ اليوم:</span>
            <span className="text-sm font-medium">
              {format(new Date(), "d MMMM yyyy", { locale: ar })}
            </span>
          </div>
        </div>

        {/* إحصائيات الدورات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={GraduationCap} 
            title="إجمالي الدورات" 
            value={stats.totalEnrolled}
            description=""
            bgClass="bg-cyan-500"
          />
          
          <StatCard 
            icon={BookOpen} 
            title="الدورات النشطة" 
            value={stats.active}
            description=""
            bgClass="bg-emerald-500"
          />
          
          <StatCard 
            icon={CheckCircle} 
            title="الدورات المكتملة" 
            value={stats.completed}
            description=""
            bgClass="bg-blue-500"
          />
          
          <StatCard 
            icon={Award} 
            title="الشهادات" 
            value={stats.certificatesCount}
            description=""
            bgClass="bg-amber-500"
          />
        </div>

        {/* قسم المعلومات الرئيسية */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* العمود الأول - البيانات الشخصية */}
          <div className="space-y-6">
            <ProfileCard student={student} stats={stats} />
            
            {nextCourse && (
              <NextCourseCard course={nextCourse} />
            )}
            
            {/* إحصائيات إضافية */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 pb-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">إحصائيات التدريب</h3>
                  <BarChart className="h-5 w-5 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-md flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">ساعات التدريب المنجزة</span>
                    <span className="font-bold text-lg text-slate-900">{stats.totalHours} ساعة</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">متوسط الإنجاز</span>
                    <div className="flex items-center">
                      <span className="font-bold text-lg text-slate-900">{stats.averageProgress}%</span>
                      <Progress value={stats.averageProgress} className="w-24 h-2 mr-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* العمودين الآخرين - بيانات الدورات والشهادات */}
          <div className="lg:col-span-2 space-y-6">
            {/* تبويبات الدورات */}
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>الدورات التدريبية</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="all">جميع الدورات</TabsTrigger>
                    <TabsTrigger value="active">الدورات النشطة</TabsTrigger>
                    <TabsTrigger value="completed">الدورات المكتملة</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {courses.all.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.all.map((course: any) => (
                          <CourseCard key={course.enrollment.id} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="flex flex-col items-center">
                          <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد دورات مسجلة</h3>
                          <p className="text-sm text-gray-500 mb-4">يمكنك تصفح الدورات المتاحة والتسجيل فيها</p>
                          <Link href="/courses" className={buttonVariants()}>
                            تصفح الدورات
                          </Link>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="active" className="space-y-4">
                    {courses.active.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.active.map((course: any) => (
                          <CourseCard key={course.enrollment.id} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="flex flex-col items-center">
                          <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد دورات نشطة</h3>
                          <p className="text-sm text-gray-500 mb-4">ليس لديك أي دورات نشطة حالياً</p>
                          <Link href="/courses" className={buttonVariants()}>
                            تصفح الدورات المتاحة
                          </Link>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="space-y-4">
                    {courses.completed.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.completed.map((course: any) => (
                          <CourseCard key={course.enrollment.id} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-12 w-12 text-gray-400 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد دورات مكتملة</h3>
                          <p className="text-sm text-gray-500">لم تكمل أي دورة حتى الآن</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* قسم الشهادات */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>الشهادات</CardTitle>
                  <Badge variant="outline" className="font-medium">
                    {certificates.length} شهادة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {certificates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedCertificates.map((cert: any) => (
                        <CertificateCard key={cert.id} certificate={cert} />
                      ))}
                    </div>
                    
                    {certificates.length > 3 && (
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowMoreCerts(!showMoreCerts)}
                        >
                          {showMoreCerts ? (
                            <>
                              <ChevronLeft className="h-4 w-4 ml-1" />
                              عرض أقل
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-4 w-4 ml-1" />
                              عرض المزيد من الشهادات ({certificates.length - 3})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <Award className="h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد شهادات</h3>
                      <p className="text-sm text-gray-500">لم تحصل على أي شهادات حتى الآن</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewStudentDashboard;