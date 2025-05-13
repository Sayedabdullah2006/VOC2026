import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">لوحة تحكم المسؤول الشامل</h1>
            <p className="text-gray-600">
              مرحباً بك في لوحة تحكم النظام الشاملة
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات السريعة */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>
              إجراءات مباشرة لإدارة النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <a href="/super-admin/stats">
                  عرض الإحصائيات
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/super-admin/training-centers/applications">
                  مراجعة طلبات مراكز التدريب
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/super-admin/testing-centers/applications">
                  مراجعة طلبات مراكز الاختبار
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/super-admin/certificate-matching">
                  مطابقة الشهادات
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/super-admin/users">
                  إدارة المستخدمين
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}