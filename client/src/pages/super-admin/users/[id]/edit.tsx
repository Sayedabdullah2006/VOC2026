import React, { useState } from "react";
import { useParams } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
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
import { UserPlus, Loader2 } from "lucide-react";
import { UserRole, SaudiRegions } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const EditUserPage = () => {
  const [_, params] = useParams();
  const { toast } = useToast();
  const [error, setError] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users', params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error('User ID is required');
      const res = await apiRequest('GET', `/api/users/${params.id}`);
      return res.json();
    },
    enabled: !!params?.id,
  });

  const form = useForm({
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      role: "",
      status: "",
      password: "",
      // Training/Testing Center fields
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
      geographicalScope: [] as string[],
      // Student fields
      dateOfBirth: "",
      nationality: "",
      identityNumber: "",
      employer: "",
      employerAddress: "",
      employerPhone: "",
    },
  });

  const role = form.watch("role");

  // Update form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        password: "",
        centerName: user.centerName || "",
        registrationType: user.registrationType || "",
        centerAddress: user.centerAddress || {
          region: "",
          city: "",
          buildingNo: "",
          street: "",
          additionalNo: "",
        },
        contactPerson: user.contactPerson || "",
        contactPhone: user.contactPhone || "",
        offeredPrograms: user.offeredPrograms || [],
        geographicalScope: user.geographicalScope || [],
        dateOfBirth: user.dateOfBirth || "",
        nationality: user.nationality || "",
        identityNumber: user.identityNumber || "",
        employer: user.employer || "",
        employerAddress: user.employerAddress || "",
        employerPhone: user.employerPhone || "",
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      const res = await apiRequest("PATCH", `/api/users/${params.id}`, updateData);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      const statusMessages = {
        active: "تم تفعيل الحساب بنجاح",
        pending: "تم تعليق الحساب",
        suspended: "تم إيقاف الحساب"
      };

      toast({
        title: "تم تحديث المستخدم بنجاح",
        description: statusMessages[updatedUser.status as keyof typeof statusMessages] || "تم تحديث بيانات المستخدم في النظام",
      });

      // Send notification email when status changes
      if (user && user.status !== updatedUser.status) {
        apiRequest("POST", "/api/notifications/status-change", {
          userId: user.id,
          newStatus: updatedUser.status,
          email: user.email
        });
      }

      window.location.href = "/super-admin/users";
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: any) => {
    updateUserMutation.mutate(data);
  };

  const renderStudentFields = () => (
    <>
      <div className="grid md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم التواصل</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
        name="employerAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان جهة العمل</FormLabel>
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
            <FormLabel>رقم التواصل لجهة العمل</FormLabel>
            <FormControl>
              <Input type="tel" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderCenterFields = (isTrainingCenter: boolean) => (
    <>
      <FormField
        control={form.control}
        name="centerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isTrainingCenter ? "اسم مزود خدمة التأهيل والتدريب" : "اسم مركز الاختبار"}
            </FormLabel>
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
            <FormLabel>نوع السجل</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <h3 className="font-semibold">عنوان المركز</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="centerAddress.region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المنطقة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنطقة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SaudiRegions.map((region) => (
                      <SelectItem key={region} value={region}>
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مسؤول التواصل</FormLabel>
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
              <FormLabel>رقم التواصل</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="offeredPrograms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isTrainingCenter ? "البرامج التدريبية التي سيقدمها" : "الاختبارات التي سيتم تقديمها"}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value?.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(",").map(item => item.trim()))}
                placeholder="أدخل البرامج مفصولة بفواصل"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* تم إزالة حقل النطاق الجغرافي بناءً على طلب المستخدم */}
    </>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
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
              <h1 className="text-3xl font-bold">تعديل بيانات المستخدم</h1>
              <p className="text-gray-600">
                قم بتعديل بيانات المستخدم
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معلومات المستخدم</CardTitle>
              <CardDescription>
                قم بتعديل المعلومات الأساسية للمستخدم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
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
                          <FormLabel>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد تغييرها)</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="اتركها فارغة إذا لم ترد تغييرها"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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

                  <div className="grid md:grid-cols-2 gap-6">
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
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الحساب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الحساب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="suspended">موقوف</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          {field.value === 'pending' && "الحساب في انتظار المراجعة والتفعيل"}
                          {field.value === 'active' && "الحساب مفعل ويمكن استخدامه"}
                          {field.value === 'suspended' && "الحساب موقوف ولا يمكن استخدامه"}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conditional Fields */}
                  {role === UserRole.STUDENT && renderStudentFields()}
                  {role === UserRole.TRAINING_CENTER && renderCenterFields(true)}
                  {role === UserRole.TESTING_CENTER && renderCenterFields(false)}

                  {error && (
                    <div className="text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? "جاري التحديث..." : "تحديث المستخدم"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditUserPage;