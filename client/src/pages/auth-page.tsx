import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, RoleType, type SaudiRegion, type SaudiCity } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Captcha from "@/components/captcha";
import AppLogo from "@/components/app-logo";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();
  
  // حالة المناطق والمدن
  const [regions, setRegions] = useState<SaudiRegion[]>([]);
  const [cities, setCities] = useState<SaudiCity[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  // جلب المناطق
  const { data: regionsData, isLoading: isLoadingRegions } = useQuery<SaudiRegion[]>({
    queryKey: ['/api/regional/regions'],
    queryFn: async () => {
      const response = await fetch('/api/regional/regions');
      if (!response.ok) {
        throw new Error(`خطأ في جلب المناطق: ${response.status}`);
      }
      return response.json();
    }
  });
  
  // تحديث المناطق عند الحصول على البيانات
  useEffect(() => {
    if (regionsData) {
      setRegions(regionsData);
    }
  }, [regionsData]);
  
  // وظيفة جلب المدن بناءً على المنطقة المختارة
  const fetchCitiesByRegion = async (regionId: string) => {
    if (!regionId) return;
    
    console.log(`بدء تحميل المدن للمنطقة: ${regionId}`);
    setIsLoadingCities(true);
    try {
      const response = await fetch(`/api/regional/cities/${regionId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في جلب المدن: ${response.status}`);
      }
      
      const fetchedCities = await response.json();
      console.log('تم تحميل المدن بنجاح:', fetchedCities);
      
      if (Array.isArray(fetchedCities)) {
        setCities(fetchedCities);
      } else {
        console.error('بيانات المدن ليست مصفوفة:', fetchedCities);
        setCities([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المدن:', error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };
  
  // وظيفة معالجة تغيير المنطقة
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    registerForm.setValue('centerAddress.region', regionId);
    registerForm.setValue('centerAddress.city', ''); // إعادة تعيين المدينة عند تغيير المنطقة
    fetchCitiesByRegion(regionId);
  };

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      captcha: "",
    },
  });
  
  const [loginCaptchaError, setLoginCaptchaError] = useState<string | null>(null);
  const [loginCaptchaAttempts, setLoginCaptchaAttempts] = useState<number | undefined>(undefined);
  const [loginCaptchaId, setLoginCaptchaId] = useState<string | null>(null);

  // تعريف مخطط السجل مع التحقق من تطابق كلمة المرور
  const registerFormSchema = insertUserSchema.extend({
    confirmPassword: z.string()
      .min(1, { message: "تأكيد كلمة المرور مطلوب" }),
    captcha: z.string()
      .min(1, { message: "الكود الأمني مطلوب" })
  }).refine((data) => data.password === data.confirmPassword, {
    message: "كلمة المرور وتأكيدها غير متطابقان",
    path: ["confirmPassword"],
  });

  // تعريف نموذج التسجيل
  const registerForm = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      captcha: "",
      role: UserRole.STUDENT,
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      nationality: "",
      identityNumber: "",
      employer: "",
      employerAddress: "",
      employerPhone: "",
      centerName: "",
      registrationType: "",
      centerAddress: {
        region: "",
        city: "",
        buildingNo: "",
        street: "",
        additionalNo: "",
      },
      contactPerson: "",
      contactPhone: "",
      offeredPrograms: [] as string[],
      // تم إزالة geographicalScope بناءً على طلب المستخدم
    },
  });
  
  const [registerCaptchaError, setRegisterCaptchaError] = useState<string | null>(null);
  const [registerCaptchaAttempts, setRegisterCaptchaAttempts] = useState<number | undefined>(undefined);
  const [registerCaptchaId, setRegisterCaptchaId] = useState<string | null>(null);

  const role = registerForm.watch("role");

  const renderStudentFields = () => (
    <>
      <FormField
        control={registerForm.control}
        name="fullName"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">الاسم الرباعي</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={registerForm.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">تاريخ الميلاد</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="nationality"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">الجنسية</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={registerForm.control}
          name="identityNumber"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">رقم الهوية</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">رقم التواصل</FormLabel>
              <FormControl>
                <Input {...field} type="tel" className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={registerForm.control}
        name="employer"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">جهة العمل</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      <FormField
        control={registerForm.control}
        name="employerAddress"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">عنوان جهة العمل</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      <FormField
        control={registerForm.control}
        name="employerPhone"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">رقم التواصل لجهة العمل</FormLabel>
            <FormControl>
              <Input {...field} type="tel" className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </>
  );

  const renderCenterFields = (isTrainingCenter: boolean) => (
    <>
      <FormField
        control={registerForm.control}
        name="centerName"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">
              {isTrainingCenter ? "اسم مزود خدمة التأهيل والتدريب" : "اسم مركز الاختبار"}
            </FormLabel>
            <FormControl>
              <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      <FormField
        control={registerForm.control}
        name="registrationType"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">نوع السجل</FormLabel>
            <FormControl>
              <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      {/* Center Address Fields */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-right">عنوان المركز</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={registerForm.control}
            name="centerAddress.region"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-white">المنطقة</FormLabel>
                <Select onValueChange={(value) => handleRegionChange(value)} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/20 text-white border-white/20 text-right">
                      <SelectValue placeholder={isLoadingRegions ? "جاري تحميل المناطق..." : "اختر المنطقة"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="centerAddress.city"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-white">المدينة</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedRegionId || isLoadingCities}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/20 text-white border-white/20 text-right">
                      <SelectValue placeholder={isLoadingCities ? "جاري تحميل المدن..." : "اختر المدينة"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
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
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={registerForm.control}
            name="centerAddress.buildingNo"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-white">رقم المبنى</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="centerAddress.street"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-white">الشارع</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="centerAddress.additionalNo"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel className="text-white">الرقم الإضافي</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={registerForm.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">مسؤول التواصل</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem className="text-right">
              <FormLabel className="text-white">رقم التواصل</FormLabel>
              <FormControl>
                <Input {...field} type="tel" className="bg-white/20 text-white border-white/20 text-right" />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={registerForm.control}
        name="offeredPrograms"
        render={({ field }) => (
          <FormItem className="text-right">
            <FormLabel className="text-white">
              {isTrainingCenter ? "البرامج التدريبية التي سيقدمها" : "الاختبارات التي سيتم تقديمها"}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value?.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(",").map(item => item.trim()))}
                className="bg-white/20 text-white border-white/20 text-right"
                placeholder="أدخل البرامج مفصولة بفواصل"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      {/* تم إزالة حقل النطاق الجغرافي بناءً على طلب المستخدم */}
    </>
  );

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Background Image with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-blue-green"></div>
        <div className="absolute inset-0 bg-[#051C2C]/80"></div>
      </div>

      {/* Back to Home Button */}
      <Link href="/">
        <Button
          variant="outline"
          className="absolute top-6 right-6 gap-2 text-white border-white/20 bg-[#0C7D99]/50 hover:bg-[#0C7D99]/70 backdrop-blur-sm z-50 shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
          العودة للرئيسية
        </Button>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">

        <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              البوابة الوطنية للتدريب المهني
            </CardTitle>
            <CardDescription className="text-white/80">
              منصة متكاملة لتأهيل وترخيص العاملين في قطاع النقل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10">
                <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0C7D99] data-[state=active]:to-[#0D9C65] data-[state=active]:text-white">تسجيل جديد</TabsTrigger>
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0C7D99] data-[state=active]:to-[#0D9C65] data-[state=active]:text-white">تسجيل الدخول</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) => {
                      // إعادة تعيين أخطاء الكابتشا
                      setLoginCaptchaError(null);
                      setLoginCaptchaAttempts(undefined);
                      
                      // إضافة معرف الكابتشا إلى البيانات
                      const loginData = {
                        ...data,
                        captchaId: loginCaptchaId
                      };
                      
                      loginMutation.mutate(loginData, {
                        onError: (error: any) => {
                          console.log('تم استلام خطأ عند تسجيل الدخول:', error.message);
                          
                          // تحديث رسائل الخطأ إذا كان الخطأ متعلق بالكابتشا
                          if (error.message.includes('الكود الأمني') || error.message.includes('رمز التحقق')) {
                            setLoginCaptchaError(error.message);
                            if (error.remainingAttempts !== undefined) {
                              setLoginCaptchaAttempts(error.remainingAttempts);
                            }
                          } else if (error.message.includes('اسم المستخدم أو كلمة المرور غير صحيحة')) {
                            // إظهار خطأ معلومات تسجيل الدخول غير الصحيحة
                            setLoginCaptchaError(error.message);
                          } else if (!loginCaptchaId) {
                            // إذا لم يكن هناك معرف للكابتشا، أخبر المستخدم بتحديث الكابتشا أولاً
                            setLoginCaptchaError("يرجى النقر على أيقونة تحديث الكابتشا وإعادة المحاولة");
                          } else {
                            // خطأ عام آخر
                            setLoginCaptchaError(error.message || "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
                          }
                        }
                      });
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">
                            اسم المستخدم
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-white/20 text-white border-white/20 text-right"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">
                            كلمة المرور
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="bg-white/20 text-white border-white/20 text-right"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="captcha"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <Captcha 
                            {...field} 
                            error={!!loginCaptchaError}
                            errorMessage={loginCaptchaError || undefined}
                            remainingAttempts={loginCaptchaAttempts}
                            onCaptchaIdChange={(id) => setLoginCaptchaId(id)}
                          />
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                    
                    {loginMutation.error && (
                      <div className="text-red-300 text-sm text-center">
                        {loginMutation.error.message}
                      </div>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] hover:from-[#0D9C65] hover:to-[#0C7D99] text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending
                        ? "جاري تسجيل الدخول..."
                        : "تسجيل الدخول"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) => {
                      // إعادة تعيين أخطاء الكابتشا
                      setRegisterCaptchaError(null);
                      setRegisterCaptchaAttempts(undefined);
                      
                      // استخراج البيانات المقبولة بدون حقل تأكيد كلمة المرور
                      const { confirmPassword, ...dataWithoutConfirm } = data;
                      
                      // إضافة معرف الكابتشا إلى البيانات
                      const registerData = {
                        ...dataWithoutConfirm,
                        captchaId: registerCaptchaId
                      };
                      
                      // إرسال البيانات المقبولة فقط
                      registerMutation.mutate(registerData as any, {
                        onError: (error: any) => {
                          // تحديث رسائل الخطأ إذا كان الخطأ متعلق بالكابتشا
                          if (error.message.includes('الكود الأمني')) {
                            setRegisterCaptchaError(error.message);
                            if (error.remainingAttempts !== undefined) {
                              setRegisterCaptchaAttempts(error.remainingAttempts);
                            }
                          }
                        }
                      });
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">
                            نوع المستخدم
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white/20 text-white border-white/20 text-right">
                                <SelectValue placeholder="اختر نوع المستخدم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UserRole.STUDENT}>
                                متدرب
                              </SelectItem>
                              <SelectItem value={UserRole.TRAINING_CENTER}>
                                مركز تدريب
                              </SelectItem>
                              <SelectItem value={UserRole.TESTING_CENTER}>
                                مركز اختبار
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    {/* Conditional rendering based on role */}
                    {role && (
                      <>
                        {role.includes("STUDENT") && renderStudentFields()}
                        {role.includes("TRAINING_CENTER") && renderCenterFields(true)}
                        {role.includes("TESTING_CENTER") && renderCenterFields(false)}
                      </>
                    )}

                    {/* Common fields */}
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">
                            البريد الإلكتروني
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="bg-white/20 text-white border-white/20 text-right"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">
                            اسم المستخدم
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-white/20 text-white border-white/20 text-right"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-white">
                              كلمة المرور
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="bg-white/20 text-white border-white/20 text-right"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-white">
                              تأكيد كلمة المرور
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="bg-white/20 text-white border-white/20 text-right"
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="captcha"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <Captcha 
                            {...field} 
                            error={!!registerCaptchaError}
                            errorMessage={registerCaptchaError || undefined}
                            remainingAttempts={registerCaptchaAttempts}
                            onCaptchaIdChange={(id) => setRegisterCaptchaId(id)}
                          />
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                    
                    {registerMutation.error && (
                      <div className="text-red-300 text-sm text-center">
                        {registerMutation.error.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] hover:from-[#0D9C65] hover:to-[#0C7D99] text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "جاري التسجيل..." : "تسجيل"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}