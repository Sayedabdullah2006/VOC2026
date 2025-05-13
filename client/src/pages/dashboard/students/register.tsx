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
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function StudentRegistrationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registered, setRegistered] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      address: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/register", {
        ...data,
        role: "STUDENT",
        status: "pending" // Set initial status as pending
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل المتدرب بنجاح",
        description: "سيتم مراجعة الطلب وتفعيل الحساب من قبل الإدارة",
      });
      setRegistered(true);
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    registerMutation.mutate(data);
  };

  if (registered) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8" dir="rtl">
          <Alert>
            <AlertDescription>
              تم تسجيل المتدرب بنجاح. سيتم مراجعة الطلب وتفعيل الحساب من قبل الإدارة.
              سيتم إشعاركم عند تفعيل الحساب.
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
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">تسجيل متدرب جديد</h1>
              <p className="text-gray-600">
                قم بإدخال بيانات المتدرب الجديد
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات المتدرب</CardTitle>
              <CardDescription>
                يرجى إدخال المعلومات الشخصية للمتدرب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل الاسم الكامل للمتدرب" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="example@domain.com" />
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
                          <FormLabel>رقم الجوال</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="05xxxxxxxx" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهوية</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل رقم الهوية" />
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
                            <Input {...field} type="date" />
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

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "جاري التسجيل..." : "تسجيل المتدرب"}
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