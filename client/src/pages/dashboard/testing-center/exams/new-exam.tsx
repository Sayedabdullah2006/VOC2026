import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// مخطط التحقق من صحة النموذج (يطابق مخطط قاعدة البيانات)
const examFormSchema = z.object({
  title: z.string().min(5, "عنوان الاختبار يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(10, "وصف الاختبار يجب أن يكون 10 أحرف على الأقل"),
  exam_type: z.string().min(1, "نوع الاختبار مطلوب"),
  capacity: z.number().min(1, "سعة الاختبار يجب أن تكون 1 على الأقل").or(z.string().transform(val => parseInt(val, 10))),
  location: z.string().min(5, "موقع الاختبار يجب أن يكون 5 أحرف على الأقل"),
  exam_date: z.string().min(1, "تاريخ الاختبار مطلوب"),
  is_visible: z.boolean().default(true)
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function NewExamPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // إعداد نموذج react-hook-form باستخدام Zod للتحقق
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      description: "",
      exam_type: "",
      capacity: 10,
      location: "",
      exam_date: "",
      is_visible: true
    }
  });

  // معالجة إرسال النموذج
  const onSubmit = async (data: ExamFormValues) => {
    try {
      // للتأكد من أن capacity هو رقم (حتى إذا كان المستخدم أدخله كنص)
      if (typeof data.capacity === 'string') {
        data.capacity = parseInt(data.capacity, 10);
      }

      console.log("بيانات الاختبار للإرسال:", data);

      // إرسال البيانات إلى واجهة برمجة التطبيقات (API)
      const response = await apiRequest('/api/exams', 'POST', data);

      toast({
        title: "تم إنشاء الاختبار بنجاح",
        description: "تمت إضافة الاختبار الجديد بنجاح",
      });

      // تحديث قائمة الاختبارات
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      
      // الانتقال إلى صفحة قائمة الاختبارات
      navigate("/dashboard/testing-center/exams");
    } catch (error: any) {
      console.error("خطأ في إنشاء الاختبار:", error);
      
      toast({
        title: "فشل إنشاء الاختبار",
        description: error.message || "حدث خطأ أثناء محاولة إنشاء الاختبار",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">إضافة اختبار جديد</CardTitle>
          <CardDescription>قم بتعبئة البيانات لإضافة اختبار جديد للطلاب</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="exam_type"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعة القصوى</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="أدخل السعة القصوى للاختبار" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
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
                        <Input placeholder="أدخل موقع الاختبار" {...field} />
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
                          type="text"
                          placeholder="أدخل تاريخ الاختبار (مثال: 2025-05-15 10:00:00)"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">صيغة التاريخ: YYYY-MM-DD HH:MM:SS</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_visible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none rtl:mr-3">
                        <FormLabel>ظاهر للطلاب</FormLabel>
                        <p className="text-sm text-gray-500">
                          تفعيل هذا الخيار سيجعل الاختبار مرئياً للطلاب
                        </p>
                      </div>
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
                        placeholder="أدخل وصفاً تفصيلياً للاختبار"
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/TestingCenter/exams")}
                >
                  إلغاء
                </Button>
                <Button type="submit">إنشاء الاختبار</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}