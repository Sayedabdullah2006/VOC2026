import { useState, useEffect } from "react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Building2, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertTrainingCenterApplicationSchema, type SaudiRegion, type SaudiCity } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";

// Create a more specific schema for the form
const formSchema = insertTrainingCenterApplicationSchema
  .omit({ userId: true, submittedAt: true, status: true })
  .extend({
    centerName: z.string().min(1, "اسم المركز مطلوب"),
    managerName: z.string().min(1, "اسم المدير مطلوب"),
    address: z.string().min(1, "العنوان مطلوب"),
    // تغيير الحقول لتكون اختيارية لتتوافق مع التغييرات في الخادم
    regionId: z.string().optional(),
    cityId: z.string().optional(),
    // حقول المنطقة والمدينة مطلوبة في قاعدة البيانات
    city: z.string().min(1, "المدينة مطلوبة"),
    region: z.string().optional(),
    // إضافة حقول لتخزين أسماء المناطق والمدن (للعرض فقط)
    regionName: z.string().optional(),
    cityName: z.string().optional(),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    type: z.literal('testing_center') // تعديل النوع ليكون مركز اختبار
  });

type FormValues = z.infer<typeof formSchema>;

type FileState = {
  commercialRecord: File | null;
  financialGuarantee: File | null;
  identityDocuments: File | null;
};

// Extended form values type with region and city name fields
type ExtendedFormValues = FormValues & {
  regionName?: string; // اسم المنطقة بالعربية
  cityName?: string;   // اسم المدينة بالعربية
  submittedAt?: string; // وقت تقديم الطلب
  status?: string; // حالة الطلب
  userId?: number; // معرف المستخدم
};

// Using SaudiRegion and SaudiCity types from schema
const formatApplicationId = (id: number): string => {
  const idStr = id.toString();
  if (idStr.length >= 11) {
    const year = idStr.slice(0, 4);
    const month = idStr.slice(4, 6);
    const day = idStr.slice(6, 8);
    const sequence = idStr.slice(8);
    return `${year}${month}${day}-${sequence}`;
  }
  return idStr;
};

export default function TestingCenterRegistrationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registered, setRegistered] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [files, setFiles] = useState<FileState>({
    commercialRecord: null,
    financialGuarantee: null,
    identityDocuments: null,
  });
  const [regions, setRegions] = useState<SaudiRegion[]>([]);
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");

  // أهم تغيير: إعداد نموذج التسجيل قبل أي عمليات استعلام أو شروط عودة
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      centerName: "", // اسم المركز
      managerName: "", // اسم المدير
      address: "", // العنوان التفصيلي
      regionId: "", // معرف المنطقة (سيتم تحويله إلى رقم عند الإرسال)
      cityId: "", // معرف المدينة (سيتم تحويله إلى رقم عند الإرسال)
      city: "", // اسم المدينة (مطلوب في قاعدة البيانات)
      region: "", // رمز المنطقة (مطلوب في قاعدة البيانات)
      regionName: "", // اسم المنطقة بالعربية (للعرض)
      cityName: "", // اسم المدينة بالعربية (للعرض)
      phone: "", // رقم الهاتف
      email: "", // البريد الإلكتروني
      type: 'testing_center' // نوع المركز (تم تعديله ليكون مركز اختبار)
    },
  });
  
  // تعريف registerMutation قبل أي شروط أو عمليات عودة
  const registerMutation = useMutation({
    mutationFn: async (data: ExtendedFormValues) => {
      console.log('بدء تنفيذ registerMutation');
      
      // التحقق من الحقول الرئيسية
      const requiredFields = ['centerName', 'managerName', 'address', 'phone', 'email'];
      for (const field of requiredFields) {
        if (!data[field as keyof FormValues]) {
          console.error(`خطأ: الحقل ${field} مطلوب`);
          throw new Error(`حقل ${field} مطلوب`);
        }
      }
      
      // فحص صحة المنطقة والمدينة
      if (!data.regionId && !data.region) {
        console.error('خطأ: لم يتم اختيار منطقة');
        throw new Error("يرجى اختيار المنطقة");
      }
      
      if (!data.cityId && !data.city) {
        console.error('خطأ: لم يتم اختيار مدينة');
        throw new Error("يرجى اختيار المدينة");
      }
      
      // التحقق من وجود الملفات المطلوبة
      if (!files.commercialRecord || !files.financialGuarantee || !files.identityDocuments) {
        console.error('خطأ: بعض الملفات المطلوبة غير موجودة', {
          commercialRecord: !!files.commercialRecord,
          financialGuarantee: !!files.financialGuarantee,
          identityDocuments: !!files.identityDocuments
        });
        throw new Error("جميع المستندات المطلوبة يجب رفعها");
      }

      console.log('جميع الملفات المطلوبة موجودة');
      
      // إنشاء كائن FormData جديد
      const formData = new FormData();

      // مسح وطباعة بيانات النموذج قبل المعالجة
      console.log('بيانات النموذج قبل المعالجة:', data);

      // إضافة جميع البيانات من النموذج بشكل دقيق
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null && value !== '') {
          // تحويل البيانات إلى نصوص
          formData.append(key, String(value));
          console.log(`تمت إضافة حقل للنموذج: ${key} = ${value}`);
        }
      }

      // إضافة معرف المستخدم واسم المستخدم
      if (user?.id) {
        formData.append('userId', String(user.id));
        console.log(`تمت إضافة معرف المستخدم: ${user.id}`);
        
        // إضافة اسم المستخدم للتوثيق الإضافي
        if (user.username) {
          formData.append('username', user.username);
          console.log(`تمت إضافة اسم المستخدم: ${user.username}`);
        }
      } else {
        console.error('خطأ: معرف المستخدم غير موجود', user);
        throw new Error("حدث خطأ في معلومات المستخدم، يرجى تسجيل الدخول مرة أخرى");
      }

      // إضافة الملفات
      try {
        if (files.commercialRecord) {
          formData.append('commercialRecord', files.commercialRecord);
          console.log(`تمت إضافة ملف السجل التجاري: ${files.commercialRecord.name}`);
        }
        
        if (files.financialGuarantee) {
          formData.append('financialGuarantee', files.financialGuarantee);
          console.log(`تمت إضافة ملف الضمان المالي: ${files.financialGuarantee.name}`);
        }
        
        if (files.identityDocuments) {
          formData.append('identityDocuments', files.identityDocuments);
          console.log(`تمت إضافة ملف وثائق الهوية: ${files.identityDocuments.name}`);
        }
      } catch (error) {
        console.error('خطأ في إضافة الملفات:', error);
        throw new Error("حدث خطأ في معالجة الملفات المرفقة");
      }
      
      // إضافة معلومات المنطقة والمدينة
      if (data.regionName) {
        formData.append('regionName', data.regionName);
        console.log(`تمت إضافة اسم المنطقة: ${data.regionName}`);
      }
      
      if (data.cityName) {
        formData.append('cityName', data.cityName);
        console.log(`تمت إضافة اسم المدينة: ${data.cityName}`);
      }
      
      // إضافة معلومات إضافية
      formData.append('submittedAt', new Date().toISOString());
      formData.append('status', 'تحت المراجعة');

      // تسجيل محتويات FormData
      console.log('محتويات FormData:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`${key}: ملف (${value.name}, ${value.type}, ${value.size} بايت)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });

      console.log('جاري إرسال البيانات إلى الخادم...');
      try {
        const response = await apiRequest("POST", "/api/training-center-applications", formData);
        console.log('استجابة الخادم:', response.status, response.statusText);
        
        // فحص محتوى الاستجابة لتشخيص المشكلة بشكل أفضل
        const responseText = await response.text();
        console.log('نص الاستجابة:', responseText);
        
        // إعادة تحليل النص كـ JSON إذا كان ذلك ممكنًا
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('بيانات الاستجابة:', responseData);
        } catch (e) {
          console.log('لا يمكن تحليل الاستجابة كـ JSON');
        }
        
        if (!response.ok) {
          const errorMsg = responseData?.message || "حدث خطأ أثناء تقديم الطلب";
          console.error('خطأ في الاستجابة:', errorMsg);
          throw new Error(errorMsg);
        }
        
        return responseData || { success: true };
      } catch (error) {
        console.error('خطأ أثناء إرسال الطلب:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('تم تقديم الطلب بنجاح:', data);
      
      if (data.id) {
        setApplicationId(data.id);
        toast({
          title: "تم تقديم الطلب بنجاح",
          description: `رقم الطلب: ${formatApplicationId(data.id)}. سيتم مراجعة الطلب من قبل الإدارة وإبلاغك بالنتيجة.`,
        });
        setRegistered(true);
      } else {
        toast({
          title: "تم استلام الطلب",
          description: "تم استلام طلبك بنجاح وسيتم مراجعته قريبًا.",
        });
      }
    },
    onError: (error: Error) => {
      console.error('خطأ في معالجة الطلب:', error);
      toast({
        title: "حدث خطأ",
        description: error.message || "فشل في تقديم الطلب، يرجى المحاولة مرة أخرى لاحقًا",
        variant: "destructive",
      });
    },
  });

  // Query existing applications
  const { data: existingApplications, isLoading: isLoadingApplications } = useQuery({
    queryKey: [`/api/training-center-applications/user/${user?.id}`],
    enabled: !!user,
    queryFn: async () => {
      console.log('جاري التحقق من وجود طلبات سابقة للمستخدم:', user?.id);
      const response = await apiRequest("GET", `/api/training-center-applications/user/${user?.id}`);
      const data = await response.json();
      console.log('طلبات المستخدم الحالية:', data);
      return data;
    }
  });
  
  // Fetch regions data
  const { data: regionsData, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      console.log('جاري جلب بيانات المناطق...');
      const response = await apiRequest("GET", "/api/regions");
      const data = await response.json();
      console.log('تم استلام بيانات المناطق:', data.length, 'منطقة');
      return data;
    }
  });
  
  // Fetch cities for the selected region
  const { data: citiesData, isLoading: isLoadingCities, refetch: refetchCities } = useQuery({
    queryKey: ['/api/regions', selectedRegionId, 'cities'],
    enabled: !!selectedRegionId,
    queryFn: async () => {
      console.log('جاري جلب بيانات المدن للمنطقة رقم:', selectedRegionId);
      try {
        const response = await fetch(`/api/regions/${selectedRegionId}/cities`);
        if (!response.ok) {
          console.error('خطأ في استجابة جلب المدن:', response.status, response.statusText);
          throw new Error(`فشل جلب المدن: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('تم استلام بيانات المدن:', data.length, 'مدينة', data);
        
        if (Array.isArray(data) && data.length > 0) {
          return data;
        } else {
          console.warn('تم استلام مصفوفة فارغة أو بيانات غير صحيحة للمدن');
          return [];
        }
      } catch (error) {
        console.error('خطأ في جلب المدن:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب قائمة المدن. يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
        return [];
      }
    }
  });
  
  // Update regions and cities state when data is fetched
  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData);
    }
  }, [regionsData]);
  
  useEffect(() => {
    if (citiesData) {
      setCities(citiesData);
    }
  }, [citiesData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FileState) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      console.log('بدء تقديم النموذج:', formData);
      
      // التحقق من وجود المستخدم وبياناته
      if (!user || !user.id) {
        console.error('خطأ: معلومات المستخدم غير متوفرة', user);
        toast({
          title: "خطأ في بيانات المستخدم",
          description: "يرجى تسجيل الدخول مرة أخرى وإعادة المحاولة",
          variant: "destructive",
        });
        return;
      }
      
      // التحقق من الملفات قبل الإرسال
      if (!files.commercialRecord || !files.financialGuarantee || !files.identityDocuments) {
        console.error('خطأ: الملفات المطلوبة غير موجودة', files);
        toast({
          title: "الملفات مطلوبة",
          description: "يرجى رفع جميع المستندات المطلوبة",
          variant: "destructive",
        });
        return;
      }
      
      // فحص إضافي للمنطقة والمدينة
      if ((!formData.regionId && !formData.region) || (!formData.cityId && !formData.city)) {
        console.error('خطأ: المنطقة أو المدينة غير محددة', { 
          regionId: formData.regionId, 
          region: formData.region,
          cityId: formData.cityId,
          city: formData.city
        });
        toast({
          title: "بيانات ناقصة",
          description: "يرجى تحديد المنطقة والمدينة",
          variant: "destructive",
        });
        return;
      }
      
      // الحصول على أسماء المنطقة والمدينة إذا كانت المعرفات متوفرة
      let regionInfo = null;
      let cityInfo = null;
      
      // تحقق من توفر معرفات المنطقة والمدينة للبحث عن المعلومات المفصلة
      if (formData.regionId) {
        regionInfo = regions.find(region => region.id.toString() === formData.regionId);
        console.log('تم العثور على معلومات المنطقة:', regionInfo);
      }
      
      if (formData.cityId) {
        cityInfo = cities.find(city => city.id.toString() === formData.cityId);
        console.log('تم العثور على معلومات المدينة:', cityInfo);
      }
      
      // إعداد البيانات للإرسال
      const extendedData: ExtendedFormValues = {
        ...formData,
        // إضافة اسماء المنطقة والمدينة إذا كانت متوفرة
        regionName: regionInfo?.nameAr || formData.regionName,
        cityName: cityInfo?.nameAr || formData.cityName,
      };
      
      console.log('إرسال البيانات للخادم:', extendedData);
      await registerMutation.mutateAsync(extendedData);
      
    } catch (error) {
      console.error('حدث خطأ أثناء معالجة النموذج:', error);
    }
  };

  // تحديث شرط التحقق من الطلبات السابقة - السماح بتقديم طلب جديد في حالة وجود طلب مقبول أو مرفوض
  const pendingApplication = Array.isArray(existingApplications) ? existingApplications.find(
    (app: any) => app.type === "testing_center" && (
      app.status === "تحت المراجعة" ||
      app.status === "زيارة ميدانية" ||
      app.status === "تحت التقييم"
    )
  ) : null;

  if (registered) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <Building2 className="w-16 h-16 mx-auto text-primary" />
              <h1 className="text-2xl font-bold mt-4">تم تقديم طلب اعتماد مركز الاختبار بنجاح!</h1>
              <p className="text-gray-600 mt-2">
                تم استلام طلبك وسيتم مراجعته من قبل الإدارة خلال 3-5 أيام عمل.
              </p>
              {applicationId && (
                <p className="text-gray-700 font-medium mt-4">
                  رقم الطلب: {formatApplicationId(applicationId)}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/TestingCenter/applications">
                <Button>عرض الطلبات</Button>
              </Link>
              <Link href="/TestingCenter/dashboard">
                <Button variant="outline">العودة للرئيسية</Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // إذا كان هناك طلب سابق قيد المراجعة، نعرض رسالة مناسبة
  if (pendingApplication) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <div className="max-w-3xl mx-auto">
            <Link href="/TestingCenter/applications">
              <Button variant="ghost" className="mb-4">
                <ChevronRight className="h-4 w-4 ml-2" />
                العودة للطلبات
              </Button>
            </Link>
            <Alert>
              <AlertDescription className="space-y-4">
                <p>
                  لديك بالفعل طلب اعتماد مركز اختبار قيد المراجعة.
                </p>
                <p>
                  رقم الطلب: {formatApplicationId(pendingApplication.id)}
                </p>
                <p>
                  لا يمكنك تقديم طلب جديد حتى يتم مراجعة الطلب الحالي.
                </p>
                <div className="mt-4">
                  <Link href={`/TestingCenter/applications/${pendingApplication.id}`}>
                    <Button>عرض تفاصيل الطلب</Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <Link href="/TestingCenter/applications">
            <Button variant="ghost" className="mb-4">
              <ChevronRight className="h-4 w-4 ml-2" />
              العودة للطلبات
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>طلب اعتماد مركز اختبار</CardTitle>
              <CardDescription>
                يرجى تعبئة النموذج بالمعلومات المطلوبة ورفع المستندات اللازمة لتقديم طلب اعتماد مركز اختبار جديد.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">معلومات المركز</h3>
                    
                    <FormField
                      control={form.control}
                      name="centerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم مركز الاختبار</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم المركز" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="managerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المدير المسؤول</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم المدير" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="regionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المنطقة</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedRegionId(value);
                                // عند تغيير المنطقة، نجد اسمها ونضيف قيمة حقل المنطقة
                                const region = regions.find(r => r.id.toString() === value);
                                if (region) {
                                  form.setValue('region', value);
                                  form.setValue('regionName', region.nameAr);
                                }
                                // نقوم بمسح المدينة المحددة سابقًا
                                form.setValue('cityId', '');
                                form.setValue('city', '');
                                form.setValue('cityName', '');
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المنطقة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.id} value={region.id.toString()}>
                                    {region.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المدينة</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // عند تغيير المدينة، نجد اسمها ونضيف قيمة حقل المدينة
                                const city = cities.find(c => c.id.toString() === value);
                                if (city) {
                                  form.setValue('city', value);
                                  form.setValue('cityName', city.nameAr);
                                }
                              }}
                              disabled={!selectedRegionId || isLoadingCities}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue 
                                    placeholder={
                                      !selectedRegionId 
                                        ? "اختر المنطقة أولاً" 
                                        : isLoadingCities 
                                          ? "جاري تحميل المدن..." 
                                          : "اختر المدينة"
                                    } 
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities && cities.length > 0 ? (
                                  cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id.toString()}>
                                      {city.nameAr || city.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-cities" disabled>
                                    {isLoadingCities ? "جاري تحميل المدن..." : "لا توجد مدن متاحة"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان التفصيلي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل العنوان التفصيلي" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="05xxxxxxxx" type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="example@domain.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">المستندات المطلوبة</h3>
                    
                    <FormItem>
                      <FormLabel>السجل التجاري</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(e, "commercialRecord")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </FormControl>
                      {files.commercialRecord && (
                        <p className="text-xs text-green-600">
                          تم اختيار: {files.commercialRecord.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel>وثيقة الضمان المالي</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(e, "financialGuarantee")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </FormControl>
                      {files.financialGuarantee && (
                        <p className="text-xs text-green-600">
                          تم اختيار: {files.financialGuarantee.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel>وثائق الهوية</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(e, "identityDocuments")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </FormControl>
                      {files.identityDocuments && (
                        <p className="text-xs text-green-600">
                          تم اختيار: {files.identityDocuments.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  </div>
                  
                  <Button type="submit" disabled={registerMutation.isPending || isLoadingApplications}>
                    {registerMutation.isPending ? "جاري تقديم الطلب..." : "تقديم طلب الاعتماد"}
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