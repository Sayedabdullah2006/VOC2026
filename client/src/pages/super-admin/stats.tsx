import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { ChartBar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Building2, School, ClipboardList, CheckCircle, Clock } from "lucide-react";

interface DashboardStats {
  users: {
    total: number;
    byRole: {
      training_center: number;
      testing_center: number;
      student: number;
      admin: number;
      super_admin: number;
    };
  };
  trainingCenters: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    approved: number;
    rejected: number;
  };
  testingCenters: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    approved: number;
    rejected: number;
  };
}

export default function SuperAdminStatsPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5000,
    gcTime: 10000,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <ChartBar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">إحصائيات النظام</h1>
            <p className="text-gray-600">
              عرض شامل لإحصائيات المنصة
            </p>
          </div>
        </div>

        {/* طلبات مراكز التدريب */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">طلبات مراكز التدريب</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.trainingCenters.new ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تحتاج إلى مراجعة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.trainingCenters.inProgress ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تحت المراجعة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات مكتملة</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.trainingCenters.completed ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تمت معالجتها
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* طلبات مراكز الاختبار */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">طلبات مراكز الاختبار</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات جديدة</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.testingCenters.new ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تحتاج إلى مراجعة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.testingCenters.inProgress ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تحت المراجعة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات مكتملة</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : (stats?.testingCenters.completed ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  طلبات تمت معالجتها
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* إحصائيات المستخدمين */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">إحصائيات المستخدمين</h2>
          <Card>
            <CardHeader>
              <CardTitle>توزيع المستخدمين</CardTitle>
              <CardDescription>
                إجمالي عدد المستخدمين: {isLoading ? '...' : (stats?.users.total ?? 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">مراكز التدريب</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : (stats?.users.byRole.training_center ?? 0)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">مراكز الاختبار</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : (stats?.users.byRole.testing_center ?? 0)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">المتدربين</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : (stats?.users.byRole.student ?? 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}