import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Define validation schema for certificate matching form
const submitSchema = z.object({
  courseName: z.string().min(1, { message: "اسم الدورة مطلوب" }),
  instituteName: z.string().min(1, { message: "اسم المعهد/المركز مطلوب" }),
  courseDate: z.date({ message: "تاريخ الدورة مطلوب" }),
  certificateFile: z.instanceof(File, { message: "ملف الشهادة مطلوب" })
    .refine(file => file.size <= 5 * 1024 * 1024, {
      message: "حجم الملف يجب أن يكون أقل من 5 ميجابايت"
    })
    .refine(file => 
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      { message: "الملف يجب أن يكون بصيغة PDF, JPEG, أو PNG" }
    ),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof submitSchema>;

const statusColors = {
  "تم تقديم الطلب": "secondary",
  "تحت المراجعة": "warning",
  "مطابقة": "success",
  "غير مطابقة": "destructive",
} as const;

type RequestStatus = keyof typeof statusColors;

interface CertificateMatchingRequest {
  id: number;
  courseName: string;
  instituteName: string;
  courseDate: string;
  submissionDate: string;
  reviewDate?: string;
  status: string;
  comments?: string;
  certificateFile: string;
  matchedCertificateId?: number;
}

export default function CertificateMatchingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      courseName: "",
      instituteName: "",
      comments: "",
    },
  });

  const watchFile = form.watch("certificateFile");

  useEffect(() => {
    if (watchFile && (watchFile instanceof File)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(watchFile);
    } else {
      setFilePreview(null);
    }
  }, [watchFile]);

  // Fetch user's certificate matching requests
  const { data: matchingRequests, isLoading } = useQuery<CertificateMatchingRequest[]>({
    queryKey: ['/api/certificate-matching'],
    queryFn: async () => {
      const response = await fetch('/api/certificate-matching');
      if (!response.ok) {
        throw new Error('فشل في جلب طلبات مطابقة الشهادات');
      }
      return response.json();
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting certificate matching request:', values);
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('courseName', values.courseName);
      formData.append('instituteName', values.instituteName);
      formData.append('courseDate', values.courseDate.toISOString());
      
      // Ensure certificateFile is properly appended
      if (values.certificateFile instanceof File) {
        formData.append('certificateFile', values.certificateFile, values.certificateFile.name);
        console.log('Appending certificate file:', values.certificateFile.name, values.certificateFile.type, values.certificateFile.size);
      } else {
        console.error('Certificate file is not a valid File object');
        throw new Error('ملف الشهادة غير صالح');
      }
      
      if (values.comments) {
        formData.append('comments', values.comments);
      }

      // Log formData contents for debugging
      // Note: Can't directly log FormData, but we can log what we're adding
      console.log('FormData prepared for submission');

      // Send request to the server
      const response = await fetch('/api/certificate-matching', {
        method: 'POST',
        body: formData,
        // Do not set Content-Type header - browser will set it with proper boundary
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'فشل في تقديم طلب مطابقة الشهادة');
      }

      // Success - clear form and refresh requests
      form.reset();
      setFilePreview(null);
      queryClient.invalidateQueries({ queryKey: ['/api/certificate-matching'] });
      
      // Use a custom success message with better styling
      const successMessage = document.createElement('div');
      successMessage.style.position = 'fixed';
      successMessage.style.top = '50%';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translate(-50%, -50%)';
      successMessage.style.backgroundColor = 'white';
      successMessage.style.padding = '20px 30px';
      successMessage.style.borderRadius = '8px';
      successMessage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      successMessage.style.zIndex = '9999';
      successMessage.style.textAlign = 'center';
      successMessage.style.direction = 'rtl';
      successMessage.style.minWidth = '300px';
      
      // Add content with site branding
      successMessage.innerHTML = `
        <div style="margin-bottom: 15px;">
          <h3 style="color: #1e40af; margin-bottom: 10px; font-size: 18px; font-weight: bold;">منصة التدريب المهني</h3>
          <p style="font-size: 16px; margin: 0;">تم تقديم طلب مطابقة الشهادة بنجاح</p>
        </div>
        <button id="okButton" style="background-color: #1d4ed8; color: white; border: none; border-radius: 4px; padding: 8px 20px; cursor: pointer; font-size: 14px;">موافق</button>
      `;
      
      document.body.appendChild(successMessage);
      
      // Remove the message when the user clicks the OK button
      document.getElementById('okButton')?.addEventListener('click', () => {
        document.body.removeChild(successMessage);
      });
    } catch (error) {
      console.error('Error submitting certificate matching request:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        heading="مطابقة الشهادات" 
        text="يمكنك هنا تقديم طلب مطابقة لشهادات الدورات من معاهد ومراكز خارجية"
        variant="gradient"
        icon={<FileText className="h-5 w-5" />}
        badge="خدمة إلكترونية"
      />

      {/* Submit form */}
      <Card className="shadow-md border border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            تقديم طلب مطابقة شهادة
          </CardTitle>
          <CardDescription>
            قم بتعبئة النموذج التالي لتقديم طلب مطابقة شهادة من مركز تدريب خارجي
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الدورة</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم الدورة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instituteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المعهد/المركز</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم المعهد أو المركز التدريبي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>تاريخ الدورة</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-right font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ar })
                              ) : (
                                <span>اختر تاريخ الدورة</span>
                              )}
                              <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificateFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>ملف الشهادة</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            id="certificateFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            {...fieldProps}
                          />
                          {filePreview && (
                            <div className="mt-2 border rounded-lg p-2 max-w-md">
                              {filePreview.startsWith('data:image') ? (
                                <img 
                                  src={filePreview} 
                                  alt="معاينة الشهادة" 
                                  className="max-h-40 mx-auto object-contain" 
                                />
                              ) : (
                                <div className="flex items-center justify-center h-20 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">
                                    تم تحميل ملف PDF (انقر لتحميل)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        قم بتحميل صورة أو ملف PDF للشهادة (الحد الأقصى 5 ميجابايت)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أي معلومات إضافية تود إضافتها حول الشهادة"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-auto"
              >
                {isSubmitting ? "جاري التقديم..." : "تقديم طلب المطابقة"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Previous requests */}
      <Card className="mt-8 shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            طلبات المطابقة السابقة
          </CardTitle>
          <CardDescription>
            سجل طلبات مطابقة الشهادات التي قمت بتقديمها سابقاً
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-center p-4">جاري تحميل الطلبات...</p>
          ) : !matchingRequests || matchingRequests.length === 0 ? (
            <p className="text-center p-4 text-muted-foreground">لم تقم بتقديم أي طلبات مطابقة بعد</p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4" dir="rtl">
                {/* Use reverse to display newest requests first */}
                {[...matchingRequests].reverse().map((request) => {
                  // Get the status variant safely with type assertion
                  let statusVariant: (typeof statusColors)[RequestStatus] = "secondary";
                  
                  if (request.status in statusColors) {
                    statusVariant = statusColors[request.status as RequestStatus];
                  }
                    
                  return (
                    <Card key={request.id} className="overflow-hidden text-right border-border/50 hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex flex-row-reverse justify-between items-start">
                          <Badge 
                            variant={statusVariant}
                            className="ms-0 me-0"
                          >
                            {request.status}
                          </Badge>
                          <div>
                            <CardTitle className="text-lg">{request.courseName}</CardTitle>
                            <CardDescription>{request.instituteName}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">تاريخ الدورة:</span>{" "}
                            {format(new Date(request.courseDate), "PPP", { locale: ar })}
                          </div>
                          <div>
                            <span className="text-muted-foreground">تاريخ التقديم:</span>{" "}
                            {format(new Date(request.submissionDate), "PPP", { locale: ar })}
                          </div>
                          {request.reviewDate && (
                            <div>
                              <span className="text-muted-foreground">تاريخ المراجعة:</span>{" "}
                              {format(new Date(request.reviewDate), "PPP", { locale: ar })}
                            </div>
                          )}
                        </div>
                        {request.comments && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">ملاحظات:</span>{" "}
                            {request.comments}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t p-4 flex gap-2 justify-end bg-muted/10">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/${request.certificateFile}`, '_blank')}
                        >
                          استعراض الشهادة المرفقة
                        </Button>
                        
                        {request.status === "مطابقة" && request.matchedCertificateId ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => window.open(`/student/certificates/view/${request.matchedCertificateId}`, '_blank')}
                          >
                            عرض شهادة المطابقة
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => window.location.href = `/certificate-matching/${request.id}`}
                          >
                            استعراض تفاصيل الطلب
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}