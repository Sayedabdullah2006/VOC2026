import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Course, CourseStatus } from "@shared/schema"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, ArrowLeft, Edit2, Trash2, Download, Search, MessageCircle, Award } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";


// Update the status colors to use CourseStatus enum
const statusColors = {
  [CourseStatus.SCHEDULED]: 'bg-yellow-100 text-yellow-800',
  [CourseStatus.IN_PROGRESS]: 'bg-green-100 text-green-800',
  [CourseStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [CourseStatus.CANCELLED]: 'bg-red-100 text-red-800'
} as const;

// Update the status list to match CourseStatus
const statusList = Object.values(CourseStatus);
type CourseStatusType = typeof CourseStatus[keyof typeof CourseStatus];

interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentDate: string;
  status: string;
  email?: string;
  phone?: string;
  certificate?: {
    id: number;
    certificateNumber: string;
    issuedAt: string;
  } | null;
}

const apiRequest = async (method: string, url: string, body?: any) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return response;
};


export default function CourseDetailsPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: course, isLoading: isCourseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      return response.json();
    },
  });

  // Fetch enrollments only if user is a training center and owns the course
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: [`/api/courses/${id}/enrollments`],
    queryFn: async () => {
      console.log('Fetching enrollments for course:', id);
      const response = await fetch(`/api/courses/${id}/enrollments`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch enrollments');
      }
      return response.json();
    },
    enabled: !!course && user?.role === "TRAINING_CENTER" && course.training_center_id === user.id,
  });

  // Filter enrollments based on search query and status
  const filteredEnrollments = enrollments ? enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (enrollment.email && enrollment.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (enrollment.phone && enrollment.phone.includes(searchQuery));
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "تم حذف الدورة بنجاح",
        description: "تم حذف الدورة التدريبية وجميع بياناتها",
      });
      navigate("/dashboard/courses");
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حذف الدورة. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const exportToExcel = async () => {
    try {
      const response = await fetch(`/api/courses/${id}/enrollments/export`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export enrollments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enrollments-${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير البيانات بنجاح",
        description: "تم تحميل ملف Excel بقائمة المسجلين",
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تصدير البيانات. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleContactStudent = (studentId: number) => {
    navigate(`/dashboard/messages?recipientId=${studentId}`);
  };

  // Update the updateStatusMutation section
  const updateStatusMutation = useMutation({
    mutationFn: async ({ courseId, status }: { courseId: number; status: CourseStatusType }) => {
      try {
        console.log('Attempting to update course status:', { courseId, status });
        const response = await fetch(`/api/courses/${courseId}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ status })
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update course status');
        }

        return data;
      } catch (error) {
        console.error('Status update error details:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate both the course list and the specific course queries
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id] });
      toast({
        title: "تم تحديث حالة الدورة",
        description: "تم تحديث حالة الدورة بنجاح",
      });
    },
    onError: (error: Error) => {
      console.error('Status update error:', error);
      toast({
        title: "حدث خطأ",
        description: error.message || "حدث خطأ أثناء تحديث حالة الدورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = async (newStatus: CourseStatusType) => {
    try {
      console.log('Current course status:', course?.status);
      console.log('Attempting to update status to:', newStatus);
      console.log('Available status values:', Object.values(CourseStatus));

      await updateStatusMutation.mutateAsync({
        courseId: parseInt(id!),
        status: newStatus
      });
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    navigate(`/dashboard/courses/${id}/edit`);
  };

  const createCertificateMutation = useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: number; studentId: number }) => {
      const response = await fetch(`/api/courses/${courseId}/enrollments/${studentId}/certificate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create certificate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}/enrollments`] });
      toast({
        title: "تم إصدار الشهادة بنجاح",
        description: "يمكنك الآن عرض الشهادة وتحميلها",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إصدار الشهادة. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleCertificateAction = async (enrollment: Enrollment) => {
    if (!enrollment.certificate) {
      try {
        await createCertificateMutation.mutateAsync({
          courseId: parseInt(id!),
          studentId: enrollment.studentId
        });
      } catch (error) {
        console.error('Error creating certificate:', error);
      }
    } else {
      // Open certificate view page instead of API endpoint
      window.open(`/certificates/view/${enrollment.certificate.id}`, '_blank');
    }
  };

  if (isCourseLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          جاري التحميل...
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          لم يتم العثور على الدورة
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/courses">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للقائمة
              </Button>
            </Link>
            {user?.role === "TRAINING_CENTER" && course.training_center_id === user.id && (
              <div className="flex gap-2 mr-auto">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 ml-2" />
                  تعديل الدورة
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف الدورة
                </Button>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <div className="flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[course.status as CourseStatusType]}`}>
                  {course.status}
                </span>
                {user?.role === "TRAINING_CENTER" && course.training_center_id === user.id && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {statusList.map((status) => (
                      <Button
                        key={status}
                        variant={course.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                        disabled={updateStatusMutation.isPending}
                        className={course.status === status ? "bg-primary" : ""}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-600">{course.description}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الدورة</CardTitle>
                <CardDescription>التفاصيل الأساسية للدورة التدريبية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">المدة</div>
                    <div className="font-medium">{course.duration} ساعة</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">السعة</div>
                    <div className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {course.capacity} متدرب
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">تاريخ البدء</div>
                    <div className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(course.start_date)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">تاريخ الانتهاء</div>
                    <div className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(course.end_date)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === "TRAINING_CENTER" && course.training_center_id === user.id && (
              <Card>
                <CardHeader>
                  <CardTitle>المسجلون في الدورة</CardTitle>
                  <CardDescription>قائمة المتدربين المسجلين في الدورة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="ابحث عن متدرب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                        icon={<Search className="h-4 w-4" />}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value={CourseStatus.SCHEDULED}>مجدولة</SelectItem>
                        <SelectItem value={CourseStatus.IN_PROGRESS}>جارية</SelectItem>
                        <SelectItem value={CourseStatus.COMPLETED}>منتهية</SelectItem>
                        <SelectItem value={CourseStatus.CANCELLED}>ملغاة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportToExcel}>
                      <Download className="h-4 w-4 ml-2" />
                      تصدير Excel
                    </Button>
                  </div>

                  {isEnrollmentsLoading ? (
                    <div className="text-center py-8">جاري تحميل البيانات...</div>
                  ) : filteredEnrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم المتدرب</TableHead>
                          <TableHead>البريد الإلكتروني</TableHead>
                          <TableHead>رقم الجوال</TableHead>
                          <TableHead>تاريخ التسجيل</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEnrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>{enrollment.studentName}</TableCell>
                            <TableCell>{enrollment.email}</TableCell>
                            <TableCell>{enrollment.phone}</TableCell>
                            <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                            <TableCell>{enrollment.status}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContactStudent(enrollment.studentId)}
                                >
                                  <MessageCircle className="h-4 w-4 ml-2" />
                                  تواصل
                                </Button>
                                <Button
                                  variant={enrollment.certificate ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleCertificateAction(enrollment)}
                                >
                                  <Award className="h-4 w-4 ml-2" />
                                  {enrollment.certificate ? "عرض الشهادة" : "إصدار شهادة"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا يوجد متدربين مسجلين في هذه الدورة حتى الآن
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الدورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف الدورة بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              حذف الدورة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}