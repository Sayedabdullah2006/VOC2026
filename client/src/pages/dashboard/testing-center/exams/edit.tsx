import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

// تعريف نموذج الإدخال للتحقق
const examSchema = z.object({
  title: z.string().min(3, { message: 'يجب أن يكون العنوان 3 أحرف على الأقل' }),
  description: z.string().min(10, { message: 'يجب أن يكون الوصف 10 أحرف على الأقل' }),
  location: z.string().min(3, { message: 'يرجى إدخال الموقع' }),
  examDate: z.string().min(1, { message: 'يرجى تحديد تاريخ الاختبار' }),
  capacity: z.coerce.number().min(1, { message: 'يجب أن تكون السعة رقمًا موجبًا' }),
  price: z.coerce.number().min(0, { message: 'يجب أن يكون السعر رقمًا موجبًا أو صفرًا' }),
  isVisible: z.boolean().optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function EditExamPage() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const examId = parseInt(id);
  
  // حالات للتحقق من اعتماد مركز الاختبار
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(true);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);

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
          setApplicationId(approvedApplication.id);
        } else if (applications.length > 0) {
          // إذا كان هناك طلب ولكنه غير معتمد، احفظ حالته
          const testingCenterApp = applications.find((app: any) => app.type === "testing_center");
          if (testingCenterApp) {
            console.log("تم العثور على طلب غير معتمد لمركز الاختبار:", testingCenterApp.status);
            setApplicationStatus(testingCenterApp.status);
            setApplicationId(testingCenterApp.id);
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

  // جلب بيانات الاختبار الحالي
  const { data: exam, isLoading, error } = useQuery({
    queryKey: [`/api/exams/${examId}`],
    enabled: !isNaN(examId),
  });

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      examDate: '',
      capacity: 0,
      price: 0,
      isVisible: false,
    },
  });

  // تحديث القيم الافتراضية عند استلام البيانات
  useEffect(() => {
    if (exam) {
      form.reset({
        title: exam.title,
        description: exam.description,
        location: exam.location,
        // تنسيق التاريخ للحقل date-time
        examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
        capacity: exam.capacity,
        price: exam.price,
        isVisible: exam.isVisible,
      });
    }
  }, [exam, form]);

  // تعريف التعديل باستخدام useMutation
  const updateExam = useMutation({
    mutationFn: async (values: ExamFormValues) => {
      return apiRequest('PATCH', `/api/exams/${examId}`, values);
    },
    onSuccess: () => {
      toast({
        title: 'تم تحديث الاختبار بنجاح',
        description: 'تم تحديث بيانات الاختبار بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      queryClient.invalidateQueries({ queryKey: [`/api/exams/${examId}`] });
      navigate('/TestingCenter/exams');
    },
    onError: (error: any) => {
      toast({
        title: 'فشل في تحديث الاختبار',
        description: error?.message || 'حدث خطأ أثناء تحديث الاختبار، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  // معالجة تقديم النموذج
  const onSubmit = (values: ExamFormValues) => {
    updateExam.mutate(values);
  };

  // عرض حالة التحميل أثناء التحقق من الاعتماد
  if (isCheckingApproval) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري التحقق من حالة الاعتماد...</span>
        </div>
      </DashboardLayout>
    );
  }

  // عرض رسالة الخطأ إذا لم يكن مركز الاختبار معتمداً
  if (!isApproved) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 ml-2" />
              <h3 className="text-lg font-medium">غير مصرح بالوصول</h3>
            </div>
            <p className="mt-2">
              لا يمكنك تعديل الاختبارات. يجب أن يكون طلب اعتماد مركز الاختبار الخاص بك معتمداً أولاً.
            </p>
            
            {applicationStatus && (
              <p className="mt-2">
                حالة طلبك الحالية: <strong>{applicationStatus}</strong>
              </p>
            )}
            
            <p className="mt-2">
              {!applicationId 
                ? "لم يتم العثور على طلب اعتماد. يرجى تقديم طلب اعتماد أولاً."
                : "يرجى الانتظار حتى تتم مراجعة واعتماد طلبك."}
            </p>
            
            <div className="mt-4 space-x-2 space-x-reverse">
              {applicationId ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/TestingCenter/applications/${applicationId}`)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  عرض تفاصيل الطلب
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/TestingCenter/register")}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  تقديم طلب اعتماد
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/TestingCenter/applications")}
                className="mr-2"
              >
                جميع الطلبات
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/TestingCenter/dashboard")}
                className="mr-2"
              >
                العودة للوحة التحكم
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // عرض حالة التحميل أثناء جلب بيانات الاختبار
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل بيانات الاختبار...</span>
        </div>
      </DashboardLayout>
    );
  }

  // عرض رسالة الخطأ في حالة فشل تحميل بيانات الاختبار
  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="my-4">
          <AlertTitle>خطأ في تحميل بيانات الاختبار</AlertTitle>
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات الاختبار. يرجى المحاولة مرة أخرى لاحقًا.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>تعديل بيانات الاختبار</CardTitle>
          <CardDescription>تعديل تفاصيل الاختبار وإعداداته</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الاختبار</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل عنوان الاختبار" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الاختبار</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصف الاختبار ومتطلباته"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مكان الاختبار</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل موقع إجراء الاختبار" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الاختبار</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعة الاستيعابية</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="عدد المقاعد المتاحة"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر الاختبار (ر.س)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="أدخل سعر الاختبار"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 space-x-reverse">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none mr-2">
                      <FormLabel>ظهور الاختبار للمتدربين</FormLabel>
                      <FormDescription>
                        عند تفعيل هذا الخيار، سيتمكن المتدربون من رؤية هذا الاختبار والتسجيل فيه
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/TestingCenter/exams')}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="min-w-[120px]"
                  disabled={updateExam.isPending}
                >
                  {updateExam.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}