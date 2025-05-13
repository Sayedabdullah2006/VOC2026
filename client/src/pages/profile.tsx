import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  UserCircle, Mail, Phone, Home, Building, Briefcase, Calendar, 
  Globe, MapPin, User, Info, Edit, Save, X, ChevronDown, ChevronUp 
} from "lucide-react";
import { UserRole, SaudiRegions } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionExpanded, setSectionExpanded] = useState({
    personal: true,
    contact: true,
    address: true,
    additional: true,
  });
  
  // تعريف مخطط النموذج
  const profileSchema = z.object({
    // البيانات الشخصية
    fullName: z.string().min(2, "الاسم الكامل يجب أن يكون أطول من حرفين"),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    identityNumber: z.string().optional(),
    
    // بيانات الاتصال
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().optional(),
    
    // بيانات خاصة بالمراكز
    centerName: z.string().optional(),
    registrationType: z.string().optional(),
    contactPerson: z.string().optional(),
    contactPhone: z.string().optional(),
    
    // بيانات جهة العمل (للطلاب)
    employer: z.string().optional(),
    employerPhone: z.string().optional(),
    employerAddress: z.string().optional(),
    
    // العنوان
    centerAddress: z.object({
      region: z.string().optional(),
      city: z.string().optional(),
      street: z.string().optional(),
      buildingNo: z.string().optional(),
      additionalNo: z.string().optional(),
    }).optional(),
    
    // البرامج والنطاق الجغرافي
    offeredPrograms: z.array(z.string()).optional(),
    geographicalScope: z.array(z.string()).optional(),
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      nationality: "",
      identityNumber: "",
      email: "",
      phone: "",
      centerName: "",
      registrationType: "",
      contactPerson: "",
      contactPhone: "",
      employer: "",
      employerPhone: "",
      employerAddress: "",
      centerAddress: {
        region: "",
        city: "",
        street: "",
        buildingNo: "",
        additionalNo: "",
      },
      offeredPrograms: [],
      geographicalScope: [],
    }
  });

  // الحصول على بيانات الملف الشخصي عند تحميل الصفحة
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user");
        
        if (!response.ok) {
          throw new Error("فشل في جلب بيانات الملف الشخصي");
        }
        
        const data = await response.json();
        setProfileData(data);
        
        // تهيئة نموذج التعديل بالبيانات الحالية
        form.reset({
          fullName: data.fullName || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          nationality: data.nationality || "",
          identityNumber: data.identityNumber || "",
          email: data.email || "",
          phone: data.phone || "",
          centerName: data.centerName || "",
          registrationType: data.registrationType || "",
          contactPerson: data.contactPerson || "",
          contactPhone: data.contactPhone || "",
          employer: data.employer || "",
          employerPhone: data.employerPhone || "",
          employerAddress: data.employerAddress || "",
          centerAddress: {
            region: data.centerAddress?.region || "",
            city: data.centerAddress?.city || "",
            street: data.centerAddress?.street || "",
            buildingNo: data.centerAddress?.buildingNo || "",
            additionalNo: data.centerAddress?.additionalNo || "",
          },
          offeredPrograms: data.offeredPrograms || [],
          geographicalScope: data.geographicalScope || [],
        });
        
        // جلب المدن إذا كانت هناك منطقة محددة
        if (data.centerAddress?.region) {
          fetchCities(data.centerAddress.region);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الملف الشخصي:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء محاولة جلب بيانات الملف الشخصي",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  // جلب المدن عند تغيير المنطقة
  const fetchCities = async (regionId) => {
    try {
      const response = await fetch(`/api/regions/${regionId}/cities`);
      if (!response.ok) {
        throw new Error("فشل في جلب قائمة المدن");
      }
      
      const cities = await response.json();
      setCityOptions(cities);
    } catch (error) {
      console.error("خطأ في جلب المدن:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة جلب قائمة المدن",
        variant: "destructive",
      });
    }
  };

  // معالجة تغيير المنطقة
  const handleRegionChange = (value) => {
    form.setValue("centerAddress.region", value);
    form.setValue("centerAddress.city", ""); // إعادة تعيين المدينة
    fetchCities(value);
  };

  // معالجة حفظ البيانات
  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("فشل في تحديث بيانات الملف الشخصي");
      }
      
      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });
    } catch (error) {
      console.error("خطأ في تحديث البيانات:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة تحديث بيانات الملف الشخصي",
        variant: "destructive",
      });
    }
  };

  // دالة الحصول على تسمية الدور
  const getRoleLabel = (role) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'مدير النظام';
      case UserRole.SUPER_ADMIN:
        return 'الموظف الشامل';
      case UserRole.STUDENT:
        return 'متدرب';
      case UserRole.TRAINING_CENTER:
        return 'مركز تدريب';
      case UserRole.TESTING_CENTER:
        return 'مركز اختبار';
      default:
        return role;
    }
  };

  // تبديل حالة توسعة القسم
  const toggleSection = (section) => {
    setSectionExpanded({
      ...sectionExpanded,
      [section]: !sectionExpanded[section]
    });
  };

  // عرض بيانات المراكز (مراكز التدريب والاختبار)
  const renderCenterData = () => {
    if (!profileData) return null;
    
    if (isEditing) {
      return (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="centerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المركز</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="registrationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع التسجيل</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مسؤول الاتصال</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم هاتف مسؤول الاتصال</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileData.centerName && (
          <div>
            <label className="text-sm text-muted-foreground">اسم المركز</label>
            <p className="font-medium">{profileData.centerName}</p>
          </div>
        )}
        
        {profileData.registrationType && (
          <div>
            <label className="text-sm text-muted-foreground">نوع التسجيل</label>
            <p className="font-medium">{profileData.registrationType}</p>
          </div>
        )}
        
        {profileData.contactPerson && (
          <div>
            <label className="text-sm text-muted-foreground">مسؤول الاتصال</label>
            <p className="font-medium">{profileData.contactPerson}</p>
          </div>
        )}
        
        {profileData.contactPhone && (
          <div>
            <label className="text-sm text-muted-foreground">رقم هاتف مسؤول الاتصال</label>
            <p className="font-medium">{profileData.contactPhone}</p>
          </div>
        )}
      </div>
    );
  };

  // عرض بيانات الطالب (بيانات جهة العمل)
  const renderStudentData = () => {
    if (!profileData) return null;
    
    if (isEditing) {
      return (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="employer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>جهة العمل</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم هاتف جهة العمل</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان جهة العمل</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileData.employer && (
          <div>
            <label className="text-sm text-muted-foreground">جهة العمل</label>
            <p className="font-medium">{profileData.employer}</p>
          </div>
        )}
        
        {profileData.employerPhone && (
          <div>
            <label className="text-sm text-muted-foreground">رقم هاتف جهة العمل</label>
            <p className="font-medium">{profileData.employerPhone}</p>
          </div>
        )}
        
        {profileData.employerAddress && (
          <div>
            <label className="text-sm text-muted-foreground">عنوان جهة العمل</label>
            <p className="font-medium">{profileData.employerAddress}</p>
          </div>
        )}
      </div>
    );
  };

  // عرض المحتوى الرئيسي
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الملف الشخصي</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل البيانات
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              <Button type="submit" form="profile-form">
                <Save className="h-4 w-4 ml-2" />
                حفظ التغييرات
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          isEditing ? (
            <Form {...form}>
              <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* البيانات الشخصية */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <UserCircle className="h-6 w-6 text-primary" />
                      <CardTitle>البيانات الشخصية</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('personal')}
                      size="sm"
                    >
                      {sectionExpanded.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.personal && (
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الاسم الكامل</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تاريخ الميلاد</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="nationality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الجنسية</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="identityNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهوية</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* بيانات الاتصال */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <Phone className="h-6 w-6 text-primary" />
                      <CardTitle>بيانات الاتصال</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('contact')}
                      size="sm"
                    >
                      {sectionExpanded.contact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.contact && (
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
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
                              <FormLabel>رقم الهاتف</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* العنوان */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      <CardTitle>العنوان</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('address')}
                      size="sm"
                    >
                      {sectionExpanded.address ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.address && (
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="centerAddress.region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المنطقة</FormLabel>
                              <Select 
                                onValueChange={handleRegionChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المنطقة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(SaudiRegions).map(([index, region]) => (
                                    <SelectItem key={index} value={index}>
                                      {region}
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
                          name="centerAddress.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المدينة</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                disabled={!form.watch("centerAddress.region")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المدينة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cityOptions.map((city) => (
                                    <SelectItem key={city.id} value={city.id.toString()}>
                                      {city.nameAr}
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
                          name="centerAddress.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الشارع</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="centerAddress.buildingNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم المبنى</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="centerAddress.additionalNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الرقم الإضافي</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
                
                {/* بيانات إضافية حسب نوع المستخدم */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <Info className="h-6 w-6 text-primary" />
                      <CardTitle>بيانات إضافية</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('additional')}
                      size="sm"
                    >
                      {sectionExpanded.additional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.additional && (
                    <CardContent className="space-y-6 pt-4">
                      {user?.role === UserRole.STUDENT && renderStudentData()}
                      {(user?.role === UserRole.TRAINING_CENTER || user?.role === UserRole.TESTING_CENTER) && renderCenterData()}
                    </CardContent>
                  )}
                </Card>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="ml-2">
                    إلغاء
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              {/* البيانات الشخصية */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-4">
                    <UserCircle className="h-6 w-6 text-primary" />
                    <CardTitle>البيانات الشخصية</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleSection('personal')}
                    size="sm"
                  >
                    {sectionExpanded.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {sectionExpanded.personal && (
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-muted-foreground">اسم المستخدم</label>
                        <p className="font-medium">{profileData?.username}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">الاسم الكامل</label>
                        <p className="font-medium">{profileData?.fullName || "-"}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">نوع الحساب</label>
                        <p className="font-medium">{getRoleLabel(profileData?.role)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">تاريخ الميلاد</label>
                        <p className="font-medium">
                          {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('ar-SA') : "-"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">الجنسية</label>
                        <p className="font-medium">{profileData?.nationality || "-"}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">رقم الهوية</label>
                        <p className="font-medium">{profileData?.identityNumber || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              
              {/* بيانات الاتصال */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <CardTitle>بيانات الاتصال</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleSection('contact')}
                    size="sm"
                  >
                    {sectionExpanded.contact ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {sectionExpanded.contact && (
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-muted-foreground">البريد الإلكتروني</label>
                        <p className="font-medium">{profileData?.email || "-"}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground">رقم الهاتف</label>
                        <p className="font-medium">{profileData?.phone || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              
              {/* العنوان */}
              {profileData?.centerAddress && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      <CardTitle>العنوان</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('address')}
                      size="sm"
                    >
                      {sectionExpanded.address ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.address && (
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profileData.centerAddress.region && (
                          <div>
                            <label className="text-sm text-muted-foreground">المنطقة</label>
                            <p className="font-medium">
                              {SaudiRegions[profileData.centerAddress.region] || profileData.centerAddress.region}
                            </p>
                          </div>
                        )}
                        
                        {profileData.centerAddress.city && (
                          <div>
                            <label className="text-sm text-muted-foreground">المدينة</label>
                            <p className="font-medium">{profileData.centerAddress.city}</p>
                          </div>
                        )}
                        
                        {profileData.centerAddress.street && (
                          <div>
                            <label className="text-sm text-muted-foreground">الشارع</label>
                            <p className="font-medium">{profileData.centerAddress.street}</p>
                          </div>
                        )}
                        
                        {profileData.centerAddress.buildingNo && (
                          <div>
                            <label className="text-sm text-muted-foreground">رقم المبنى</label>
                            <p className="font-medium">{profileData.centerAddress.buildingNo}</p>
                          </div>
                        )}
                        
                        {profileData.centerAddress.additionalNo && (
                          <div>
                            <label className="text-sm text-muted-foreground">الرقم الإضافي</label>
                            <p className="font-medium">{profileData.centerAddress.additionalNo}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
              
              {/* بيانات إضافية حسب نوع المستخدم */}
              {((user?.role === UserRole.TRAINING_CENTER || user?.role === UserRole.TESTING_CENTER) && 
                (profileData?.centerName || profileData?.contactPerson || profileData?.contactPhone)) || 
                (user?.role === UserRole.STUDENT && 
                (profileData?.employer || profileData?.employerPhone || profileData?.employerAddress)) ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-4">
                      <Info className="h-6 w-6 text-primary" />
                      <CardTitle>بيانات إضافية</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleSection('additional')}
                      size="sm"
                    >
                      {sectionExpanded.additional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  {sectionExpanded.additional && (
                    <CardContent className="pt-4">
                      {user?.role === UserRole.STUDENT && renderStudentData()}
                      {(user?.role === UserRole.TRAINING_CENTER || user?.role === UserRole.TESTING_CENTER) && renderCenterData()}
                    </CardContent>
                  )}
                </Card>
              ) : null}
            </>
          )
        )}
      </div>
    </DashboardLayout>
  );
}