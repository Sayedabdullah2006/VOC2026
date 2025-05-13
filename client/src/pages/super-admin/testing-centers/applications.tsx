import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/dashboard-layout";

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">تحت المراجعة</Badge>;
    case "needs_modification":
      return <Badge variant="secondary">يحتاج تعديل</Badge>;
    case "field_visit":
      return <Badge variant="secondary">زيارة ميدانية</Badge>;
    case "failed_evaluation":
      return <Badge variant="destructive">فشل التقييم</Badge>;
    case "passed_evaluation":
      return <Badge variant="secondary">اجتاز التقييم</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">تم الموافقة</Badge>;
    case "rejected":
      return <Badge variant="destructive">مرفوض</Badge>;
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
}

export default function TestingCenterApplicationsPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/testing-center-applications/all"],
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          جاري التحميل...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة طلبات مراكز الاختبار</h1>
        </div>

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
              {applications && applications.length > 0 ? (
                applications.map((application) => (
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
                      <Link href={`/super-admin/testing-centers/applications/${application.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    لا توجد طلبات مقدمة
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