import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Users, BookOpen, FileCheck } from "lucide-react";

const AdminDashboard: React.FC = () => {
  // في المستقبل سيتم استبدال هذه البيانات بطلبات API حقيقية
  const stats = {
    totalCenters: 150,
    activeCenters: 120,
    pendingRequests: 15,
    totalStudents: 3500,
    completionRate: 75,
  };

  const recentRequests = [
    {
      id: 1,
      type: "مركز تدريب",
      name: "مركز التدريب المتقدم",
      status: "قيد المراجعة",
      date: "2024-02-06",
    },
    {
      id: 2,
      type: "مركز اختبار",
      name: "مركز الاختبارات الشامل",
      status: "قيد المراجعة",
      date: "2024-02-05",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>

        {/* إحصائيات عامة */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المراكز</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCenters}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCenters} مركز نشط
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">طلبات قيد المراجعة</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                طلب جديد هذا الأسبوع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المتدربين</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                متدرب مسجل في النظام
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة الإنجاز</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <Progress value={stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* قسم الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات مراكز التدريب والاختبار</CardTitle>
            <CardDescription>
              آخر الطلبات المقدمة من المراكز
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-muted-foreground">{request.type}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-orange-500">
                      {request.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;