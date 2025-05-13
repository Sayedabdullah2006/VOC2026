import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
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
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// مكون مؤشر حالة الدورة
const StatusBadge = ({ status }: { status: string }) => {
  let color = "bg-gray-100 text-gray-800 border-gray-200";
  let label = status || "غير معروف";

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
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

// بطاقة الإحصائيات
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  bgClass = "bg-blue-500" 
}: { 
  icon: React.ElementType;
  title: string;
  value: number | string;
  description?: string;
  bgClass?: string;
}) => (
  <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all">
    <div className={`absolute top-0 left-0 w-1 h-full ${bgClass}`} />
    <CardContent className="p-5">
      <div className="flex justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`h-9 w-9 rounded-md flex items-center justify-center bg-opacity-10 ${bgClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// بطاقة الدورة
const CourseCard = ({ course }: { course: any }) => {
  if (!course) return null;
  
  // حساب نسبة التقدم بناءً على الحالة
  let progress = 0;
  switch(course.enrollment.status.toLowerCase()) {
    case "pending":
    case "قيد التسجيل":
      progress = 25;
      break;
    case "approved":
    case "معتمد":
    case "قيد التنفيذ":
      progress = 50;
      break;
    case "completed":
    case "مكتمل":
    case "منتهية":
      progress = 100;
      break;
  }
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 border-opacity-50">
      <div className="h-2 bg-gradient-to-l from-blue-500 to-cyan-400" />
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{course.course.title}</CardTitle>
            <CardDescription className="flex items-center text-sm mt-1">
              <Building className="h-4 w-4 ml-1" />
              {course.course.trainingCenter?.name || "مركز تدريب"}
            </CardDescription>
          </div>
          <StatusBadge status={course.enrollment.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              {course.course.duration} ساعة
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 ml-1" />
              {formatDate(course.enrollment.enrollmentDate)}
            </span>
          </div>
          
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">نسبة الإنجاز</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Link 
          href={`/student/courses/${course.course.id}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
        >
          تفاصيل الدورة
        </Link>
        
        {course.enrollment.certificate && (
          <Link
            href={`/student/certificates/view/${course.enrollment.certificate.id}`}
            className={buttonVariants({ variant: "default", size: "sm", className: "bg-green-600 hover:bg-green-700" })}
          >
            <Award className="h-4 w-4 ml-1" />
            الشهادة
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

// حالة التحميل
const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
    
    <Skeleton className="h-[400px] w-full" />
  </div>
);

// حالة الخطأ
const DashboardError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <Card className="p-6">
    <div className="flex flex-col items-center justify-center h-60">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">حدث خطأ أثناء تحميل البيانات</h3>
      <p className="text-center text-muted-foreground mb-4">
        {error.message || "يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني"}
      </p>
      <Button onClick={retry}>إعادة المحاولة</Button>
    </div>
  </Card>
);

// بطاقة الشهادة
const CertificateCard = ({ certificate }: { certificate: any }) => {
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد";
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: ar });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-2 bg-gradient-to-l from-amber-500 to-yellow-400" />
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-base font-bold text-gray-900">{certificate.courseName}</CardTitle>
          <CardDescription className="text-sm mt-1">{certificate.centerName}</CardDescription>
        </div>
        <Award className="h-5 w-5 text-amber-500" />
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="p-2 bg-amber-50 rounded-md flex justify-between items-center text-sm border border-amber-100">
          <span className="text-amber-800 font-medium">رقم الشهادة:</span>
          <span className="font-mono text-gray-700">{certificate.number}</span>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 ml-1 text-gray-400" />
            <span>تاريخ الإصدار:</span>
          </div>
          <div>{formatDate(certificate.issueDate)}</div>
          
          {certificate.expiryDate && (
            <>
              <div className="flex items-center">
                <Hourglass className="h-3 w-3 ml-1 text-gray-400" />
                <span>تاريخ الانتهاء:</span>
              </div>
              <div>{formatDate(certificate.expiryDate)}</div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-1">
        <Link
          href={`/certificates/${certificate.id}`}
          className={buttonVariants({ 
            variant: "default",
            className: "w-full bg-amber-600 hover:bg-amber-700"
          })}
        >
          <FileText className="h-4 w-4 ml-2" />
          عرض الشهادة
        </Link>
      </CardFooter>
    </Card>
  );
};

// بيانات المستخدم الشخصية
const UserProfile = ({ user, stats }: { user: any; stats: any }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">الملف الشخصي</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
          {user.fullName?.charAt(0) || "م"}
        </div>
        <div>
          <h3 className="text-lg font-bold">{user.fullName || "المتدرب"}</h3>
          <p className="text-sm text-muted-foreground">{user.email || ""}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-50 p-2.5 rounded-md">
          <h4 className="text-xs text-slate-500 mb-1">دورات مسجلة</h4>
          <p className="font-semibold">{stats.totalEnrolled}</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-md">
          <h4 className="text-xs text-slate-500 mb-1">دورات مكتملة</h4>
          <p className="font-semibold">{stats.completed}</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-md">
          <h4 className="text-xs text-slate-500 mb-1">الشهادات</h4>
          <p className="font-semibold">{stats.certificates}</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-md">
          <h4 className="text-xs text-slate-500 mb-1">نسبة الإنجاز</h4>
          <p className="font-semibold">{stats.totalEnrolled ? Math.round((stats.completed / stats.totalEnrolled) * 100) : 0}%</p>
        </div>
      </div>

      <div className="mt-4">
        <Link 
          href="/profile" 
          className={buttonVariants({ 
            variant: "outline", 
            className: "w-full text-sm"
          })}
        >
          تعديل الملف الشخصي
          <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

// القسم الرئيسي للصفحة
const StudentDashboardV2: React.FC = () => {
  const { user } = useAuth();
  const [showAll, setShowAll] = React.useState(false);

  // استعلام البيانات
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/student/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/student/dashboard", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("فشل في تحميل بيانات لوحة التحكم");
      }
      return response.json();
    }
  });

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <DashboardLayout>
        <div dir="rtl">
          <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
          <DashboardLoading />
        </div>
      </DashboardLayout>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <DashboardLayout>
        <div dir="rtl">
          <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
          <DashboardError error={error as Error} retry={refetch} />
        </div>
      </DashboardLayout>
    );
  }

  // في حالة عدم وجود بيانات
  if (!data || !data.enrollments) {
    return (
      <DashboardLayout>
        <div dir="rtl">
          <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center h-60">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد بيانات متاحة</h3>
              <p className="text-center text-muted-foreground mb-4">
                لم يتم العثور على أي دورات مسجلة بعد
              </p>
              <Link href="/courses" className={buttonVariants()}>
                تصفح الدورات المتاحة
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // تحضير البيانات
  const enrollments = data.enrollments || [];
  const stats = data.stats || {
    totalEnrolled: 0,
    active: 0,
    completed: 0,
    certificates: 0
  };

  // فلترة الدورات حسب الحالة
  const activeEnrollments = enrollments.filter(
    (item: any) => 
      item.enrollment.status === "pending" || 
      item.enrollment.status === "approved" ||
      item.enrollment.status === "قيد التنفيذ" ||
      item.enrollment.status === "قيد التسجيل" ||
      item.enrollment.status === "معتمد"
  );
  
  const completedEnrollments = enrollments.filter(
    (item: any) => 
      item.enrollment.status === "completed" || 
      item.enrollment.status === "مكتمل" ||
      item.enrollment.status === "منتهية"
  );

  // استخراج الشهادات
  const certificates = enrollments
    .filter((item: any) => item.enrollment.certificate)
    .map((item: any) => ({
      id: item.enrollment.certificate.id,
      number: item.enrollment.certificate.certificateNumber,
      courseId: item.course.id,
      courseName: item.course.title,
      centerName: item.course.trainingCenter?.name || "مركز تدريب",
      issueDate: item.enrollment.certificate.issuedAt,
      expiryDate: item.enrollment.certificate.expiresAt
    })) || [];

  // عدد الشهادات المعروضة
  const displayedCertificates = showAll ? certificates : certificates.slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE، d MMMM yyyy", { locale: ar })}
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={GraduationCap}
            title="إجمالي الدورات"
            value={stats.totalEnrolled}
            bgClass="bg-blue-500"
          />
          <StatCard
            icon={BookOpen}
            title="الدورات النشطة"
            value={stats.active}
            bgClass="bg-emerald-500"
          />
          <StatCard
            icon={CheckCircle}
            title="الدورات المكتملة"
            value={stats.completed}
            bgClass="bg-violet-500"
          />
          <StatCard
            icon={Award}
            title="الشهادات"
            value={stats.certificates}
            bgClass="bg-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* العمود الأول - معلومات المستخدم */}
          <div className="space-y-6">
            <UserProfile user={user} stats={stats} />
            
            {/* الشهادات */}
            {certificates.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">الشهادات</CardTitle>
                    <Badge variant="outline">{certificates.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {displayedCertificates.map((cert: any, index: number) => (
                      <CertificateCard key={index} certificate={cert} />
                    ))}
                  </div>
                  
                  {certificates.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? (
                        <>
                          <ChevronLeft className="h-4 w-4 ml-1" />
                          عرض أقل
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 ml-1" />
                          عرض المزيد ({certificates.length - 2})
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* العمودان الآخران - الدورات */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-xl">الدورات التدريبية</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="all">جميع الدورات</TabsTrigger>
                    <TabsTrigger value="active">الدورات النشطة</TabsTrigger>
                    <TabsTrigger value="completed">الدورات المكتملة</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    {enrollments.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {enrollments.map((course: any, index: number) => (
                          <CourseCard key={index} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-10 bg-gray-50 rounded-md">
                        <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-1">لا توجد دورات مسجلة</h3>
                        <p className="text-sm text-gray-500 mb-4">لم تسجل في أي دورة تدريبية بعد</p>
                        <Link href="/courses" className={buttonVariants()}>
                          تصفح الدورات المتاحة
                        </Link>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="active" className="mt-0">
                    {activeEnrollments.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {activeEnrollments.map((course: any, index: number) => (
                          <CourseCard key={index} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-10 bg-gray-50 rounded-md">
                        <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-1">لا توجد دورات نشطة</h3>
                        <p className="text-sm text-gray-500 mb-4">ليس لديك دورات نشطة حالياً</p>
                        <Link href="/courses" className={buttonVariants()}>
                          تصفح الدورات المتاحة
                        </Link>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="mt-0">
                    {completedEnrollments.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {completedEnrollments.map((course: any, index: number) => (
                          <CourseCard key={index} course={course} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-10 bg-gray-50 rounded-md">
                        <CheckCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-1">لا توجد دورات مكتملة</h3>
                        <p className="text-sm text-gray-500">لم تكمل أي دورة تدريبية بعد</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboardV2;