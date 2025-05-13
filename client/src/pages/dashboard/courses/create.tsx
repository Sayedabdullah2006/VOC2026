import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import { PlusCircle, AlertCircle, Trash, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, type InsertCourse, CourseStatus, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";

export default function CreateCoursePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // التحقق من وجود طلب مركز تدريب معتمد للمستخدم
  const { data: applications = [], isLoading: isApplicationsLoading } = useQuery({
    queryKey: [`/api/training-center-applications/user/${user?.id}`],
    enabled: !!user && user.role === UserRole.TRAINING_CENTER,
    retry: 1,
    onError: (error) => {
      console.error('Error fetching training center applications:', error);
    }
  });
  
  // تحديد ما إذا كان المركز معتمد (لديه طلب بحالة "مقبول")
  const hasApprovedApplication = Array.isArray(applications) && applications.some((app: any) => app.status === 'مقبول');
  
  // إعادة التوجيه إلى لوحة التحكم إذا لم يكن المستخدم مركز تدريب معتمد
  useEffect(() => {
    if (!isApplicationsLoading && user?.role === UserRole.TRAINING_CENTER && !hasApprovedApplication) {
      toast({
        title: "غير مسموح",
        description: "لا يمكن إضافة دورات تدريبية، يجب أن يكون لديك طلب مركز تدريب معتمد أولاً",
        variant: "destructive",
      });
      // إعادة التوجيه إلى لوحة التحكم بعد ثانيتين
      const redirectTimer = setTimeout(() => {
        setLocation("/dashboard/courses");
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isApplicationsLoading, user, hasApprovedApplication, toast, setLocation]);

  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema.extend({
      objectives: z.array(z.string()).optional(),
      instructor: z.string().optional(),
      requirements: z.array(z.string()).optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      capacity: 0,
      start_date: new Date(),
      end_date: new Date(),
      status: CourseStatus.SCHEDULED,
      training_center_id: user?.id || 0,
      location: "",
      objectives: [""],
      instructor: "",
      requirements: [""],
    },
  });

  const onSubmit = async (values: InsertCourse & { objectives?: string[], instructor?: string, requirements?: string[] }) => {
    try {
      setIsSubmitting(true);
      console.log('Form values before submission:', values);
      
      // التحقق من وجود طلب معتمد قبل إضافة دورة
      if (!hasApprovedApplication) {
        toast({
          title: "غير مسموح",
          description: "لا يمكن إضافة دورة تدريبية. يجب أن يكون لديك طلب مركز تدريب معتمد أولاً.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // تنقية المصفوفات من القيم الفارغة
      const cleanObjectives = values.objectives?.filter(obj => obj.trim() !== '') || [];
      const cleanRequirements = values.requirements?.filter(req => req.trim() !== '') || [];

      // إعداد القيم مع تضمين البيانات الإضافية كـ metadata
      const formattedValues = {
        ...values,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        // تخزين الحقول الإضافية التي لا توجد في المخطط الأساسي كـ metadata
        metadata: JSON.stringify({
          objectives: cleanObjectives,
          instructor: values.instructor || '',
          requirements: cleanRequirements
        })
      };

      // حذف الحقول الإضافية من الكائن الرئيسي لتجنب أخطاء التحقق
      delete formattedValues.objectives;
      delete formattedValues.instructor;
      delete formattedValues.requirements;

      console.log('Formatted values:', formattedValues);

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create course');
      }

      const newCourse = await response.json();
      console.log('Created course:', newCourse);

      toast({
        title: "تم إنشاء الدورة بنجاح",
        description: "تم إضافة الدورة التدريبية إلى قائمة الدورات الخاصة بك",
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation("/dashboard/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الدورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إضافة دورة تدريبية جديدة</h1>
              <p className="text-gray-600">
                قم بإدخال تفاصيل الدورة التدريبية الجديدة
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الدورة</CardTitle>
              <CardDescription>
                يرجى إدخال المعلومات الأساسية للدورة التدريبية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isApplicationsLoading ? (
                <div className="flex justify-center p-6">
                  <p className="text-gray-600">جاري التحميل...</p>
                </div>
              ) : !hasApprovedApplication ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>غير مسموح</AlertTitle>
                  <AlertDescription>
                    لا يمكن إضافة دورات تدريبية، يجب أن يكون لديك طلب مركز تدريب معتمد أولاً
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الدورة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل عنوان الدورة" />
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
                          <FormLabel>وصف الدورة</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="اكتب وصفاً تفصيلياً للدورة"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مدة الدورة (بالساعات)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                            <FormLabel>السعة</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ بدء الدورة</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={formatDateForInput(field.value)}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ انتهاء الدورة</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={formatDateForInput(field.value)}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
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
                          <FormLabel>موقع الدورة</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="أدخل موقع الدورة (مدينة، حي، شارع، الخ)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدرب / المحاضر</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="أدخل اسم المدرب"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel className="block mb-2">أهداف الدورة</FormLabel>
                      <div className="space-y-2">
                        {form.watch('objectives')?.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`objectives.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1 mb-0">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder={`الهدف ${index + 1}`} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const currentObjectives = form.getValues('objectives') || [];
                                if (currentObjectives.length > 1) {
                                  const newObjectives = [...currentObjectives];
                                  newObjectives.splice(index, 1);
                                  form.setValue('objectives', newObjectives);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const currentObjectives = form.getValues('objectives') || [];
                            form.setValue('objectives', [...currentObjectives, '']);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة هدف جديد
                        </Button>
                      </div>
                    </div>

                    <div>
                      <FormLabel className="block mb-2">متطلبات الدورة</FormLabel>
                      <div className="space-y-2">
                        {form.watch('requirements')?.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`requirements.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1 mb-0">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder={`المتطلب ${index + 1}`} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const currentRequirements = form.getValues('requirements') || [];
                                if (currentRequirements.length > 1) {
                                  const newRequirements = [...currentRequirements];
                                  newRequirements.splice(index, 1);
                                  form.setValue('requirements', newRequirements);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const currentRequirements = form.getValues('requirements') || [];
                            form.setValue('requirements', [...currentRequirements, '']);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة متطلب جديد
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "جاري الإضافة..." : "إضافة الدورة"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}