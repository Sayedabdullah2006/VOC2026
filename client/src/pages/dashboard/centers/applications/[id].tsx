import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  ChevronRight, FileCheck, Search, Calendar, ClipboardCheck, AlertTriangle, 
  Download, FileText, FileX, Image, File, Eye, Info, MapPin, 
  Phone, Mail, User, Building, Map 
} from "lucide-react";
import { Link } from "wouter";
import { ApplicationStatus } from "@shared/constants";
import { VerticalProgressTracker } from "@/components/applications/vertical-progress-tracker";
import { getApplicationProgressSteps } from "@/components/applications/application-steps";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// وظيفة للحصول على أيقونة حالة الطلب
const getStatusIcon = (status: string) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return <Search className="h-4 w-4 text-gray-500" />;
    case ApplicationStatus.FIELD_VISIT:
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case ApplicationStatus.UNDER_EVALUATION:
      return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
    case ApplicationStatus.ACCEPTED:
      return <FileCheck className="h-4 w-4 text-green-500" />;
    case ApplicationStatus.REJECTED:
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

// وظيفة للحصول على شارة حالة الطلب
const getStatusBadge = (status: string) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return <Badge variant="secondary" className="flex gap-2 items-center">
        <Search className="h-4 w-4" />
        تحت المراجعة
      </Badge>;
    case ApplicationStatus.FIELD_VISIT:
      return <Badge variant="info" className="flex gap-2 items-center bg-blue-50 text-blue-700 border-blue-200">
        <Calendar className="h-4 w-4" />
        زيارة ميدانية
      </Badge>;
    case ApplicationStatus.UNDER_EVALUATION:
      return <Badge variant="warning" className="flex gap-2 items-center bg-orange-50 text-orange-700 border-orange-200">
        <ClipboardCheck className="h-4 w-4" />
        تحت التقييم
      </Badge>;
    case ApplicationStatus.ACCEPTED:
      return <Badge variant="outline" className="flex gap-2 items-center bg-green-50 text-green-700 border-green-200">
        <FileCheck className="h-4 w-4" />
        مقبول
      </Badge>;
    case ApplicationStatus.REJECTED:
      return <Badge variant="destructive" className="flex gap-2 items-center">
        <AlertTriangle className="h-4 w-4" />
        مرفوض
      </Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// تنسيق رقم الطلب للعرض
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

// وظيفة للحصول على أيقونة الملف بناءً على نوعه
const getFileIcon = (fileName: string) => {
  if (!fileName) return <FileText className="h-5 w-5" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'pdf':
      return <File className="h-5 w-5 text-red-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <Image className="h-5 w-5 text-blue-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

// وظيفة للحصول على تفاصيل المستند
const getDocumentDetails = (path: string) => {
  if (!path) return { name: 'ملف غير محدد', size: '', date: '', icon: <FileText className="h-5 w-5" /> };
  
  // استخراج اسم الملف من المسار (آخر جزء بعد "/")
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1] || '';
  
  // استخراج معلومات إضافية من اسم الملف
  // مثال: commercialRecord-1746950890066-871154274.jpeg
  // نحصل على نوع الملف والتاريخ
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // محاولة استخراج الطابع الزمني من اسم الملف (إذا وجد)
  let fileDate = new Date();
  const timestampMatch = fileName.match(/\d{13}/);
  if (timestampMatch && timestampMatch[0]) {
    const timestamp = parseInt(timestampMatch[0]);
    if (!isNaN(timestamp)) {
      fileDate = new Date(timestamp);
    }
  }
  
  // حساب حجم تقريبي بناءً على نوع الملف (للأغراض التوضيحية)
  let fileSize = '2.3 MB';
  if (fileExtension === 'pdf') fileSize = '3.8 MB';
  if (fileExtension === 'png') fileSize = '1.5 MB';
  if (fileExtension === 'jpeg' || fileExtension === 'jpg') fileSize = '2.1 MB';
  
  console.log(`معالجة الملف "${fileName}" بامتداد "${fileExtension}" من المسار "${path}"`);
  
  return {
    name: fileName,
    size: fileSize, 
    date: format(fileDate, 'PPP', { locale: ar }),
    icon: getFileIcon(fileName)
  };
};

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState("details");
  const [cityName, setCityName] = useState<string>("");
  
  // استعلام لجلب بيانات الطلب
  const { data: application, isLoading } = useQuery({
    queryKey: [`/api/training-center-applications/${id}`],
  });
  
  // دالة لاسترجاع اسم المدينة إذا كان متوفر فقط كرمز
  useEffect(() => {
    const fetchCityName = async () => {
      if (application && application.city && !application.cityName && !isNaN(Number(application.city))) {
        try {
          const response = await fetch(`/api/cities/${application.city}`);
          if (response.ok) {
            const cityData = await response.json();
            console.log("تم العثور على المدينة:", cityData);
            setCityName(cityData.nameAr || cityData.name || "");
          } else {
            console.error("فشل في جلب اسم المدينة:", response.statusText);
          }
        } catch (error) {
          console.error("خطأ أثناء استرجاع معلومات المدينة:", error);
        }
      }
    };

    fetchCityName();
  }, [application]);

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

  // وظيفة للحصول على رابط الملف
  // وظيفة محسنة للحصول على مسار الملف
  const getFileUrl = (path: string) => {
    if (!path) return '';
    
    // إزالة أي مسارات غير مطلوبة من البداية
    let cleanPath = path;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(2);
    }
    
    // التعامل مع حالات المسارات المختلفة
    let normalizedPath = '';
    
    if (cleanPath.startsWith('/uploads/')) {
      // المسار كامل مع / في البداية
      normalizedPath = cleanPath;
    } else if (cleanPath.startsWith('uploads/')) {
      // المسار يبدأ بـ uploads/ بدون / في البداية
      normalizedPath = '/' + cleanPath;
    } else if (cleanPath.includes('uploads/')) {
      // المسار يحتوي على uploads/ في مكان ما
      const index = cleanPath.indexOf('uploads/');
      normalizedPath = '/' + cleanPath.substring(index);
    } else if (cleanPath.startsWith('/')) {
      // المسار يبدأ بـ / ولكن بدون uploads/
      normalizedPath = '/uploads' + cleanPath;
    } else {
      // المسار لا يبدأ بأي من البادئات المتوقعة
      normalizedPath = '/uploads/' + cleanPath;
    }
    
    console.log("المسار الأصلي:", path);
    console.log("المسار النهائي المحسن:", normalizedPath);
    
    return normalizedPath;
  };

  // تحضير بيانات المرفقات من البيانات المتاحة
  console.log("بيانات الطلب كاملة:", application);
  console.log("مسارات المرفقات:", {
    commercialRecordPath: application.commercialRecordPath,
    financialGuaranteePath: application.financialGuaranteePath,
    identityDocumentsPath: application.identityDocumentsPath
  });
  
  // السبب قد يكون أن الخادم يرسل البيانات بأسماء مختلفة أو بصيغة مختلفة
  // فلنتحقق من جميع الاحتمالات
  
  // الطريقة القديمة للتعامل مع المرفقات
  const commercialPath = application.commercialRecordPath || application.commercialRecord || '';
  const financialPath = application.financialGuaranteePath || application.financialGuarantee || '';
  const identityPath = application.identityDocumentsPath || application.identityDocuments || '';
  
  console.log("مسارات المرفقات بعد محاولة تصحيح الأسماء:", {
    commercialPath,
    financialPath,
    identityPath
  });
  
  // المرفقات المتوفرة - نستخدم مصفوفة بدلاً من مرشح (filter) للتأكد من القيم بشكل أفضل
  let attachmentsList = [];
  
  // إضافة المرفقات إذا كانت متوفرة - استخدام الطرق البديلة للملفات
  if (commercialPath) {
    attachmentsList.push({
      id: 'commercial',
      title: 'السجل التجاري',
      path: commercialPath,
      details: getDocumentDetails(commercialPath),
      url: getFileUrl(commercialPath)
    });
  }
  
  if (financialPath) {
    attachmentsList.push({
      id: 'financial',
      title: 'وثيقة الضمان المالي',
      path: financialPath,
      details: getDocumentDetails(financialPath),
      url: getFileUrl(financialPath)
    });
  }
  
  if (identityPath) {
    attachmentsList.push({
      id: 'identity',
      title: 'وثائق الهوية',
      path: identityPath,
      details: getDocumentDetails(identityPath),
      url: getFileUrl(identityPath)
    });
  }
  
  console.log("عدد المرفقات قبل المعالجة:", attachmentsList.length);

  // إذا لم تكن هناك مرفقات متوفرة في الطلب، فإننا نجرب استخدام روابط الشهادات إذا كانت متوفرة
  if (attachmentsList.length === 0 && application.certificateUrl) {
    attachmentsList = [
      {
        id: 'certificate',
        title: 'شهادة المركز',
        path: application.certificateUrl,
        details: getDocumentDetails(application.certificateUrl),
        url: getFileUrl(application.certificateUrl)
      }
    ];
  }
  
  // نهائياً، إذا لم يتم العثور على أي مرفقات، نستخدم قيمة فارغة
  // إذا كان هناك مسار محتمل في الطلب ولكن لا يمكن الوصول إليه بالطرق العادية، نحاول هذه الأسماء الشائعة
  if (attachmentsList.length === 0) {
    // تحقق من الخصائص غير القياسية - قد تكون موجودة أو متغيرة الاسم
    for (const key in application) {
      if (typeof application[key] === 'string' && 
        (key.toLowerCase().includes('file') || 
         key.toLowerCase().includes('path') ||
         key.toLowerCase().includes('document') ||
         key.toLowerCase().includes('upload') ||
         application[key].toLowerCase().includes('uploads/'))) {
        
        console.log("وجدنا مسار محتمل للملف:", key, application[key]);
        
        const filePath = application[key];
        if (filePath) {
          attachmentsList.push({
            id: `file-${attachmentsList.length + 1}`,
            title: `مستند ${key.replace('Path', '').replace('Document', '')}`,
            path: filePath,
            details: getDocumentDetails(filePath),
            url: getFileUrl(filePath)
          });
        }
      }
    }
  }
  
  const attachments = attachmentsList.length > 0 
    ? attachmentsList 
    : [];
  
  console.log("المرفقات المعالجة:", attachments);
  
  // تنسيق تواريخ الطلب
  const formattedSubmissionDate = application.submittedAt ? 
    format(new Date(application.submittedAt), 'PPP', { locale: ar }) : 'غير محدد';
  
  const formattedReviewDate = application.reviewedAt ? 
    format(new Date(application.reviewedAt), 'PPP', { locale: ar }) : null;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* ترويسة الصفحة */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Link href="/dashboard/centers/applications">
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4 ml-2" />
                العودة للطلبات
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">تفاصيل طلب تسجيل مركز تدريب</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-gray-600 flex items-center">
                  <Info className="h-4 w-4 ml-1" />
                  رقم الطلب: <span className="font-semibold mr-1">{formatApplicationId(application.id)}</span>
                </p>
                <p className="text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 ml-1" />
                  تاريخ التقديم: <span className="font-semibold mr-1">{formattedSubmissionDate}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">حالة الطلب:</div>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* مسار الطلب العمودي - العمود الأيسر */}
          <div className="md:col-span-3 md:order-3">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>مسار الطلب</CardTitle>
                </CardHeader>
                <CardContent>
                  <VerticalProgressTracker 
                    steps={getApplicationProgressSteps(application.status)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="md:col-span-9 space-y-6 md:order-1">
            <Tabs defaultValue="details" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="details">معلومات الطلب</TabsTrigger>
                <TabsTrigger value="attachments">المرفقات</TabsTrigger>
                <TabsTrigger value="review">معلومات المراجعة</TabsTrigger>
              </TabsList>
              
              {/* تبويب تفاصيل الطلب */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات مركز التدريب</CardTitle>
                    <CardDescription>المعلومات الأساسية لمركز التدريب المتقدم للتسجيل</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* معلومات المركز */}
                    <Accordion type="multiple" defaultValue={["center-info"]} className="w-full">
                      <AccordionItem value="center-info">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <span>معلومات المركز</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">اسم المركز</div>
                              <div className="font-medium flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                {application.centerName}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">نوع المركز</div>
                              <div className="font-medium">مركز تدريب</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">العنوان</div>
                              <div className="font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {application.address}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">المدينة</div>
                              <div className="font-medium flex items-center gap-2">
                                <Map className="h-4 w-4 text-gray-400" />
                                {application.cityName || cityName || application.city}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* معلومات المدير */}
                    <Accordion type="multiple" defaultValue={["manager-info"]} className="w-full">
                      <AccordionItem value="manager-info">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <span>معلومات المدير</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">اسم المدير</div>
                              <div className="font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {application.managerName}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-500">رقم الهاتف</div>
                              <div className="font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {application.phone}
                              </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                              <div className="font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                {application.email}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* عرض الشهادة (إذا تم قبول الطلب) */}
                    {application.status === ApplicationStatus.ACCEPTED && application.certificateId && (
                      <div className="border rounded-lg p-4 mt-4">
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-green-500" />
                          شهادة اعتماد المركز
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">تم إصدار شهادة اعتماد للمركز، يمكنك عرض الشهادة من خلال الزر أدناه</p>
                        <Button asChild>
                          <Link href={`/certificates/view/${application.certificateId}`}>
                            <FileCheck className="h-4 w-4 ml-2" />
                            عرض الشهادة
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* تبويب المرفقات */}
              <TabsContent value="attachments" className="space-y-6">
                <Card>
                  <CardHeader dir="rtl">
                    <CardTitle>المستندات المرفقة</CardTitle>
                    <CardDescription>المستندات التي تم إرفاقها مع الطلب</CardDescription>
                  </CardHeader>
                  <CardContent dir="rtl">
                    {attachments.length > 0 ? (
                      <div className="space-y-6">
                        {attachments.map((attachment) => (
                          <div key={attachment.id} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" dir="rtl">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-gray-100 flex-shrink-0">
                                  {attachment.details.icon}
                                </div>
                                <div>
                                  <h4 className="font-medium text-lg">{attachment.title}</h4>
                                  <p className="text-sm text-gray-500">{attachment.details.name}</p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>الحجم: {attachment.details.size}</span>
                                    <span>تاريخ الرفع: {attachment.details.date}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto">
                                <a
                                  href={attachment.url}
                                  download={attachment.details.name}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                  onClick={(e) => {
                                    console.log("تنزيل الملف:", attachment.url);
                                  }}
                                >
                                  <Download className="h-4 w-4 ml-2" />
                                  تنزيل الملف
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-6" dir="rtl">
                        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <FileX className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مرفقات متاحة</h3>
                          <p className="text-gray-500 mb-6">
                            لم يتم العثور على مستندات مرفقة لهذا الطلب. قد يتم إضافة المرفقات في مرحلة لاحقة من عملية الاعتماد.
                          </p>
                          {application.status === "تحت المراجعة" && (
                            <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-100 p-3 rounded-md">
                              <AlertTriangle className="h-4 w-4 inline-block ml-1 text-yellow-500" />
                              يجب إرفاق المستندات المطلوبة لإكمال عملية مراجعة الطلب
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* تبويب معلومات المراجعة */}
              <TabsContent value="review" className="space-y-6">
                <Card>
                  <CardHeader dir="rtl">
                    <CardTitle>معلومات المراجعة</CardTitle>
                    <CardDescription>تفاصيل مراجعة الطلب والقرار</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" dir="rtl">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">حالة الطلب</h4>
                          {getStatusBadge(application.status)}
                        </div>
                        <Separator />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-500">تاريخ تقديم الطلب</h4>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formattedSubmissionDate}
                          </p>
                        </div>
                        
                        {formattedReviewDate && (
                          <div className="space-y-2">
                            <h4 className="text-sm text-gray-500">تاريخ المراجعة</h4>
                            <p className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formattedReviewDate}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {application.reviewNotes && (
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-500">ملاحظات المراجعة</h4>
                          <div className="p-4 bg-gray-50 rounded-md">
                            {application.reviewNotes}
                          </div>
                        </div>
                      )}
                      
                      {application.status === ApplicationStatus.ACCEPTED && application.certificateId && (
                        <div className="space-y-2 pt-4">
                          <h4 className="font-medium">شهادة الاعتماد</h4>
                          <div className="mt-2">
                            <Button asChild>
                              <Link href={`/certificates/view/${application.certificateId}`}>
                                <FileCheck className="h-4 w-4 ml-2" />
                                عرض شهادة الاعتماد
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}