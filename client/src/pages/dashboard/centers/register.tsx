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
    type: z.literal('training_center') // إضافة حقل النوع
  });

type FormValues = z.infer<typeof formSchema>;

type FileState = {
  commercialRecord: File | null;
  financialGuarantee: File | null;
  identityDocuments: File | null;
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

export default function CenterRegistrationPage() {
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
    queryKey: ['/api/regions/cities', selectedRegionId],
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
        return data;
      } catch (error) {
        console.error('خطأ أثناء جلب المدن:', error);
        throw error;
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

  // تحديث شرط التحقق من الطلبات السابقة - السماح بتقديم طلب جديد في حالة وجود طلب مقبول أو مرفوض
  const pendingApplication = Array.isArray(existingApplications) ? existingApplications.find(
    (app: any) => app.status === "تحت المراجعة" ||
                  app.status === "زيارة ميدانية" ||
                  app.status === "تحت التقييم"
  ) : null;

  // إذا كان هناك طلب سابق قيد المراجعة أو مقبول، نعرض رسالة مناسبة
  if (pendingApplication) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <div className="max-w-3xl mx-auto">
            <Link href="/dashboard/centers/applications">
              <Button variant="ghost" className="mb-4">
                <ChevronRight className="h-4 w-4 ml-2" />
                العودة للطلبات
              </Button>
            </Link>
            <Alert>
              <AlertDescription className="space-y-4">
                <p>
                  لديك بالفعل طلب تسجيل مركز تدريب قيد المراجعة.
                </p>
                <p>
                  رقم الطلب: {formatApplicationId(pendingApplication.id)}
                </p>
                <p>
                  لا يمكنك تقديم طلب جديد حتى يتم مراجعة الطلب الحالي.
                </p>
                <div className="mt-4">
                  <Link href={`/dashboard/centers/applications/${pendingApplication.id}`}>
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

  // إعداد نموذج التسجيل مع القيم الافتراضية
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
      type: 'training_center' // نوع المركز (ثابت)
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FileState) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  // Extended form values type with region and city name fields
  type ExtendedFormValues = FormValues & {
    regionName?: string; // اسم المنطقة بالعربية
    cityName?: string;   // اسم المدينة بالعربية
    submittedAt?: string; // وقت تقديم الطلب
    status?: string; // حالة الطلب
    userId?: number; // معرف المستخدم
  };

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
      
      // إضافة أسماء المنطقة والمدينة للنموذج إذا لم تكن موجودة
      if (regionInfo && !formData.regionName) {
        formData.regionName = regionInfo.nameAr;
      }
      
      if (cityInfo && !formData.cityName) {
        formData.cityName = cityInfo.nameAr;
      }
      
      console.log('معلومات المنطقة والمدينة المختارة:', {
        region: regionInfo?.nameAr || formData.region || 'غير محدد',
        regionId: formData.regionId || 'غير محدد',
        city: cityInfo?.nameAr || formData.city || 'غير محدد',
        cityId: formData.cityId || 'غير محدد'
      });
      
      // تحويل معرفات المنطقة والمدينة إلى أرقام (إذا كانت متوفرة)
      let regionId = 0;
      let cityId = 0;
      
      if (formData.regionId) {
        regionId = parseInt(formData.regionId);
        if (isNaN(regionId)) {
          console.error('خطأ في تحويل معرف المنطقة إلى رقم', { regionId: formData.regionId });
          toast({
            title: "خطأ في البيانات",
            description: "حدث خطأ في معالجة بيانات المنطقة",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (formData.cityId) {
        cityId = parseInt(formData.cityId);
        if (isNaN(cityId)) {
          console.error('خطأ في تحويل معرف المدينة إلى رقم', { cityId: formData.cityId });
          toast({
            title: "خطأ في البيانات",
            description: "حدث خطأ في معالجة بيانات المدينة",
            variant: "destructive",
          });
          return;
        }
      }
      
      // إنشاء كائن بيانات محسّن لإرساله إلى الخادم
      // تحذير: لا نستخدم regionId أو cityId أو regionName لأنها تسبب أخطاء في قاعدة البيانات
      const { regionId: _regionId, cityId: _cityId, regionName: _regionName, ...cleanFormData } = formData;
      
      const enrichedFormData = {
        ...cleanFormData,
        // نعيّن فقط الحقول المتوافقة مع هيكل قاعدة البيانات
        
        // تحديد حقل city الإلزامي في قاعدة البيانات (اسم المدينة بالعربية)
        city: cityInfo?.nameAr || formData.city || '',
        
        // إضافة حقل region إذا كان متاحاً
        region: regionInfo?.nameAr || formData.region || '',
        
        // تأكيد أن نوع الطلب هو مركز تدريب
        type: 'training_center' as const,
        
        // إضافة وقت التقديم
        submittedAt: new Date().toISOString(),
        
        // إضافة حالة الطلب
        status: 'تحت المراجعة' as const,
        
        // معلومات الملفات ستضاف لاحقًا عند بناء FormData
      };
      
      console.log('بيانات النموذج المحسنة:', enrichedFormData);
      
      // تسجيل معلومات الطلب
      console.log('جاري إرسال طلب لـ:', user.username);
      console.log('معرف المستخدم:', user.id);
      
      // إرسال البيانات إلى الخادم باستخدام mutation
      await registerMutation.mutateAsync(enrichedFormData);
      
      console.log('تم إرسال البيانات بنجاح');
    } catch (error) {
      console.error('خطأ في تقديم النموذج:', error);
      toast({
        title: "فشل تقديم الطلب",
        description: typeof error === 'string' ? error : error instanceof Error ? error.message : "حدث خطأ غير معروف أثناء تقديم الطلب",
        variant: "destructive",
      });
    }
  };

  // Function to handle region change
  const handleRegionChange = (regionId: string) => {
    console.log('تم تغيير المنطقة إلى:', regionId);
    
    // تعيين المنطقة المختارة
    setSelectedRegionId(regionId);
    form.setValue('regionId', regionId);
    
    // تحديث حقل region للتوافق مع متطلبات الخادم
    const selectedRegion = regions.find(region => region.id.toString() === regionId);
    if (selectedRegion) {
      console.log('تم العثور على المنطقة:', selectedRegion.nameAr);
      // تحديث حقول المنطقة المطلوبة للتحقق من صحة النموذج
      form.setValue('regionName', selectedRegion.nameAr);
      // حفظ قيمة المنطقة (نستخدم الاسم العربي للمنطقة وليس المعرف)
      form.setValue('region', selectedRegion.nameAr);
    } else {
      console.warn('لم يتم العثور على المنطقة برقم المعرف:', regionId);
    }
    
    // إعادة تعيين حقول المدينة عند تغيير المنطقة
    form.setValue('cityId', '');
    form.setValue('city', ''); // مسح حقل city المطلوب في قاعدة البيانات
    setCities([]); // تفريغ قائمة المدن القديمة فورًا
    
    // إعادة جلب المدن للمنطقة المختارة الجديدة
    if (regionId) {
      console.log('جاري جلب مدن المنطقة:', regionId);
      
      // إرسال طلب مباشر للحصول على المدن بدون الاعتماد على React Query
      fetch(`/api/regions/${regionId}/cities`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`فشل جلب المدن: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('تم استلام بيانات المدن مباشرة:', data.length, 'مدينة', data);
          setCities(data);
        })
        .catch(error => {
          console.error('خطأ في جلب المدن:', error);
          toast({
            title: "خطأ في جلب المدن",
            description: "حدث خطأ أثناء محاولة جلب قائمة المدن، يرجى المحاولة مرة أخرى",
            variant: "destructive",
          });
          setCities([]);
        });
    } else {
      console.log('لم يتم تحديد منطقة، لن يتم جلب المدن');
      setCities([]);
    }
  };
  
  const isLoading = isLoadingApplications || isLoadingRegions;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          جاري التحميل...
        </div>
      </DashboardLayout>
    );
  }

  if (registered) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <Alert>
            <AlertDescription>
              تم تقديم طلب تسجيل المركز بنجاح. رقم الطلب: {applicationId && formatApplicationId(applicationId)}
              <br />
              سيتم مراجعة الطلب والمستندات وتفعيل الحساب من قبل الإدارة.
              سيتم إشعارك عبر البريد الإلكتروني عند اكتمال المراجعة.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">تسجيل مركز تدريب</h1>
              <p className="text-gray-600">
                قم بتعبئة النموذج التالي لتسجيل مركز التدريب الخاص بك
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات المركز</CardTitle>
              <CardDescription>
                يرجى إدخال المعلومات الأساسية لمركز التدريب. سيتم مراجعة الطلب من قبل الإدارة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  encType="multipart/form-data"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="centerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المركز</FormLabel>
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
                          <FormLabel>اسم المدير</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسم مدير المركز" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="regionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المنطقة</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => handleRegionChange(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المنطقة" />
                              </SelectTrigger>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.id} value={region.id.toString()}>
                                    {region.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
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
                          <FormControl>
                            <Select
                              disabled={!selectedRegionId || isLoadingCities}
                              onValueChange={(value) => {
                                console.log('اختيار المدينة:', value);
                                field.onChange(value);
                                
                                // تحديث معرف المدينة في النموذج
                                form.setValue('cityId', value);
                                
                                // تحديث اسم المدينة
                                const selectedCity = cities.find(city => city.id.toString() === value);
                                if (selectedCity) {
                                  console.log('تم العثور على المدينة:', selectedCity.nameAr);
                                  // تحديث اسم المدينة للعرض
                                  form.setValue('cityName', selectedCity.nameAr);
                                  // تعيين حقل city المطلوب في قاعدة البيانات
                                  form.setValue('city', selectedCity.nameAr);
                                }
                              }}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingCities ? "جاري تحميل المدن..." : "اختر المدينة"} />
                              </SelectTrigger>
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
                          </FormControl>
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
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل العنوان التفصيلي" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="05xxxxxxxx" dir="ltr" />
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
                            <Input {...field} type="email" placeholder="example@domain.com" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold mb-2">المستندات المطلوبة</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormItem>
                        <FormLabel>السجل التجاري</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, "commercialRecord")}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.gif,.bmp"
                          />
                        </FormControl>
                        {!files.commercialRecord && (
                          <p className="text-sm text-destructive">هذا الملف مطلوب</p>
                        )}
                      </FormItem>

                      <FormItem>
                        <FormLabel>خطاب الضمان المالي</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, "financialGuarantee")}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.gif,.bmp"
                          />
                        </FormControl>
                        {!files.financialGuarantee && (
                          <p className="text-sm text-destructive">هذا الملف مطلوب</p>
                        )}
                      </FormItem>

                      <FormItem>
                        <FormLabel>وثائق إثبات الهوية</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, "identityDocuments")}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.gif,.bmp"
                          />
                        </FormControl>
                        {!files.identityDocuments && (
                          <p className="text-sm text-destructive">هذا الملف مطلوب</p>
                        )}
                      </FormItem>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "جاري التسجيل..." : "تقديم الطلب"}
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