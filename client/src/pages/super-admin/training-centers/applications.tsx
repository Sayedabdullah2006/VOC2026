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
import { Eye, Search, Calendar, ClipboardCheck, FileCheck, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/dashboard-layout";

const formatApplicationId = (id: number): string => {
  const idStr = id.toString();
  if (idStr.length >= 8) {
    const year = idStr.slice(0, 4);
    const month = idStr.slice(4, 6);
    const day = idStr.slice(6, 8);
    const sequence = idStr.slice(8);
    return `${year}${month}${day}-${sequence.padStart(3, '0')}`;
  }
  return id.toString().padStart(5, '0');
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return <Badge variant="secondary" className="flex gap-2 items-center">
        <Search className="h-4 w-4" />
        تحت المراجعة
      </Badge>;
    case "زيارة ميدانية":
      return <Badge variant="secondary" className="flex gap-2 items-center bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="h-4 w-4" />
        زيارة ميدانية
      </Badge>;
    case "تحت التقييم":
      return <Badge variant="secondary" className="flex gap-2 items-center bg-orange-50 text-orange-700 border-orange-200">
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
  type: string;
  reviewNotes?: string;
}

export default function ApplicationsManagementPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/training-center-applications"],
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
          <h1 className="text-2xl font-bold">إدارة طلبات مراكز التدريب</h1>
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
                      <Link href={`/super-admin/training-centers/applications/${application.id}`}>
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