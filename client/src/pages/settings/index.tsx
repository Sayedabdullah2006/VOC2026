import React, { useRef } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Lock, Globe, Moon, Sun, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
  path: ["confirmPassword"],
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordChangeForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordChangeMutation = useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل تغيير كلمة المرور");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      passwordChangeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onPasswordChangeSubmit = async (data: PasswordChangeFormData) => {
    await passwordChangeMutation.mutateAsync(data);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ في تحميل الصورة",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      // Here we'll add the API call to update the profile image
      toast({
        title: "تم تحديث الصورة الشخصية",
        description: "تم تحديث صورتك الشخصية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث الصورة",
        description: "حدث خطأ أثناء تحديث الصورة الشخصية",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold">الإعدادات</h1>

        <div className="grid gap-6">
          {/* الصورة الشخصية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profileImage || undefined} />
                  <AvatarFallback>{(user?.fullName?.[0] || user?.username[0])?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    تحميل صورة جديدة
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    يمكنك تحميل صورة بصيغة JPG، PNG. الحد الأقصى للحجم 5 ميجابايت
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات الحساب */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>تغيير كلمة المرور</Label>
                  <p className="text-sm text-muted-foreground">
                    قم بتحديث كلمة المرور الخاصة بك
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 ml-2" />
                      تغيير
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>تغيير كلمة المرور</DialogTitle>
                      <DialogDescription>
                        قم بإدخال كلمة المرور الحالية وكلمة المرور الجديدة
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordChangeForm}>
                      <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)} className="space-y-4">
                        <FormField
                          control={passwordChangeForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور الحالية</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordChangeForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور الجديدة</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordChangeForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={passwordChangeMutation.isPending}>
                          {passwordChangeMutation.isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>اللغة</Label>
                  <p className="text-sm text-muted-foreground">
                    اختر لغة واجهة المستخدم
                  </p>
                </div>
                <Select defaultValue="ar">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات الإشعارات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>إشعارات المتصفح</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات في المتصفح
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات المظهر */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">إعدادات المظهر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>الوضع المظلم</Label>
                  <p className="text-sm text-muted-foreground">
                    تفعيل الوضع المظلم
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;