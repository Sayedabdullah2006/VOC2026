import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient"; // إضافة استيراد apiRequest
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(3, { message: "عنوان الاختبار يجب أن يحتوي على 3 أحرف على الأقل" }),
  description: z.string().min(10, { message: "وصف الاختبار يجب أن يحتوي على 10 أحرف على الأقل" }),
  exam_type: z.string().min(3, { message: "نوع الاختبار مطلوب" }),
  location: z.string().min(3, { message: "موقع الاختبار مطلوب" }),
  capacity: z.coerce.number().min(1, { message: "السعة يجب أن تكون على الأقل 1" }),
  // استخدام string بدلاً من date للتاريخ لتجنب مشاكل التحويل
  exam_date: z.string().min(1, { message: "تاريخ الاختبار مطلوب" }),
  is_visible: z.boolean().optional().default(true),
});

export default function EditExamPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [initialFetch, setInitialFetch] = useState(true);
  
  // حالات للتحقق من اعتماد مركز الاختبار
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(true);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  
  // استخراج معرف الاختبار من URL
  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/').pop();
    if (id && id !== 'edit') {
      setExamId(id);
    }
  }, []);
  
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
        
        // التحقق من وجود طلب معتمد - نقبل فقط حالة "مقبول"
        const approvedApplication = applications.find((app: any) => 
          app.type === "testing_center" && app.status === "مقبول"
        );
        
        if (approvedApplication) {
          setIsApproved(true);
          setApplicationId(approvedApplication.id);
        } else if (applications.length > 0) {
          // إذا كان هناك طلب ولكنه غير معتمد، احفظ حالته
          const testingCenterApp = applications.find((app: any) => app.type === "testing_center");
          if (testingCenterApp) {
            setApplicationStatus(testingCenterApp.status);
            setApplicationId(testingCenterApp.id);
          }
        }
      } catch (error) {
        console.error("خطأ في التحقق من حالة الاعتماد:", error);
        toast({
          variant: "destructive",
          title: "خطأ في التحقق من حالة الاعتماد",
          description: "حدث خطأ أثناء التحقق من حالة اعتماد مركز الاختبار الخاص بك"
        });
      } finally {
        setIsCheckingApproval(false);
      }
    }
    
    checkApprovalStatus();
  }, [toast]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      exam_type: "",
      location: "",
      capacity: 1,
      is_visible: true,
    },
  });
  
  // جلب بيانات الاختبار عند تحميل الصفحة
  useEffect(() => {
    async function fetchExamData() {
      if (!examId || !isApproved) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/exams/${examId}`);
        
        if (!response.ok) {
          throw new Error("فشل في استرجاع بيانات الاختبار");
        }
        
        const data = await response.json();
        
        // تعيين قيم النموذج من البيانات المسترجعة
        // تحويل التاريخ إلى صيغة نصية YYYY-MM-DD
        let formattedDate = "";
        try {
          if (data.exam_date) {
            const date = new Date(data.exam_date);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            }
          }
        } catch (error) {
          console.error("خطأ في تنسيق التاريخ:", error);
        }
        
        form.reset({
          title: data.title,
          description: data.description,
          exam_type: data.exam_type,
          location: data.location,
          capacity: data.capacity,
          exam_date: formattedDate,
          is_visible: data.is_visible,
        });
        
      } catch (error) {
        console.error("خطأ في استرجاع بيانات الاختبار:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء استرجاع بيانات الاختبار",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setInitialFetch(false);
      }
    }
    
    // تنفيذ استرجاع البيانات فقط إذا تم التحقق من الاعتماد بنجاح
    if (!isCheckingApproval) {
      fetchExamData();
    }
  }, [examId, form, toast, isApproved, isCheckingApproval]);
  
  // إرسال النموذج
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!examId) return;
    
    // التحقق من حالة الاعتماد قبل إرسال النموذج
    if (!isApproved) {
      toast({
        title: "غير مصرح بالتعديل",
        description: "يجب أن يكون مركز الاختبار معتمداً لإجراء هذه العملية",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // تجهيز البيانات وضمان تنسيق التاريخ بشكل صحيح ISO
      const formattedData = {
        ...values,
        exam_date: values.exam_date instanceof Date ? values.exam_date.toISOString() : values.exam_date,
      };
      
      console.log("بيانات التحديث المنسقة:", formattedData);
      
      // استخدام fetch مباشرة بدلاً من apiRequest لمزيد من التحكم
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // مهم لإرسال ملفات تعريف الارتباط
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("استجابة خطأ من الخادم:", errorData);
        throw new Error(`فشل في تحديث الاختبار: ${errorData?.message || response.statusText}`);
      }
      
      toast({
        title: "تم تحديث الاختبار بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
      
      // العودة إلى صفحة قائمة الاختبارات
      navigate("/TestingCenter/exams");
      
    } catch (error) {
      console.error("خطأ في تحديث الاختبار:", error);
      toast({
        title: "خطأ في تحديث الاختبار",
        description: "حدث خطأ أثناء تحديث بيانات الاختبار",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">تعديل الاختبار</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/TestingCenter/exams")}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى قائمة الاختبارات
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>معلومات الاختبار</CardTitle>
            <CardDescription>قم بتعديل معلومات الاختبار وتفاصيله</CardDescription>
          </CardHeader>
          <CardContent>
            {initialFetch && isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الاختبار</FormLabel>
                          <FormControl>
                            <Input placeholder="اختبار الكفاءة المهنية للسياقة" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="exam_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الاختبار</FormLabel>
                          <FormControl>
                            <Input placeholder="نظري / عملي" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>موقع الاختبار</FormLabel>
                          <FormControl>
                            <Input placeholder="مقر مركز الاختبار - الرياض" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="exam_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الاختبار</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              placeholder="YYYY-MM-DD"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعة (عدد المقاعد)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الاختبار</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف تفصيلي للاختبار والمهارات التي سيتم تقييمها" 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ التعديلات"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}