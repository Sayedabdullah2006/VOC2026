import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Check, X, Mail, Phone, Calendar, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function ExamCandidatesPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const examId = parseInt(id);

  // جلب بيانات الاختبار
  const { data: exam, isLoading: isLoadingExam, error: examError } = useQuery({
    queryKey: [`/api/exams/${examId}`],
    enabled: !isNaN(examId),
  });

  // جلب بيانات المرشحين للاختبار
  const { data: candidates, isLoading: isLoadingCandidates, error: candidatesError } = useQuery({
    queryKey: [`/api/exams/${examId}/registrations`],
    enabled: !isNaN(examId),
  });

  // تنسيق التاريخ بشكل مناسب
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // تحديد لون وعنوان الحالة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مسجل':
        return <Badge variant="outline">مسجل</Badge>;
      case 'حاضر':
        return <Badge variant="success">حاضر</Badge>;
      case 'ناجح':
        return <Badge className="bg-green-500">ناجح</Badge>;
      case 'راسب':
        return <Badge variant="destructive">راسب</Badge>;
      case 'غائب':
        return <Badge variant="secondary">غائب</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingExam || isLoadingCandidates) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (examError || candidatesError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="my-4">
          <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات الاختبار أو المرشحين. يرجى المحاولة مرة أخرى لاحقًا.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const candidatesList = candidates || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/TestingCenter/exams">الاختبارات</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{exam?.title || 'تفاصيل الاختبار'}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>المرشحون</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">المرشحون للاختبار: {exam?.title}</h1>
          <Button
            variant="outline"
            onClick={() => navigate(`/TestingCenter/exams`)}
          >
            العودة إلى قائمة الاختبارات
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الاختبار</CardTitle>
            <CardDescription>تفاصيل أساسية عن الاختبار والمرشحين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-md text-center">
                <p className="text-muted-foreground text-sm">تاريخ الاختبار</p>
                <p className="text-xl font-semibold mt-1">{exam?.examDate ? formatDate(exam.examDate) : 'غير محدد'}</p>
              </div>
              <div className="p-4 border rounded-md text-center">
                <p className="text-muted-foreground text-sm">مكان الاختبار</p>
                <p className="text-xl font-semibold mt-1">{exam?.location || 'غير محدد'}</p>
              </div>
              <div className="p-4 border rounded-md text-center">
                <p className="text-muted-foreground text-sm">السعة الاستيعابية</p>
                <p className="text-xl font-semibold mt-1">{exam?.capacity || 0}</p>
              </div>
              <div className="p-4 border rounded-md text-center">
                <p className="text-muted-foreground text-sm">عدد المسجلين</p>
                <p className="text-xl font-semibold mt-1">{candidatesList.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المرشحين</CardTitle>
            <CardDescription>جميع المرشحين المسجلين في هذا الاختبار</CardDescription>
          </CardHeader>
          <CardContent>
            {candidatesList.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">لا يوجد مرشحين مسجلين في هذا الاختبار حتى الآن.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>اسم المرشح</TableHead>
                      <TableHead>رقم الهوية</TableHead>
                      <TableHead>معلومات الاتصال</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>النتيجة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesList.map((candidate, index) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {candidate.studentName || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {candidate.identityNumber || "غير محدد"}
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Info className="h-4 w-4 ml-1" />
                                عرض التفاصيل
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 ml-2" />
                                  <span>{candidate.email || "غير محدد"}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 ml-2" />
                                  <span>{candidate.phone || "غير محدد"}</span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          {candidate.registrationDate ? formatDate(candidate.registrationDate) : "غير محدد"}
                        </TableCell>
                        <TableCell>
                          {candidate.status ? getStatusBadge(candidate.status) : getStatusBadge("مسجل")}
                        </TableCell>
                        <TableCell>
                          {candidate.result === "ناجح" ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : candidate.result === "راسب" ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : (
                            <span className="text-sm text-muted-foreground">لم يحدد بعد</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}