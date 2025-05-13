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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ChevronRight,
  Pencil,
  Search,
  Calendar,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Download,
  Building2,
  User,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

const StatusTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const statuses = [
    { key: "تحت المراجعة", label: "تحت المراجعة", icon: Search },
    { key: "زيارة ميدانية", label: "زيارة ميدانية", icon: Calendar },
    { key: "تحت التقييم", label: "تحت التقييم", icon: ClipboardCheck },
    { key: "مقبول", label: "مقبول", icon: FileCheck },
  ];

  const currentIndex = statuses.findIndex(s => s.key === currentStatus);
  const progress = ((currentIndex + 1) / statuses.length) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-2" />
      <div className="grid grid-cols-4 gap-2">
        {statuses.map((status, index) => {
          const Icon = status.icon;
          const isCurrent = status.key === currentStatus;
          const isPast = index <= currentIndex;
          return (
            <div
              key={status.key}
              className={`flex flex-col items-center text-center ${
                isPast ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`rounded-full p-2 ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isPast
                    ? "bg-primary/20"
                    : "bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs mt-1">{status.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: [`/api/training-center-applications/${id}`],
  });

  const editApplicationMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(
        `/api/training-center-applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل تحديث بيانات الطلب");
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

  const canEdit = application.status === "تحت المراجعة" || application.status === "مرفوض";

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <Link href="/centers/applications">
        <Button variant="ghost" className="mb-6">
          <ChevronRight className="h-4 w-4 ml-2" />
          العودة للطلبات
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">طلب تسجيل مركز تدريب #{id}</h1>
              <p className="text-muted-foreground mt-1">
                تم التقديم في {" "}
                {format(new Date(application.submittedAt), "PPP", {
                  locale: ar,
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(application.status)}
              {canEdit && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="hidden md:flex"
                >
                  <Pencil className="h-4 w-4 ml-2" />
                  تعديل البيانات
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلب</CardTitle>
            <CardDescription>تتبع مراحل معالجة طلبك</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={application.status} />
          </CardContent>
        </Card>

        {/* Edit Button for Mobile */}
        {canEdit && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full md:hidden"
            variant="outline"
          >
            <Pencil className="h-4 w-4 ml-2" />
            تعديل البيانات وإعادة تقديم الطلب
          </Button>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات المركز</CardTitle>
              <CardDescription>البيانات الأساسية للمركز</CardDescription>
            </CardHeader>
            <CardContent>
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
                      phone: formData.get('phone'),
                      email: formData.get('email'),
                    };
                    editApplicationMutation.mutate(updatedData);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="font-medium mb-1 block">اسم المركز</label>
                    <Input
                      name="centerName"
                      defaultValue={application.centerName}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">اسم المدير</label>
                    <Input
                      name="managerName"
                      defaultValue={application.managerName}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">المدينة</label>
                    <Input
                      name="city"
                      defaultValue={application.city}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">العنوان</label>
                    <Input
                      name="address"
                      defaultValue={application.address}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">رقم الهاتف</label>
                    <Input
                      name="phone"
                      defaultValue={application.phone}
                      className="w-full"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">البريد الإلكتروني</label>
                    <Input
                      name="email"
                      defaultValue={application.email}
                      className="w-full"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
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
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">اسم المركز</p>
                      <p className="text-muted-foreground">{application.centerName}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">اسم المدير</p>
                      <p className="text-muted-foreground">{application.managerName}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">المدينة</p>
                      <p className="text-muted-foreground">{application.city}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">العنوان</p>
                      <p className="text-muted-foreground">{application.address}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">رقم الهاتف</p>
                      <p className="text-muted-foreground" dir="ltr">{application.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">البريد الإلكتروني</p>
                      <p className="text-muted-foreground" dir="ltr">{application.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المستندات المرفقة</CardTitle>
                <CardDescription>المستندات المطلوبة للتسجيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">السجل التجاري</h3>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={`/api/uploads/${application.commercialRecordPath.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        تحميل الملف
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">خطاب الضمان المالي</h3>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={`/api/uploads/${application.financialGuaranteePath.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        تحميل الملف
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">وثائق إثبات الهوية</h3>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={`/api/uploads/${application.identityDocumentsPath.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        تحميل الملف
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Notes Section */}
            {application.reviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات المراجعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{application.reviewNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}