import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, MapPin, Users, Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Exam {
  id: number;
  title: string;
  description: string;
  exam_type: string;
  exam_date: string;
  location: string;
  capacity: number;
  registered_candidates: number;
  is_visible: boolean;
  testing_center_id: number;
}

export default function TestingCenterExamsPage() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(true);

  // استعلام للحصول على قائمة الاختبارات الخاصة بمركز الاختبار
  const { data: exams, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/exams'],
  });

  // التحقق من حالة اعتماد مركز الاختبار
  useEffect(() => {
    async function checkApprovalStatus() {
      try {
        // استخدام المسار الصحيح لجلب طلبات مراكز الاختبار
        const response = await fetch(`/api/testing-centers/applications`);
        if (!response.ok) {
          throw new Error("فشل في الحصول على طلبات الاعتماد");
        }
        
        const applications = await response.json();
        console.log("طلبات مركز الاختبار:", applications);
        
        // التحقق من وجود طلب معتمد - نقبل فقط حالة "مقبول"
        const approvedApplication = applications.find((app: any) => 
          app.type === "testing_center" && app.status === "مقبول"
        );
        
        if (approvedApplication) {
          console.log("تم العثور على طلب معتمد لمركز الاختبار");
          setIsApproved(true);
        } else if (applications.length > 0) {
          // إذا كان هناك طلب ولكنه غير معتمد، احفظ حالته
          const testingCenterApp = applications.find((app: any) => app.type === "testing_center");
          if (testingCenterApp) {
            console.log("تم العثور على طلب غير معتمد لمركز الاختبار:", testingCenterApp.status);
            setApplicationStatus(testingCenterApp.status);
          }
        }
      } catch (error) {
        console.error("خطأ في التحقق من حالة الاعتماد:", error);
      } finally {
        setIsCheckingApproval(false);
      }
    }
    
    checkApprovalStatus();
  }, []);

  // تغيير حالة ظهور الاختبار
  const toggleExamVisibility = async (examId: number, currentVisibility: boolean) => {
    try {
      setIsUpdating(examId);
      
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: !currentVisibility })
      });

      if (response.ok) {
        toast({
          title: "تم تحديث الاختبار",
          description: !currentVisibility ? 
            "تم جعل الاختبار مرئيًا للطلاب" : 
            "تم إخفاء الاختبار عن الطلاب",
        });
        
        // تحديث البيانات محليًا
        queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      } else {
        toast({
          title: "خطأ في تحديث الاختبار",
          description: "حدث خطأ أثناء تحديث حالة ظهور الاختبار",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في تحديث الاختبار",
        description: "حدث خطأ أثناء تحديث حالة ظهور الاختبار",
        variant: "destructive",
      });
      console.error("خطأ في تحديث الاختبار:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // تنسيق التاريخ بطريقة محسنة وموحدة
  const formatDate = (dateString: string) => {
    try {
      // التعامل مع النصوص الفارغة
      if (!dateString) {
        return "تاريخ غير محدد";
      }
      
      // طباعة قيمة التاريخ المستلمة للتصحيح
      console.log("قيمة التاريخ المستلمة:", dateString);
      
      // معالجة خاصة للتاريخ بتنسيق ISO
      if (typeof dateString === 'string' && dateString.includes('T')) {
        try {
          // محاولة تحليل التاريخ
          const date = new Date(dateString);
          
          // التحقق من صلاحية التاريخ
          if (!isNaN(date.getTime())) {
            const options: Intl.DateTimeFormatOptions = { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            };
            
            // استخدام تنسيق التاريخ العربي
            return new Intl.DateTimeFormat('ar-SA', options).format(date);
          }
        } catch (innerError) {
          console.error("خطأ في معالجة تاريخ ISO:", innerError);
        }
      }
      
      // الطريقة الاحتياطية: محاولة عامة لتحليل التاريخ
      try {
        const date = new Date(dateString);
        
        if (!isNaN(date.getTime())) {
          const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          };
          
          return new Intl.DateTimeFormat('ar-SA', options).format(date);
        }
      } catch (generalError) {
        console.error("خطأ عام في تحليل التاريخ:", generalError);
      }
      
      // الطريقة الأخيرة: تنسيق يدوي للتاريخ
      if (typeof dateString === 'string' && dateString.includes('-')) {
        // تقسيم التاريخ
        const parts = dateString.split(/[-T]/); // تقسيم بناءً على '-' أو 'T'
        
        if (parts.length >= 3) {
          const [year, month, day] = parts;
          if (year && month && day) {
            return `${parseInt(day)}/${parseInt(month)}/${year}`;
          }
        }
      }
      
      // إذا وصلنا إلى هنا، فإن التاريخ غير صالح
      return "تاريخ غير صالح";
    } catch (error) {
      console.error("خطأ في تنسيق التاريخ:", error);
      
      // إرجاع النص الأصلي إذا كان ذلك ممكنًا
      if (typeof dateString === 'string') {
        return dateString;
      }
      
      return "تاريخ غير صالح";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-destructive text-lg">حدث خطأ أثناء تحميل الاختبارات</p>
        <Button onClick={() => refetch()}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">إدارة الاختبارات</h1>
          {!isCheckingApproval && (
            isApproved ? (
              <Link href="/TestingCenter/exams/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة اختبار جديد
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/TestingCenter/applications"}
                className="border-amber-500 text-amber-500 hover:bg-amber-50"
              >
                <Info className="h-4 w-4 ml-2" />
                عرض حالة طلب الاعتماد
              </Button>
            )
          )}
        </div>
      
      {/* رسالة تنبيه في حالة عدم اعتماد مركز الاختبار */}
      {!isCheckingApproval && !isApproved && (
        <Alert className="mb-6 bg-amber-50 text-amber-800 border border-amber-300">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle>مركز اختبار غير معتمد</AlertTitle>
          <AlertDescription>
            لم يتم اعتماد مركز الاختبار الخاص بك بعد. يجب الموافقة على طلب الاعتماد قبل أن تتمكن من إضافة اختبارات جديدة.
            {applicationStatus && (
              <div className="mt-2">
                <strong>حالة طلب الاعتماد الحالية:</strong> {applicationStatus}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>الاختبارات الحالية</CardTitle>
          <CardDescription>
            عرض جميع الاختبارات التي تم إنشاؤها بواسطة مركز الاختبار الخاص بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exams && exams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان الاختبار</TableHead>
                  <TableHead>نوع الاختبار</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>المسجلون</TableHead>
                  <TableHead>مرئي للطلاب</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam: Exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.exam_type}</TableCell>
                    <TableCell>{formatDate(exam.exam_date)}</TableCell>
                    <TableCell>{exam.location}</TableCell>
                    <TableCell>
                      <Badge variant={exam.registered_candidates < exam.capacity ? "outline" : "secondary"}>
                        {exam.registered_candidates} / {exam.capacity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={exam.is_visible}
                        disabled={isUpdating === exam.id}
                        onCheckedChange={() => toggleExamVisibility(exam.id, exam.is_visible)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/TestingCenter/exams/${exam.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/TestingCenter/exams/${exam.id}/candidates`}>
                          <Button variant="outline" size="icon">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">لا توجد اختبارات حالياً</h3>
              <p className="text-muted-foreground mb-4">
                {isApproved ? 
                  "قم بإضافة اختبار جديد للبدء" : 
                  "يجب الموافقة على طلب اعتماد مركز الاختبار الخاص بك قبل إضافة اختبارات جديدة"
                }
              </p>
              {isApproved ? (
                <Link href="/TestingCenter/exams/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة اختبار جديد
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/TestingCenter/applications"}
                  className="border-amber-500 text-amber-500 hover:bg-amber-50"
                >
                  <Info className="h-4 w-4 ml-2" />
                  عرض حالة طلب الاعتماد
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>إحصائيات الاختبارات</CardTitle>
          <CardDescription>
            ملخص إحصائي لاختبارات مركز الاختبار الخاص بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">إجمالي الاختبارات</h3>
              <p className="text-3xl font-bold">{exams?.length || 0}</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">إجمالي المقاعد</h3>
              <p className="text-3xl font-bold">
                {exams?.reduce((total: number, exam: Exam) => total + exam.capacity, 0) || 0}
              </p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-1">إجمالي المسجلين</h3>
              <p className="text-3xl font-bold">
                {exams?.reduce((total: number, exam: Exam) => total + exam.registered_candidates, 0) || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}