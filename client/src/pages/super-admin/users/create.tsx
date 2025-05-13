import { useState } from "react";
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
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CreateUserPage() {
  const { toast } = useToast();
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "",
      status: "pending",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام",
      });
      // Redirect to users list
      window.location.href = "/super-admin/users";
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: any) => {
    createUserMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إضافة مستخدم جديد</h1>
              <p className="text-gray-600">
                قم بإدخال بيانات المستخدم الجديد
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات المستخدم</CardTitle>
              <CardDescription>
                يرجى إدخال المعلومات الأساسية للمستخدم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المستخدم</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع المستخدم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UserRole.ADMIN}>مسؤول</SelectItem>
                              <SelectItem value={UserRole.TRAINING_CENTER}>مركز تدريب</SelectItem>
                              <SelectItem value={UserRole.TESTING_CENTER}>مركز اختبار</SelectItem>
                              <SelectItem value={UserRole.STUDENT}>متدرب</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحالة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر حالة المستخدم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">معلق</SelectItem>
                              <SelectItem value="active">نشط</SelectItem>
                              <SelectItem value="suspended">موقوف</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "جاري الإنشاء..." : "إضافة المستخدم"}
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
