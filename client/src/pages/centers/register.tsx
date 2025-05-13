import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import Header from "@/components/layout/header";
import { type SaudiRegion, type SaudiCity } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "اسم المنشأة مطلوب"),
  facilityId: z.string().min(1, "رقم هوية المنشأة مطلوب"),
  phone: z.string().min(1, "رقم التواصل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  regionId: z.string().min(1, "المنطقة مطلوبة"),
  cityId: z.string().min(1, "المدينة مطلوبة"),
  location: z.string().min(1, "الموقع مطلوب"),
  commercialRegister: z.instanceof(File, { message: "السجل التجاري مطلوب" })
    .refine((file) => file.size < 5 * 1024 * 1024, "حجم الملف يجب أن يكون أقل من 5 ميجابايت"),
  license: z.instanceof(File, { message: "الترخيص مطلوب" })
    .refine((file) => file.size < 5 * 1024 * 1024, "حجم الملف يجب أن يكون أقل من 5 ميجابايت"),
  guarantee: z.instanceof(File, { message: "الضمان المالي مطلوب" })
    .refine((file) => file.size < 5 * 1024 * 1024, "حجم الملف يجب أن يكون أقل من 5 ميجابايت"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TrainingCenterRegister() {
  const { user } = useAuth(); // استخدام الهوك للحصول على معلومات المستخدم الحالي
  const { toast } = useToast();
  const [regions, setRegions] = useState<SaudiRegion[]>([]);
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      facilityId: "",
      phone: "",
      email: "",
      regionId: "",
      cityId: "",
      location: "",
    },
  });
  
  // Fetch regions data
  const { data: regionsData, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/regions");
      return response.json();
    }
  });
  
  // Fetch cities for the selected region
  const { data: citiesData, refetch: refetchCities } = useQuery({
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
        return data;
      } catch (error) {
        console.error('خطأ أثناء جلب المدن:', error);
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
  
  // Function to handle region change
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    form.setValue('regionId', regionId);
    form.setValue('cityId', ''); // Reset city when region changes
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // دالة مساعدة للتحقق من صحة المدخلات
  const validateApplicationData = (data: FormValues, user: any): string | null => {
    // تحقق من المستخدم
    if (!user || !user.id) {
      return "لم يتم العثور على معلومات المستخدم. الرجاء تسجيل الدخول وإعادة المحاولة.";
    }
    
    // تحقق من وجود المنطقة والمدينة
    const selectedRegion = regions.find(region => region.id.toString() === data.regionId);
    const selectedCity = cities.find(city => city.id.toString() === data.cityId);
    
    if (!selectedRegion || !selectedCity) {
      return "الرجاء اختيار المنطقة والمدينة بشكل صحيح";
    }
    
    // تحقق من الملفات المرفقة
    if (!data.commercialRegister) {
      return "السجل التجاري مطلوب";
    }
    
    if (!data.license) {
      return "رخصة مزاولة نشاط التدريب مطلوبة";
    }
    
    if (!data.guarantee) {
      return "ملف الضمان المالي مطلوب";
    }
    
    return null; // البيانات صحيحة
  };
  
  // دالة تقديم النموذج
  const onSubmit = async (data: FormValues) => {
    try {
      // إعادة ضبط الحالات
      setIsSubmitting(true);
      setSubmitError(null);
      console.log("بدء معالجة تقديم النموذج:", data);
      
      // التحقق من وجود المستخدم
      if (!user || !user.id) {
        setSubmitError("لم يتم العثور على معلومات المستخدم. الرجاء تسجيل الدخول وإعادة المحاولة.");
        setIsSubmitting(false);
        return;
      }
      
      // التحقق من صحة البيانات
      const validationError = validateApplicationData(data, user);
      if (validationError) {
        setSubmitError(validationError);
        setIsSubmitting(false);
        return;
      }
      
      // الحصول على المنطقة والمدينة المحددة
      const selectedRegion = regions.find(region => region.id.toString() === data.regionId);
      const selectedCity = cities.find(city => city.id.toString() === data.cityId);
      
      // التحقق من وجود المنطقة والمدينة
      if (!selectedRegion || !selectedCity) {
        setSubmitError("الرجاء اختيار المنطقة والمدينة بشكل صحيح");
        setIsSubmitting(false);
        return;
      }
      
      // تجهيز كائن FormData
      const formData = new FormData();
      
      // --- بيانات المستخدم والمنشأة ---
      formData.append("userId", user.id.toString());
      formData.append("centerName", data.name);
      formData.append("facilityId", data.facilityId);
      formData.append("managerName", user.fullName || user.username || "مدير المركز");
      
      // --- بيانات الموقع ---
      formData.append("address", data.location);
      formData.append("city", selectedCity.nameAr);
      formData.append("cityName", selectedCity.nameAr);
      formData.append("regionId", data.regionId);
      formData.append("regionName", selectedRegion.nameAr);
      formData.append("cityId", data.cityId);
      
      // --- بيانات الاتصال ---
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      formData.append("type", "training_center");
      
      // --- الملفات المرفقة ---
      formData.append("commercialRecord", data.commercialRegister);
      formData.append("financialGuarantee", data.guarantee);
      formData.append("identityDocuments", data.license);
      
      // طباعة بيانات النموذج للتحقق منها
      console.log("=== بيانات طلب مركز التدريب ===");
      
      // قائمة الحقول المهمة للطباعة
      const importantFields = [
        "userId", "centerName", "facilityId", "managerName", "address", 
        "city", "regionId", "regionName", "cityId", "phone", "email", "type"
      ];
      
      // طباعة البيانات المهمة
      importantFields.forEach(field => {
        console.log(`${field}: ${formData.get(field)}`);
      });
      
      // طباعة معلومات الملفات
      console.log("commercialRecord:", formData.get("commercialRecord") instanceof File 
        ? `File: ${(formData.get("commercialRecord") as File).name}` 
        : "غير موجود");
      
      console.log("financialGuarantee:", formData.get("financialGuarantee") instanceof File 
        ? `File: ${(formData.get("financialGuarantee") as File).name}` 
        : "غير موجود");
      
      console.log("identityDocuments:", formData.get("identityDocuments") instanceof File 
        ? `File: ${(formData.get("identityDocuments") as File).name}` 
        : "غير موجود");
      
      // محاولة إرسال الطلب
      console.log("إرسال طلب الاعتماد إلى الخادم...");
      
      // تحقق مسبق من الجلسة
      const userCheckResponse = await fetch("/api/user", {
        credentials: "include",
        cache: "no-cache"
      });
      
      if (userCheckResponse.status === 401) {
        throw new Error("الجلسة منتهية أو غير مصرح. الرجاء إعادة تسجيل الدخول.");
      }
      
      // الآن نقوم بإرسال النموذج مع ملفاته
      const response = await fetch("/api/training-center-applications", {
        method: "POST",
        body: formData,
        credentials: "include",
        cache: "no-cache",
      });
      
      // حصلنا على استجابة من الخادم
      console.log(`استجابة الخادم: ${response.status} ${response.statusText}`);
      
      // التحقق من حالة الاستجابة
      if (!response.ok) {
        let errorMessage = `خطأ في الاستجابة: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // إذا لم نتمكن من قراءة الرد كـ JSON، نحاول قراءته كنص
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // تمت العملية بنجاح
      const result = await response.json();
      console.log("تم تقديم الطلب بنجاح:", result);
      
      // تحديث حالة النموذج
      setSubmitSuccess(true);
      form.reset();
      
    } catch (error) {
      // معالجة الأخطاء
      console.error("حدث خطأ أثناء تقديم الطلب:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف أثناء تقديم الطلب";
      setSubmitError(errorMessage);
    } finally {
      // إعادة تعيين حالة الإرسال
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">نموذج اعتماد مراكز التدريب</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المنشأة</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facilityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم هوية المنشأة</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>رقم التواصل</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
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
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              value={field.value}
                              onValueChange={field.onChange}
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

                    <div className="space-y-4">
                      <h3 className="font-medium mb-2">المرفقات المطلوبة</h3>

                      <FormField
                        control={form.control}
                        name="commercialRegister"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>سجل تجاري</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="file"
                                  onChange={(e) => field.onChange(e.target.files?.[0])}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                <Upload className="h-5 w-5 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="license"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              ترخيص لمزاولة نشاط التدريب من المؤسسة العامة للتدريب التقني والمهني ساري المفعول
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="file"
                                  onChange={(e) => field.onChange(e.target.files?.[0])}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                <Upload className="h-5 w-5 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guarantee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              ضمان مالي باسم الهيئة بمبلغ وقدره (100,000) مائة ألف ريال سعودي
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="file"
                                  onChange={(e) => field.onChange(e.target.files?.[0])}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                <Upload className="h-5 w-5 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4">
                      {submitSuccess ? (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                          <p>تم تقديم الطلب بنجاح! سيتم مراجعة طلبك قريباً.</p>
                        </div>
                      ) : (
                        <>
                          {submitError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                              <p>{submitError}</p>
                            </div>
                          )}
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                جارِ التقديم...
                              </span>
                            ) : (
                              'تقديم الطلب'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}