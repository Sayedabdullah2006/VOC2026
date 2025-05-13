import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema, type InsertCourse, type Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { z } from "zod";

export default function EditCoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
    onSuccess: (data) => {
      // بمجرد تحميل بيانات الدورة، نحاول استخراج البيانات من metadata
      try {
        if (data && data.metadata) {
          const parsedMetadata = typeof data.metadata === 'string' 
            ? JSON.parse(data.metadata) 
            : data.metadata;
          
          setMetadata(parsedMetadata);
          
          // تحديث قيم النموذج بالبيانات من metadata
          form.setValue('objectives', parsedMetadata.objectives || [""]);
          form.setValue('instructor', parsedMetadata.instructor || "");
          form.setValue('requirements', parsedMetadata.requirements || [""]);
          form.setValue('location', data.location || "");
        }
      } catch (error) {
        console.error('Error parsing course metadata:', error);
      }
    }
  });

  const form = useForm<InsertCourse & { objectives?: string[], instructor?: string, requirements?: string[] }>({
    resolver: zodResolver(insertCourseSchema.extend({
      objectives: z.array(z.string()).optional(),
      instructor: z.string().optional(),
      requirements: z.array(z.string()).optional(),
      location: z.string().optional(),
    })),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      capacity: 0,
      start_date: new Date(),
      end_date: new Date(),
      status: "مجدولة",
      training_center_id: user?.id || 0,
      location: "",
      objectives: [""],
      instructor: "",
      requirements: [""],
    },
  });

  // تحديث قيم النموذج عند تحميل بيانات الدورة
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        description: course.description || "",
        duration: course.duration || 0,
        capacity: course.capacity || 0,
        start_date: course.start_date ? new Date(course.start_date) : new Date(),
        end_date: course.end_date ? new Date(course.end_date) : new Date(),
        status: course.status || "مجدولة",
        training_center_id: user?.id || 0,
        location: course.location || "",
      });
    }
  }, [course, form]);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const onSubmit = async (values: InsertCourse & { objectives?: string[], instructor?: string, requirements?: string[] }) => {
    try {
      setIsSubmitting(true);
      console.log('Form values before submission:', values);

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

      const response = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
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
        throw new Error(errorData.message || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      console.log('Updated course:', updatedCourse);

      toast({
        title: "تم تحديث الدورة بنجاح",
        description: "تم تحديث معلومات الدورة التدريبية",
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation("/dashboard/courses");
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الدورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => setLocation("/dashboard/courses")}>
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للقائمة
            </Button>
            <div>
              <h1 className="text-3xl font-bold">تعديل الدورة التدريبية</h1>
              <p className="text-gray-600">
                تعديل معلومات الدورة التدريبية
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الدورة</CardTitle>
              <CardDescription>
                قم بتعديل المعلومات الأساسية للدورة التدريبية
              </CardDescription>
            </CardHeader>
            <CardContent>
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

                  {/* حقل أهداف الدورة */}
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

                  {/* حقل متطلبات الدورة */}
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
                    {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
