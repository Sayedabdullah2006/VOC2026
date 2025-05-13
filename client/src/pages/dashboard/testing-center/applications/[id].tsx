import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, ClipboardCheck, FileCheck, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { VerticalProgressTracker } from "@/components/applications/vertical-progress-tracker";
import { getApplicationProgressSteps } from "@/components/applications/application-steps";

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

export default function TestingCenterApplicationDetailsPage() {
  const { id } = useParams();
  // نستخدم مسار معدل لطلبات مراكز الاختبار
  const { data: application, isLoading } = useQuery({
    queryKey: [`/api/testing-center-applications/${id}`],
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

  const getFileUrl = (path: string) => {
    if (!path) return '';
    
    // إذا كان المسار يحتوي على uploads/، استخدم المسار الثابت
    if (path.includes('uploads/')) {
      // تأكد من إضافة / في بداية المسار إذا لم يكن موجودًا
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    // للمسارات الأخرى، إضافة بادئة /uploads/
    return `/uploads/${path}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">تفاصيل طلب اعتماد مركز اختبار</h1>
            <p className="text-gray-600">معرف الطلب: {formatApplicationId(application.id)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">حالة الطلب:</div>
            {getStatusBadge(application.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* مسار الطلب العمودي - العمود الأيسر */}
          <div className="md:col-span-3 space-y-6 md:order-3">
            {/* مكون مسار الطلب */}
            <VerticalProgressTracker 
              steps={getApplicationProgressSteps(application.status)} 
              className="sticky top-24"
            />
            
            {/* معلومات المراجعة */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المراجعة</CardTitle>
                <CardDescription>حالة مراجعة الطلب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">تاريخ تقديم الطلب</div>
                  <div className="font-medium">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleString('ar-SA') : 'غير محدد'}
                  </div>
                </div>
                
                {application.reviewedAt && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-500">تاريخ المراجعة</div>
                      <div className="font-medium">
                        {new Date(application.reviewedAt).toLocaleString('ar-SA')}
                      </div>
                    </div>
                    
                    {application.reviewNotes && (
                      <div>
                        <div className="text-sm text-gray-500">ملاحظات المراجعة</div>
                        <div className="p-3 bg-gray-50 rounded-md text-sm">
                          {application.reviewNotes}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {application.status === "مقبول" && application.certificateId && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-500">شهادة الاعتماد</div>
                      <div className="mt-2">
                        <a
                          href={`/certificates/${application.certificateId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          عرض شهادة الاعتماد
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* محتوى الطلب الرئيسي - العمود الأيمن */}
          <div className="md:col-span-9 space-y-6 md:order-1">
            <Card>
              <CardHeader>
                <CardTitle>معلومات مركز الاختبار</CardTitle>
                <CardDescription>المعلومات الأساسية لمركز الاختبار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">اسم المركز</div>
                    <div className="font-medium">{application.centerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">اسم المدير</div>
                    <div className="font-medium">{application.managerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">رقم الهاتف</div>
                    <div className="font-medium">{application.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                    <div className="font-medium">{application.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">العنوان</div>
                    <div className="font-medium">{application.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">المدينة</div>
                    <div className="font-medium">{application.cityName || application.city}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(application.commercialRecordPath || application.financialGuaranteePath || application.identityDocumentsPath) && (
              <Card>
                <CardHeader>
                  <CardTitle>المستندات المرفقة</CardTitle>
                  <CardDescription>المستندات التي تم إرفاقها مع الطلب</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.commercialRecordPath && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">السجل التجاري</div>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <a
                          href={getFileUrl(application.commercialRecordPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          عرض السجل التجاري
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {application.financialGuaranteePath && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">وثيقة الضمان المالي</div>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <a
                          href={getFileUrl(application.financialGuaranteePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          عرض وثيقة الضمان المالي
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {application.identityDocumentsPath && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">وثائق الهوية</div>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <a
                          href={getFileUrl(application.identityDocumentsPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          عرض وثائق الهوية
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}