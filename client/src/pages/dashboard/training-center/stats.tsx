import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartPie, Users2, GraduationCap, CalendarRange } from "lucide-react";

interface CenterStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  coursesByStatus: {
    'مجدولة': number;
    'قيد التنفيذ': number;
    'منتهية': number;
    'ملغاة': number;
  };
}

export default function TrainingCenterStatsPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<CenterStats>({
    queryKey: [`/api/training-centers/${user?.id}/stats`],
    enabled: !!user?.id
  });

  console.log('Training Center Stats:', stats);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <ChartPie className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">إحصائيات المركز</h1>
            <p className="text-gray-600">
              نظرة عامة على أداء المركز والإحصائيات الرئيسية
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* إجمالي الطلاب */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                طالب مسجل في المركز
              </p>
            </CardContent>
          </Card>

          {/* الطلاب النشطين */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلاب النشطين</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats?.activeStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                طالب في دورات حالية
              </p>
            </CardContent>
          </Card>

          {/* الدورات النشطة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الدورات النشطة</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats?.activeCourses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                دورة قيد التنفيذ
              </p>
            </CardContent>
          </Card>

          {/* إجمالي الدورات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats?.totalCourses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                دورة تدريبية
              </p>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات تفصيلية للدورات */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الدورات</CardTitle>
              <CardDescription>
                نظرة عامة على حالات الدورات التدريبية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">دورات مجدولة</span>
                  <span className="font-medium">{isLoading ? '...' : stats?.coursesByStatus?.['مجدولة'] || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">دورات قيد التنفيذ</span>
                  <span className="font-medium">{isLoading ? '...' : stats?.coursesByStatus?.['قيد التنفيذ'] || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">دورات منتهية</span>
                  <span className="font-medium">{isLoading ? '...' : stats?.coursesByStatus?.['منتهية'] || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">دورات ملغاة</span>
                  <span className="font-medium">{isLoading ? '...' : stats?.coursesByStatus?.['ملغاة'] || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معدلات الدورات</CardTitle>
              <CardDescription>
                نسب إكمال وفعالية الدورات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">معدل الدورات النشطة</span>
                  <span className="font-medium">
                    {isLoading ? '...' : `${Math.round((stats?.activeCourses || 0) / (stats?.totalCourses || 1) * 100)}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">معدل الدورات المكتملة</span>
                  <span className="font-medium">
                    {isLoading ? '...' : `${Math.round((stats?.completedCourses || 0) / (stats?.totalCourses || 1) * 100)}%`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}