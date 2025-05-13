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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "اسم المنشأة مطلوب"),
  facilityId: z.string().min(1, "رقم هوية المنشأة مطلوب"),
  phone: z.string().min(1, "رقم التواصل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  regionId: z.string().min(1, "المنطقة مطلوبة"),
  cityId: z.string().min(1, "المدينة مطلوبة"),
  commercialRegister: z.any(),
  license: z.any(),
  guarantee: z.any(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TestCenterRegister() {
  const { toast } = useToast();
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // قم بجلب المناطق من واجهة برمجة التطبيقات
  const { data: regions = [], isLoading: isLoadingRegions } = useQuery<SaudiRegion[]>({
    queryKey: ['/api/regions'],
    queryFn: async () => {
      const response = await fetch('/api/regions');
      if (!response.ok) {
        throw new Error(`خطأ في جلب المناطق: ${response.status}`);
      }
      return response.json();
    }
  });

  // جلب المدن بناءً على المنطقة المختارة
  const fetchCitiesByRegion = async (regionId: string) => {
    setIsLoadingCities(true);
    setCities([]); // مسح القائمة السابقة فورًا
    
    console.log('جاري جلب بيانات المدن للمنطقة رقم:', regionId);
    
    try {
      const response = await fetch(`/api/regions/${regionId}/cities`);
      if (!response.ok) {
        console.error('خطأ في استجابة جلب المدن:', response.status, response.statusText);
        throw new Error(`فشل في جلب المدن: ${response.statusText}`);
      }
      
      const fetchedCities = await response.json();
      console.log('تم استلام بيانات المدن:', fetchedCities.length, 'مدينة', fetchedCities);
      
      if (Array.isArray(fetchedCities) && fetchedCities.length > 0) {
        setCities(fetchedCities);
      } else {
        console.warn('تم استلام مصفوفة فارغة أو بيانات غير صحيحة للمدن');
        setCities([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة المدن. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // إعداد وحدة التحكم بالنموذج
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      facilityId: "",
      phone: "",
      email: "",
      regionId: "",
      cityId: "",
    },
  });

  // التعامل مع تغيير المنطقة
  const handleRegionChange = (regionId: string) => {
    form.setValue('regionId', regionId);
    form.setValue('cityId', '');
    setSelectedRegionId(regionId);
    fetchCitiesByRegion(regionId);
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    
    // إضافة أسماء المنطقة والمدينة للبيانات المرسلة
    const selectedRegion = regions.find(r => r.id.toString() === data.regionId);
    const selectedCity = cities.find(c => c.id.toString() === data.cityId);
    
    const submissionData = {
      ...data,
      regionName: selectedRegion?.nameAr,
      cityName: selectedCity?.nameAr,
    };
    
    console.log("Submission data with region/city names:", submissionData);
    // TODO: Implement form submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100" dir="rtl">
      <Header />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">نموذج اعتماد مراكز الاختبار</CardTitle>
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
                              ترخيص لمزاولة نشاط الاختبار من المؤسسة العامة للتدريب التقني والمهني ساري المفعول
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
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                        تقديم الطلب
                      </Button>
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