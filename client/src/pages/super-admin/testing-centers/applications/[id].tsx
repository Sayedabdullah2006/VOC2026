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
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus, statusOptions, getStatusBadge } from "@shared/constants";

export default function TestingCenterApplicationDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: [`/api/testing-center-applications/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/testing-center-applications/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/testing-center-applications/${id}/status`,
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
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add edit mutation
  const editApplicationMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(
        `/api/testing-center-applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...updatedData, status: 'modified' }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update application");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث بيانات الطلب وإعادة إرساله بنجاح",
      });
      setIsEditing(false);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        جاري التحميل...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        الطلب غير موجود
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <Link href="/super-admin/testing-centers/applications">
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
            {application.status === 'needs_modification' && !isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="w-full mb-4"
              >
                تعديل البيانات
              </Button>
            )}
            {isEditing ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedData = {
                    centerName: formData.get('centerName'),
                    managerName: formData.get('managerName'),
                    city: formData.get('city'),
                    address: formData.get('address'),
                  };
                  editApplicationMutation.mutate(updatedData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="font-semibold mb-1">اسم المركز</label>
                  <input
                    name="centerName"
                    defaultValue={application.centerName}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold mb-1">اسم المدير</label>
                  <input
                    name="managerName"
                    defaultValue={application.managerName}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold mb-1">المدينة</label>
                  <input
                    name="city"
                    defaultValue={application.city}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold mb-1">العنوان</label>
                  <input
                    name="address"
                    defaultValue={application.address}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    حفظ التعديلات
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <>
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
                  <h3 className="font-semibold mb-1">الحالة الحالية</h3>
                  {application && (
                    <Badge 
                      variant={getStatusBadge(application.status).variant as any}
                      className={getStatusBadge(application.status).className || ""}
                    >
                      {getStatusBadge(application.status).label}
                    </Badge>
                  )}
                </div>
              </>
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
                  href={`/${application.commercialRecordPath}`}
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
                  href={`/${application.financialGuaranteePath}`}
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
                  href={`/${application.identityDocumentsPath}`}
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
                  <SelectValue placeholder="اختر الحالة الجديدة" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
  );
}