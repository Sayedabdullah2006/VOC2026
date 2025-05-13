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
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return <Badge variant="secondary">تحت المراجعة</Badge>;
    case "زيارة ميدانية":
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">زيارة ميدانية</Badge>;
    case "تحت التقييم":
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200">تحت التقييم</Badge>;
    case "مقبول":
      return <Badge className="bg-green-50 text-green-700 border-green-200">مقبول</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const TrainingCenterDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: applications = [] } = useQuery({
    queryKey: [`/api/training-center-applications/user/${user?.id}`],
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold">لوحة تحكم مركز التدريب</h1>

        {/* قسم طلبات التسجيل */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>طلبات تسجيل مركز التدريب</CardTitle>
              <CardDescription>آخر طلبات تسجيل المركز وحالتها</CardDescription>
            </div>
            {/* إظهار زر تقديم طلب جديد إذا لم يكن هناك طلب قيد المراجعة */}
            {!applications.find(app => 
              app.status === 'تحت المراجعة' || 
              app.status === 'زيارة ميدانية' || 
              app.status === 'تحت التقييم'
            ) && (
              <Link href="/dashboard/centers/register">
                <Button>تقديم طلب جديد</Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        <span className="ml-2">رقم الطلب:</span>
                        {application.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="ml-2">المركز:</span>
                        {application.centerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="ml-2">المدير:</span>
                        {application.managerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="ml-2">المدينة:</span>
                        {application.city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(application.submittedAt), "PPP", { locale: ar })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(application.status)}
                      <Link href={`/dashboard/centers/applications/${application.id}`}>
                        <Button variant="outline" size="sm">عرض التفاصيل</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد طلبات مقدمة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainingCenterDashboard;