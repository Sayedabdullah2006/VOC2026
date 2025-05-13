import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronRight, ClipboardCheck, FileCheck, AlertTriangle, Search, Calendar, Award } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus, statusOptions } from "@shared/constants";
import { queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return <Search className="h-4 w-4 text-gray-500" />;
    case "زيارة ميدانية":
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case "تحت التقييم":
      return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
    case "مقبول":
      return <FileCheck className="h-4 w-4 text-green-500" />;
    case "مرفوض":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "تحت المراجعة":
      return <Badge variant="secondary" className="flex gap-2 items-center">
        <Search className="h-4 w-4" />
        تحت المراجعة
      </Badge>;
    case "زيارة ميدانية":
      return <Badge variant="info" className="flex gap-2 items-center bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="h-4 w-4" />
        زيارة ميدانية
      </Badge>;
    case "تحت التقييم":
      return <Badge variant="warning" className="flex gap-2 items-center bg-orange-50 text-orange-700 border-orange-200">
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

export default function ApplicationDetailsManagementPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");

  const { data: application, isLoading } = useQuery({
    queryKey: [`/api/training-center-applications/${id}`],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/training-center-applications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, reviewNotes }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update application status");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الطلب",
        description: "تم تحديث حالة الطلب بنجاح",
      });
      queryClient.invalidateQueries([`/api/training-center-applications/${id}`]);
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/training-center-applications/${id}/certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to issue certificate");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إصدار الشهادة",
        description: "تم إصدار شهادة مركز التدريب بنجاح",
      });
      queryClient.invalidateQueries([`/api/training-center-applications/${id}`]);
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
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

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          الطلب غير موجود
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <Link href="/super-admin/training-centers/applications">
          <Button variant="ghost" className="mb-4">
            <ChevronRight className="h-4 w-4 ml-2" />
            العودة للطلبات
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
              <CardDescription>
                تاريخ التقديم:{" "}
                {format(new Date(application.submittedAt), "PPP", {
                  locale: ar,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">اسم المركز</h3>
                <p>{application.centerName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">اسم المدير</h3>
                <p>{application.managerName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">المدينة</h3>
                <p>{application.city}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">العنوان</h3>
                <p>{application.address}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">رقم الهاتف</h3>
                <p dir="ltr">{application.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">البريد الإلكتروني</h3>
                <p dir="ltr">{application.email}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">الحالة الحالية</h3>
                {getStatusBadge(application.status)}
              </div>
              {application.status === "مقبول" && !application.certificateId && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => issueCertificateMutation.mutate()}
                  disabled={issueCertificateMutation.isPending}
                >
                  <Award className="h-4 w-4 ml-2" />
                  {issueCertificateMutation.isPending ? "جاري إصدار الشهادة..." : "إصدار شهادة"}
                </Button>
              )}
              {application.certificateId && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href={`/certificates/view/${application.certificateId}`}>
                    <FileCheck className="h-4 w-4 ml-2" />
                    عرض الشهادة
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المستندات المرفقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">السجل التجاري</h3>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`/uploads/${application.commercialRecordPath.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    عرض السجل التجاري
                  </a>
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">خطاب الضمان المالي</h3>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`/uploads/${application.financialGuaranteePath.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    عرض خطاب الضمان
                  </a>
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">وثائق إثبات الهوية</h3>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`/uploads/${application.identityDocumentsPath.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    عرض وثائق الهوية
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تحديث حالة الطلب</CardTitle>
              <CardDescription>
                قم بتحديث حالة الطلب وإضافة الملاحظات اللازمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">الحالة الجديدة</label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة الجديدة">
                      {status && (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span>{status}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(option.value)}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">الملاحظات</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => updateStatusMutation.mutate()}
                disabled={!status || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "جاري التحديث..." : "تحديث الحالة"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}