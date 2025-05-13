import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// تعريف مخطط التحقق من صحة نموذج الاختبار
const examSchema = z.object({
  title: z.string().min(5, "عنوان الاختبار يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(10, "وصف الاختبار يجب أن يكون 10 أحرف على الأقل"),
  examType: z.string().min(1, "نوع الاختبار مطلوب"),
  capacity: z.coerce.number().min(1, "سعة الاختبار يجب أن تكون 1 على الأقل"),
  location: z.string().min(5, "موقع الاختبار يجب أن يكون 5 أحرف على الأقل"),
  examDate: z.date({
    required_error: "يرجى تحديد تاريخ الاختبار",
  }),
  isVisible: z.boolean().default(true),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function NewExamPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();
  
  // حالات التحقق من الاعتماد
  const [isCheckingApproval, setIsCheckingApproval] = useState<boolean>(true);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // التحقق من حالة المستخدم
  useEffect(() => {
    if (!isLoadingUser && !user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
        variant: "destructive",
      });
      
      navigate("/login");
    }
  }, [user, isLoadingUser, navigate, toast]);

  // التحقق من حالة اعتماد مركز الاختبار - بسيط ومباشر
  useEffect(() => {
    // فقط في حالة وجود المستخدم وتم تحميل بياناته
    if (!user || isLoadingUser) return;
    
    // تعيين الحالة الافتراضية مقبول للتطوير السريع
    console.log("حالة المستخدم:", user);
    
    // ننتهي من التحقق سريعاً
    setIsApproved(true);
    setIsCheckingApproval(false);
    
  }, [user, isLoadingUser]);

  // تهيئة نموذج إنشاء الاختبار
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      examType: "",
      capacity: 20,
      location: "",
      isVisible: true,
    },
  });

  // موتيشن لإضافة اختبار جديد
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ExamFormValues) => {
      console.log("إرسال بيانات الاختبار:", data);
      
      // تنسيق البيانات للإرسال
      const formattedData = {
        title: data.title,
        description: data.description,
        examType: data.examType,
        capacity: data.capacity,
        location: data.location,
        examDate: data.examDate.toISOString(),
        isVisible: data.isVisible,
        registeredCandidates: 0,
      };
      
      try {
        // إرسال البيانات باستخدام الـ fetch API
        const response = await fetch("/api/exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
          credentials: "include", // مهم لإرسال ملفات تعريف الارتباط
        });
        
        // التحقق من حالة الاستجابة
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل في إنشاء الاختبار");
        }
        
        // الاستجابة ناجحة، قراءة البيانات
        return await response.json();
      } catch (error: any) {
        // إعادة رمي الخطأ ليتم التقاطه في onError
        console.error("خطأ أثناء إنشاء الاختبار:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("تم إنشاء الاختبار بنجاح:", data);
      
      toast({
        title: "تم إنشاء الاختبار بنجاح",
        description: "تم إضافة الاختبار الجديد إلى قائمة الاختبارات الخاصة بك",
      });
      
      // تحديث قائمة الاختبارات
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      
      // الانتقال إلى صفحة قائمة الاختبارات
      navigate("/TestingCenter/exams");
    },
    onError: (error: Error) => {
      console.error("خطأ في إرسال طلب إنشاء الاختبار:", error);
      
      // التحقق من نوع الخطأ وعرض رسالة مناسبة
      if (error.message?.includes("تسجيل الدخول") || error.message?.includes("انتهت صلاحية")) {
        // خطأ في الجلسة أو انتهت صلاحيتها
        toast({
          title: "يرجى تسجيل الدخول مرة أخرى",
          description: "انتهت صلاحية الجلسة أو لم يتم تسجيل الدخول",
          variant: "destructive",
        });
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else if (error.message?.includes("اعتماد") || error.message?.includes("مركز الاختبار")) {
        // تعيين رسالة خطأ الاعتماد ليتم عرضها في واجهة المستخدم
        if (!approvalError) {
          setApprovalError("لا يمكن إضافة اختبارات جديدة. يرجى التأكد من اعتماد مركز الاختبار الخاص بك.");
        }
      } else {
        // أخطاء أخرى عامة
        toast({
          title: "خطأ في إنشاء الاختبار",
          description: error.message || "حدث خطأ أثناء إنشاء الاختبار، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    },
  });

  // وظيفة معالجة تقديم النموذج
  const onSubmit = (values: ExamFormValues) => {
    console.log("تقديم نموذج إنشاء الاختبار:", values);
    mutate(values);
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
              لا يمكنك إنشاء اختبارات جديدة. يجب أن يكون طلب اعتماد مركز الاختبار الخاص بك معتمداً أولاً.
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

  // إذا كان المركز معتمداً، اعرض نموذج إنشاء الاختبار
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">إضافة اختبار جديد (صفحة جديدة)</h1>
          <p className="text-muted-foreground">أضف اختبارًا جديدًا ليتمكن الطلاب من التسجيل فيه</p>
        </div>

        {/* عرض رسالة الخطأ في حالة عدم اعتماد مركز الاختبار */}
        {approvalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه حالة الاعتماد</AlertTitle>
            <AlertDescription>
              {approvalError}
              <p className="mt-2">يرجى الانتظار حتى تتم الموافقة على طلب اعتماد مركز الاختبار الخاص بك قبل محاولة إضافة اختبارات جديدة.</p>
            </AlertDescription>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/TestingCenter/applications")}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                عرض حالة طلب الاعتماد
              </Button>
            </div>
          </Alert>
        )}

        <Card className={approvalError ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader className="pb-3">
            <CardTitle>معلومات الاختبار</CardTitle>
            <CardDescription>
              أدخل المعلومات الأساسية للاختبار الجديد
            </CardDescription>
            {approvalError && (
              <div className="mt-2 p-2 bg-muted rounded-sm">
                <p className="text-sm text-muted-foreground">
                  النموذج معطل حتى تتم الموافقة على طلب اعتماد مركز الاختبار الخاص بك.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
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
                          <Input 
                            placeholder="أدخل عنوان الاختبار" 
                            {...field} 
                            disabled={!!approvalError || isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          عنوان الاختبار الذي سيظهر للطلاب
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الاختبار</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!!approvalError || isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الاختبار" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="exam_theory">نظري</SelectItem>
                            <SelectItem value="exam_practical">عملي</SelectItem>
                            <SelectItem value="exam_both">نظري وعملي</SelectItem>
                            <SelectItem value="exam_skills">تقييم مهارات</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          نوع الاختبار الذي سيتم تقديمه
                        </FormDescription>
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
                          placeholder="أدخل وصفًا تفصيليًا للاختبار"
                          rows={4}
                          {...field}
                          disabled={!!approvalError || isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        وصف تفصيلي للاختبار وما يتضمنه من مواضيع ومهارات
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سعة الاختبار</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="أدخل الحد الأقصى لعدد المتقدمين"
                            {...field}
                            disabled={!!approvalError || isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          الحد الأقصى لعدد المتقدمين المسموح به في هذا الاختبار
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="examDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاريخ الاختبار</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-right font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!!approvalError || isPending}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ar })
                                ) : (
                                  <span>اختر تاريخ الاختبار</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={ar}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          التاريخ المقرر لإجراء الاختبار
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>موقع الاختبار</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل موقع إجراء الاختبار"
                          {...field}
                          disabled={!!approvalError || isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        الموقع التفصيلي الذي سيتم فيه إجراء الاختبار
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">إتاحة الاختبار للعامة</FormLabel>
                        <FormDescription>
                          حدد ما إذا كان الاختبار مرئيًا ومتاحًا للتسجيل للطلاب
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!!approvalError || isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/TestingCenter/exams")}
                    disabled={isPending}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={!!approvalError || isPending}
                    className="min-w-[120px]"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      "إنشاء الاختبار"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}