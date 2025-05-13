import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2,
  AlertCircle 
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ترجمة حالات التسجيل
const enrollmentStatusLabels = {
  'pending': 'قيد التسجيل',
  'approved': 'معتمد',
  'rejected': 'مرفوض',
  'completed': 'مكتمل',
  'قيد التسجيل': 'قيد التسجيل',
  'مكتملة التسجيل': 'مكتملة التسجيل',
  'قيد التنفيذ': 'قيد التنفيذ',
  'معلقة': 'معلقة',
  'منتهية': 'منتهية',
  'مكتمل': 'مكتمل',
  'ملغاة': 'ملغاة'
};

// ألوان حالات التسجيل
const statusColors = {
  'قيد التسجيل': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'مكتملة التسجيل': 'bg-blue-100 text-blue-800 border-blue-300',
  'قيد التنفيذ': 'bg-green-100 text-green-800 border-green-300',
  'معتمد': 'bg-green-100 text-green-800 border-green-300',
  'معلقة': 'bg-orange-100 text-orange-800 border-orange-300',
  'منتهية': 'bg-slate-100 text-slate-800 border-slate-300',
  'مكتمل': 'bg-green-100 text-green-800 border-green-300',
  'ملغاة': 'bg-red-100 text-red-800 border-red-300',
  'مرفوض': 'bg-red-100 text-red-800 border-red-300',
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'approved': 'bg-green-100 text-green-800 border-green-300',
  'rejected': 'bg-red-100 text-red-800 border-red-300',
  'completed': 'bg-green-100 text-green-800 border-green-300'
} as const;

// الحصول على قيمة التقدم بناءً على الحالة
const getProgressValue = (status: string): number => {
  status = status?.toLowerCase() || '';
  
  if (status.includes('pending') || status.includes('قيد التسجيل')) {
    return 25;
  } else if (status.includes('approved') || status.includes('معتمد') || status.includes('قيد التنفيذ')) {
    return 50;
  } else if (status.includes('completed') || status.includes('مكتمل') || status.includes('منتهية')) {
    return 100;
  } else {
    return 0;
  }
};

const CourseCard = ({ course, enrollment }: any) => {
  if (!course) return null;
  
  const status = enrollment?.status || 'غير مسجل';
  const statusClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300';
  const progressValue = getProgressValue(status);
  
  return (
    <Card className="overflow-hidden border-2 border-muted">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-500 h-2"></div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-cyan-900">{course.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {course.trainingCenter?.name || "مركز تدريب"}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs border ${statusClass}`}>
              {status}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-y-2 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <span>البداية: {course.start_date ? format(new Date(course.start_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <span>النهاية: {course.end_date ? format(new Date(course.end_date), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-cyan-600" />
            <span>المدة: {course.duration} ساعة</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-cyan-600" />
            <span>السعة: {course.capacity} متدرب</span>
          </div>
        </div>
        
        {enrollment && (
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>التقدم في الدورة</span>
              <span className="font-medium">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2 justify-between">
        <Link href={`/courses/${course.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
          تفاصيل الدورة
        </Link>
        {enrollment?.certificate ? (
          <Link href={`/certificates/view/${enrollment.certificate.id}`} className={buttonVariants({ size: "sm", className: "w-full bg-gradient-to-r from-teal-500 to-green-500 text-white" })}>
            <Award className="mr-1 h-4 w-4" />
            عرض الشهادة
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  );
};

const EnrollmentsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="h-2 bg-muted"></div>
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-y-2 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full mt-4" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const StatCard = ({ icon: Icon, title, value, description, color = "bg-cyan-100 text-cyan-800" }: any) => (
  <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
    <div className={`h-1 ${color}`}></div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StudentDashboard: React.FC = () => {
  // جلب بيانات لوحة تحكم المتدرب - مقاربة تستخدم واجهة API جديدة ومحسنة
  // تستخرج هذه الواجهة البيانات المخصصة للمستخدم المسجل دخوله فقط
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/student/dashboard"],
    queryFn: async () => {
      try {
        console.log("Fetching student dashboard data...");
        // استخدام نقطة نهاية API المحسنة التي تعيد البيانات الخاصة بالمستخدم الحالي فقط
        const response = await apiRequest("GET", "/api/student/dashboard");
        if (!response.ok) {
          console.error("Error fetching dashboard data:", response.status);
          return {
            enrollments: [],
            stats: {
              totalEnrolled: 0,
              active: 0,
              completed: 0,
              certificates: 0
            }
          };
        }
        const data = await response.json();
        console.log("Student dashboard data received:", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        return {
          enrollments: [],
          stats: {
            totalEnrolled: 0,
            active: 0,
            completed: 0,
            certificates: 0
          }
        };
      }
    }
  });

  // استخراج البيانات من الاستجابة الجديدة - البيانات التي تأتي خاصة بالمستخدم المسجل دخوله فقط
  const enrollments = dashboardData?.enrollments || [];
  const stats = dashboardData?.stats || {
    totalEnrolled: 0,
    active: 0,
    completed: 0,
    certificatesCount: 0
  };
  
  // معالجة البيانات للعرض
  const processedEnrollments = React.useMemo(() => {
    console.log("Processing enrollments from dashboard data:", enrollments);
    return enrollments.map((item: any) => ({
      id: item.enrollment.id,
      status: item.enrollment.status,
      date: item.enrollment.date,
      progress: item.enrollment.progress,
      course: item.course,
      certificate: item.certificate
    }));
  }, [enrollments]);
  
  // تقسيم الدورات حسب الحالة
  const completedEnrollments = processedEnrollments.filter((e: any) => {
    const status = (e.status || '').toLowerCase();
    return status.includes('completed') || status.includes('مكتمل') || status.includes('منتهية');
  });
  
  const activeEnrollments = processedEnrollments.filter((e: any) => {
    const status = (e.status || '').toLowerCase();
    return status.includes('approved') || status.includes('pending') || 
           status.includes('قيد التنفيذ') || status.includes('قيد التسجيل') || 
           status.includes('معتمد');
  });
  
  // إضافة متوسط التقدم إلى الإحصائيات
  const statsWithProgress = {
    ...stats,
    averageProgress: processedEnrollments.length > 0
      ? Math.round(processedEnrollments.reduce((acc: number, e: any) => 
          acc + getProgressValue(e.status || ''), 0) / processedEnrollments.length)
      : 0
  };
  
  console.log("Processed enrollments:", processedEnrollments.length);
  console.log("Completed enrollments:", completedEnrollments.length);
  console.log("Active enrollments:", activeEnrollments.length);
  console.log("Final dashboard stats:", statsWithProgress);
  
  console.log("Dashboard stats:", stats);

  // عرض صفحة التحميل
  if (isDashboardLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6" dir="rtl">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <EnrollmentsSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>

        {/* إحصائيات الدورات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={GraduationCap} 
            title="إجمالي الدورات المسجلة" 
            value={statsWithProgress.totalEnrolled}
            description={`${statsWithProgress.completed} دورة مكتملة`}
            color="bg-cyan-100 text-cyan-800"
          />
          
          <StatCard 
            icon={BookOpen} 
            title="الدورات النشطة" 
            value={statsWithProgress.active}
            description="دورات قيد التنفيذ"
            color="bg-emerald-100 text-emerald-800"
          />
          
          <StatCard 
            icon={CheckCircle2} 
            title="الدورات المكتملة" 
            value={statsWithProgress.completed}
            description="دورات أنهيت بنجاح"
            color="bg-blue-100 text-blue-800"
          />
          
          <StatCard 
            icon={Award} 
            title="الشهادات" 
            value={statsWithProgress.certificatesCount}
            description="الشهادات الحاصل عليها"
            color="bg-amber-100 text-amber-800"
          />
        </div>

        {/* تبويبات الدورات */}
        <Tabs defaultValue="enrolled" className="w-full space-y-6">
          <TabsList dir="rtl" className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="enrolled">الدورات المسجلة</TabsTrigger>
            <TabsTrigger value="active">الدورات النشطة</TabsTrigger>
            <TabsTrigger value="completed">الدورات المكتملة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled" className="space-y-4">
            {processedEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedEnrollments.map((enrollment: any) => (
                  <CourseCard 
                    key={enrollment.id} 
                    course={enrollment.course} 
                    enrollment={enrollment} 
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">لم يتم التسجيل في أي دورة بعد</p>
                <Link href="/courses" className={buttonVariants({ className: "mt-4" })}>
                  تصفح الدورات المتاحة
                </Link>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEnrollments.map((enrollment: any) => (
                  <CourseCard 
                    key={enrollment.id} 
                    course={enrollment.course} 
                    enrollment={enrollment} 
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">لا توجد دورات نشطة حاليًا</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEnrollments.map((enrollment: any) => (
                  <CourseCard 
                    key={enrollment.id} 
                    course={enrollment.course} 
                    enrollment={enrollment} 
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground">لم تكمل أي دورة بعد</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;