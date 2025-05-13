import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Shield } from "lucide-react";
import { Redirect } from "wouter";
import { UserRole, insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Captcha from "@/components/captcha";

// Create a specific schema for super admin registration
const superAdminSchema = insertUserSchema.extend({
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
}).omit({
  role: true,
  centerName: true,
  registrationType: true,
  centerAddress: true,
  contactPerson: true,
  contactPhone: true,
  offeredPrograms: true,
  geographicalScope: true,
  dateOfBirth: true,
  nationality: true,
  identityNumber: true,
  employer: true,
  employerAddress: true,
  employerPhone: true,
});

// إضافة سكيما لتسجيل الدخول مع حقل الكابتشا
const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  captcha: z.string().min(1, "الرمز الأمني مطلوب"),
});

type SuperAdminFormData = z.infer<typeof superAdminSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function SuperAdminAuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      captcha: "",
    },
  });

  // تحديث نموذج التسجيل لإضافة حقل الكابتشا
  const registerSchema = superAdminSchema.extend({
    captcha: z.string().min(1, "الرمز الأمني مطلوب"),
  });
  
  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      captcha: "",
    },
  });

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/super-admin/dashboard" />;
  }

  // تحديث دالة تسجيل الدخول لإضافة الكابتشا
  const onLogin = async (data: LoginFormData) => {
    try {
      // التحقق من وجود الكابتشا
      if (!data.captcha) {
        setCaptchaError(true);
        setError("الرمز الأمني مطلوب");
        return;
      }
      
      setCaptchaError(false);
      setError("");
      
      // إرسال البيانات مع الكابتشا
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        captcha: data.captcha
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("الكود الأمني غير صحيح")) {
        setCaptchaError(true);
        setError("الرمز الأمني غير صحيح");
      } else {
        setError("خطأ في اسم المستخدم أو كلمة المرور");
      }
    }
  };

  // تحديث دالة التسجيل لإضافة الكابتشا
  const onRegister = async (data: RegisterFormData) => {
    try {
      // التحقق من وجود الكابتشا
      if (!data.captcha) {
        setCaptchaError(true);
        setError("الرمز الأمني مطلوب");
        return;
      }
      
      setCaptchaError(false);
      setError("");
      
      // إعداد بيانات التسجيل مع إضافة حقل الدور ومعلومات إضافية
      const registrationData = {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        role: UserRole.SUPER_ADMIN,
        dateOfBirth: new Date(), // إضافة حقل تاريخ الميلاد المطلوب
        status: 'pending' as const,
        captcha: data.captcha // إضافة رمز التحقق
      };
      
      await registerMutation.mutateAsync(registrationData);
    } catch (error) {
      if (error instanceof Error && error.message.includes("الكود الأمني غير صحيح")) {
        setCaptchaError(true);
        setError("الرمز الأمني غير صحيح");
      } else {
        setError("حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">نظام المسؤول الشامل</h1>
          <p className="text-muted-foreground">
            الرجاء تسجيل الدخول أو إنشاء حساب جديد
          </p>
        </div>

        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>تسجيل الدخول</CardTitle>
                <CardDescription>
                  قم بإدخال بيانات الدخول الخاصة بك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="captcha"
                      render={({ field }) => (
                        <FormItem>
                          <Captcha
                            onChange={field.onChange}
                            value={field.value}
                            error={captchaError}
                            errorMessage={captchaError ? "الرمز الأمني غير صحيح" : undefined}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-destructive text-center">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "جاري التحقق..." : "تسجيل الدخول"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>حساب جديد</CardTitle>
                <CardDescription>
                  قم بإنشاء حساب مسؤول شامل جديد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
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
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="captcha"
                      render={({ field }) => (
                        <FormItem>
                          <Captcha
                            onChange={field.onChange}
                            value={field.value}
                            error={captchaError}
                            errorMessage={captchaError ? "الرمز الأمني غير صحيح" : undefined}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-destructive text-center">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}