import { useState } from "react";
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
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function NewSimpleExamPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  
  // تهيئة نموذج إنشاء الاختبار
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      examType: "نظري", // تعيين قيمة افتراضية لنوع الاختبار
      capacity: 20,
      location: "",
      isVisible: true,
    },
  });

  // وظيفة إنشاء الاختبار
  const createExam = useMutation({
    mutationFn: async (data: ExamFormValues) => {
      try {
        setSubmitting(true);
        
        // تنسيق البيانات للإرسال إلى الخادم بشكل مطابق لأسماء الجداول في قاعدة البيانات
        const formattedData = {
          title: data.title,
          description: data.description,
          capacity: data.capacity,
          location: data.location,
          exam_type: data.examType, // استخدام اسم الحقل كما هو معرف في قاعدة البيانات
          exam_date: data.examDate instanceof Date ? data.examDate.toISOString() : data.examDate,
          is_visible: data.isVisible,
          testing_center_id: user?.id || 55,
          registered_candidates: 0,
          status: "قادم",
        };
        
        console.log("بيانات الاختبار للإرسال:", formattedData);
        
        // إرسال البيانات إلى الخادم
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
      } finally {
        setSubmitting(false);
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
      
      toast({
        title: "خطأ في إنشاء الاختبار",
        description: error.message || "حدث خطأ أثناء محاولة إنشاء الاختبار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  });

  // تقديم النموذج
  const onSubmit = (values: ExamFormValues) => {
    console.log("القيم المقدمة:", values);
    createExam.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="md:grid md:grid-cols-4 gap-6">
          <div className="col-span-4 md:col-span-3">
            <div className="bg-card shadow rounded-md">
              <div className="border-b p-4">
                <h2 className="text-2xl font-bold">إضافة اختبار جديد</h2>
                <p className="text-gray-500">
                  أدخل معلومات الاختبار الجديد ليتم إضافته إلى قائمة الاختبارات المتاحة
                </p>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* عنوان الاختبار */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الاختبار</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: اختبار القيادة النظري" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            عنوان واضح ومختصر للاختبار
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* وصف الاختبار */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الاختبار</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="وصف تفصيلي للاختبار ومتطلباته" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            وصف شامل للاختبار ومتطلباته والمعلومات الهامة للمتقدمين
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* نوع الاختبار */}
                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الاختبار</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الاختبار" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="نظري">نظري</SelectItem>
                              <SelectItem value="عملي">عملي</SelectItem>
                              <SelectItem value="شامل">شامل (نظري وعملي)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            نوع الاختبار الذي سيتم إجراؤه
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* سعة الاختبار */}
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
                                placeholder="عدد المتقدمين المسموح" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              العدد الأقصى للمتقدمين المسموح لهم بالتسجيل
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* موقع الاختبار */}
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>موقع الاختبار</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="مثال: مركز التدريب الرئيسي - الرياض" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              الموقع الذي سيتم فيه إجراء الاختبار
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* تاريخ الاختبار */}
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
                                    "w-full pl-3 text-right font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
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
                                locale={ar}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            تاريخ إجراء الاختبار
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* إظهار الاختبار في القائمة */}
                    <FormField
                      control={form.control}
                      name="isVisible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">إظهار الاختبار في القائمة</FormLabel>
                            <FormDescription>
                              إذا كان مفعلاً، سيظهر الاختبار في قائمة الاختبارات المتاحة للطلاب
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 border-t flex justify-end space-x-2 space-x-reverse">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/TestingCenter/exams")}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        type="submit"
                        disabled={submitting || createExam.isPending}
                      >
                        {(submitting || createExam.isPending) && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                        إنشاء الاختبار
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
          <div className="col-span-4 md:col-span-1 mt-6 md:mt-0">
            <div className="bg-card shadow rounded-md p-4">
              <h3 className="text-lg font-bold border-b pb-2">نصائح</h3>
              <div className="pt-2 space-y-4">
                <div>
                  <h4 className="font-medium">عنوان واضح</h4>
                  <p className="text-sm text-gray-500">
                    استخدم عنواناً واضحاً ومختصراً يصف الاختبار بدقة
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">وصف شامل</h4>
                  <p className="text-sm text-gray-500">
                    اشرح تفاصيل الاختبار ومتطلباته والأشياء التي يجب على المتقدمين معرفتها
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">تاريخ مناسب</h4>
                  <p className="text-sm text-gray-500">
                    اختر تاريخاً مناسباً مع مراعاة إتاحة وقت كافٍ للمتقدمين للتسجيل
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}