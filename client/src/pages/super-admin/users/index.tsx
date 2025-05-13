import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Users, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UsersManagementPage() {
  const { toast } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 5000,
    gcTime: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم تحديث حالة المستخدم",
        description: "تم تحديث حالة المستخدم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "موظف شامل";
      case "ADMIN":
        return "مسؤول";
      case "TRAINING_CENTER":
        return "مركز تدريب";
      case "TESTING_CENTER":
        return "مركز اختبار";
      case "STUDENT":
        return "متدرب";
      default:
        return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">معلق</Badge>;
      case "suspended":
        return <Badge variant="destructive">موقوف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    updateStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
              <p className="text-gray-600">
                عرض وإدارة جميع المستخدمين في النظام
              </p>
            </div>
          </div>
          <Link href="/super-admin/users/create">
            <Button>
              إضافة مستخدم جديد
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>نوع الحساب</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/super-admin/users/${user.id}/edit`}>
                          <Button variant="outline" size="sm">
                            تعديل
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          className={user.status === "active" ? "text-destructive" : "text-green-600"}
                        >
                          {user.status === "active" ? "إيقاف" : "تفعيل"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}