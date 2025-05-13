import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, PlusCircle, Edit2, Trash2, Users, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Course, UserRole, CourseStatus, type CourseStatusType } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CourseStatusIndicator } from "@/components/ui/course-status-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// مكونات للتأكيد
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CourseListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    retry: 3,
    enabled: !!user
  });

  // وظيفة حذف الدورة
  const deleteMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء حذف الدورة');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدورة التدريبية بنجاح",
        variant: "default",
      });
      
      // تحديث قائمة الدورات
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // إعادة تعيين حالة الدورة المحذوفة
      setCourseToDelete(null);
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الدورة",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });
  
  // التحقق من وجود طلب مركز تدريب معتمد للمستخدم
  const { data: applications = [], isLoading: isApplicationsLoading } = useQuery({
    queryKey: [`/api/training-center-applications/user/${user?.id}`],
    enabled: !!user && user.role === UserRole.TRAINING_CENTER,
    retry: 1
  });
  
  // تحديد ما إذا كان المركز معتمد (لديه طلب بحالة "مقبول")
  const hasApprovedApplication = Array.isArray(applications) && applications.some(app => app.status === 'مقبول');

  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };

  const refreshCourses = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
  };

  // إذا كان المستخدم مركز تدريب ويتم تحميل بيانات طلبات التسجيل
  if (user?.role === UserRole.TRAINING_CENTER && isApplicationsLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">إدارة الدورات التدريبية</h1>
              <p className="text-gray-600">قائمة الدورات التدريبية المتاحة</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">جاري التحقق من معلومات المركز...</h3>
                <p className="text-gray-600">يرجى الانتظار بينما نتحقق من حالة تسجيل المركز التدريبي</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // إذا كان المستخدم مركز تدريب وليس لديه طلب معتمد
  if (user?.role === UserRole.TRAINING_CENTER && !hasApprovedApplication && !isApplicationsLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">إدارة الدورات التدريبية</h1>
              <p className="text-gray-600">قائمة الدورات التدريبية المتاحة</p>
            </div>
          </div>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">لا يمكن إدارة الدورات التدريبية</h3>
                <p className="text-gray-600 mb-4">
                  لم يتم اعتماد مركز التدريب الخاص بك بعد. يجب أن يكون لديك طلب تسجيل معتمد قبل إضافة أي دورات تدريبية.
                </p>
                <Alert className="max-w-md mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>حالة الاعتماد</AlertTitle>
                  <AlertDescription>
                    {Array.isArray(applications) && applications.length > 0 ? (
                      <>
                        حالة طلب التسجيل الخاص بك: <strong>{applications[0].status}</strong>
                        <p className="mt-2">يرجى الانتظار حتى تتم الموافقة على طلبك من قبل الإدارة.</p>
                      </>
                    ) : (
                      <>
                        لم يتم العثور على طلب تسجيل. يرجى تقديم طلب تسجيل مركز تدريب أولاً.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // التحميل العام لباقي المستخدمين
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">جاري التحميل...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إدارة الدورات التدريبية</h1>
            <p className="text-gray-600">قائمة الدورات التدريبية المتاحة</p>
          </div>
          <div className="flex gap-4">
            {user?.role === UserRole.TRAINING_CENTER && (
              <>
                <Button onClick={refreshCourses} variant="outline">
                  تحديث القائمة
                </Button>
                {hasApprovedApplication ? (
                  <Link href="/dashboard/courses/create">
                    <Button>
                      <PlusCircle className="h-4 w-4 ml-2" />
                      إضافة دورة جديدة
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline" 
                    disabled
                    title="يجب أن يكون لديك طلب مركز تدريب معتمد أولاً"
                  >
                    <PlusCircle className="h-4 w-4 ml-2" />
                    إضافة دورة جديدة
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">لا توجد دورات</h3>
                <p className="text-gray-600 mb-4">
                  لم يتم إضافة أي دورات تدريبية بعد
                </p>
                {user?.role === UserRole.TRAINING_CENTER && (
                  hasApprovedApplication ? (
                    <Link href="/dashboard/courses/create">
                      <Button>
                        <PlusCircle className="h-4 w-4 ml-2" />
                        إضافة دورة جديدة
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2 items-center">
                      <Button
                        variant="outline" 
                        disabled
                        title="يجب أن يكون لديك طلب مركز تدريب معتمد أولاً"
                      >
                        <PlusCircle className="h-4 w-4 ml-2" />
                        إضافة دورة جديدة
                      </Button>
                      <Alert variant="destructive" className="max-w-md mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>غير مسموح</AlertTitle>
                        <AlertDescription>
                          لا يمكن إضافة دورات تدريبية، يجب أن يكون لديك طلب مركز تدريب معتمد أولاً
                        </AlertDescription>
                      </Alert>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>قائمة الدورات التدريبية</CardTitle>
              <CardDescription>
                جميع الدورات التدريبية المتاحة في المركز
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>عنوان الدورة</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>السعة</TableHead>
                    <TableHead>عدد المسجلين</TableHead>
                    <TableHead>تاريخ البدء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.duration} ساعة</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          {course.hasOwnProperty('enrollmentCount') ? (course as any).enrollmentCount : 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(course.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CourseStatusIndicator status={course.status as CourseStatusType} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              عرض التفاصيل
                            </Button>
                          </Link>
                          {user?.role === UserRole.TRAINING_CENTER && course.training_center_id === user.id && (
                            <>
                              <Link href={`/dashboard/courses/${course.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => setCourseToDelete(course)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد حذف الدورة التدريبية</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من رغبتك في حذف الدورة التدريبية "{courseToDelete?.title}"؟
                                      <br />
                                      هذا الإجراء لا يمكن التراجع عنه.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setCourseToDelete(null)}>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (courseToDelete) {
                                          setIsDeleting(true);
                                          deleteMutation.mutate(courseToDelete.id);
                                        }
                                      }}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          جاري الحذف...
                                        </>
                                      ) : (
                                        "حذف"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}