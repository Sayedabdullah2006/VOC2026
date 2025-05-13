import React, { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Calendar, ClipboardCheck, ExternalLink, FileCheck, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// وظيفة مساعدة لتنسيق رقم الطلب
const formatApplicationId = (id: number): string => {
  const idStr = id.toString();
  if (idStr.length >= 11) {
    const year = idStr.slice(0, 4);
    const month = idStr.slice(4, 6);
    const day = idStr.slice(6, 8);
    const sequence = idStr.slice(8);
    return `${year}${month}${day}-${sequence}`;
  }
  return idStr;
};

// وظيفة مساعدة لإظهار حالة الطلب بشكل مرئي
const getStatusBadge = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return <Badge variant="secondary" className="flex gap-2 items-center">
        <Search className="h-4 w-4" />
        تحت المراجعة
      </Badge>;
    case "زيارة ميدانية":
      return <Badge variant="outline" className="flex gap-2 items-center bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="h-4 w-4" />
        زيارة ميدانية
      </Badge>;
    case "تحت التقييم":
      return <Badge variant="outline" className="flex gap-2 items-center bg-orange-50 text-orange-700 border-orange-200">
        <ClipboardCheck className="h-4 w-4" />
        تحت التقييم
      </Badge>;
    case "مقبول":
      return <Badge variant="outline" className="flex gap-2 items-center bg-green-50 text-green-700 border-green-200">
        <FileCheck className="h-4 w-4" />
        مقبول
      </Badge>;
    case "مرفوض":
      return <Badge variant="destructive" className="flex gap-2 items-center">
        <AlertTriangle className="h-4 w-4" />
        مرفوض
      </Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

interface Application {
  id: number;
  centerName: string;
  managerName: string;
  city: string;
  submittedAt: string;
  status: string;
  reviewNotes?: string;
  type: string;
}

export default function TestingCenterApplicationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب طلبات المستخدم من نوع مركز اختبار
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['/api/testing-centers/applications'],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4">جاري التحميل...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">طلبات اعتماد مركز الاختبار</h1>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">لا توجد طلبات اعتماد</h3>
                <p className="text-gray-600 mb-6">
                  لم تقم بتقديم أي طلبات لاعتماد مركز اختبار حتى الآن.
                </p>
                <Button asChild>
                  <Link href="/TestingCenter/register">
                    طلب اعتماد مركز اختبار جديد
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>اسم المركز</TableHead>
                  <TableHead>اسم المدير</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>تاريخ التقديم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application: Application) => (
                  <TableRow key={application.id}>
                    <TableCell>{formatApplicationId(application.id)}</TableCell>
                    <TableCell>{application.centerName}</TableCell>
                    <TableCell>{application.managerName}</TableCell>
                    <TableCell>{application.city}</TableCell>
                    <TableCell>
                      {format(new Date(application.submittedAt), "PPP", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <Link href={`/TestingCenter/applications/${application.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}