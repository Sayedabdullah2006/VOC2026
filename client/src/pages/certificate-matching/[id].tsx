import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, Clock, X, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

const statusColors = {
  "تم تقديم الطلب": "secondary",
  "تحت المراجعة": "warning",
  "مطابقة": "success",
  "غير مطابقة": "destructive",
} as const;

const statusIcons = {
  "تم تقديم الطلب": <Clock className="w-4 h-4 ms-1" />,
  "تحت المراجعة": <Clock className="w-4 h-4 ms-1" />,
  "مطابقة": <Check className="w-4 h-4 ms-1" />,
  "غير مطابقة": <X className="w-4 h-4 ms-1" />,
};

export default function CertificateMatchingDetailPage() {
  const [, params] = useRoute("/certificate-matching/:id");
  const matchingId = params?.id;
  const [, setLocation] = useLocation();

  // Fetch the certificate matching request details
  const { data: matchingRequest, isLoading, error } = useQuery({
    queryKey: [`/api/certificate-matching/${matchingId}`],
    queryFn: async () => {
      if (!matchingId) return null;
      const response = await fetch(`/api/certificate-matching/${matchingId}`);
      if (!response.ok) {
        throw new Error("فشل في جلب تفاصيل طلب مطابقة الشهادة");
      }
      return response.json();
    },
    enabled: !!matchingId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader 
          heading="تفاصيل طلب مطابقة الشهادة" 
          text="عرض تفاصيل طلب مطابقة الشهادة المقدم"
          variant="gradient"
          icon={<FileText className="h-5 w-5" />}
        />
        <Card className="mt-6 shadow-md text-center">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg">جاري تحميل التفاصيل...</p>
            <p className="text-sm text-muted-foreground mt-2">
              يرجى الانتظار بينما يتم جلب بيانات طلب مطابقة الشهادة
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (error || !matchingRequest) {
    return (
      <DashboardLayout>
        <DashboardHeader 
          heading="خطأ" 
          text="حدث خطأ أثناء جلب تفاصيل طلب مطابقة الشهادة"
          variant="minimal"
          icon={<X className="h-5 w-5" />}
        />
        <Card className="mt-6 text-center p-6 border-red-200 shadow-md">
          <CardContent className="py-10">
            <div className="p-3 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">حدث خطأ</h3>
            <p className="mb-6 text-muted-foreground">فشل في تحميل تفاصيل الطلب. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button 
              onClick={() => setLocation("/student/certificate-matching")}
              className="mt-2"
            >
              العودة إلى قائمة الطلبات
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader 
        heading="تفاصيل طلب مطابقة الشهادة" 
        text="عرض تفاصيل طلب مطابقة الشهادة المقدم"
        variant="gradient"
        icon={<Check className="h-5 w-5" />}
        badge={matchingRequest.status}
      />

      <Card className="mt-6 overflow-hidden shadow-md border-border/50">
        <CardHeader className="pb-0 bg-muted/30">
          <div className="flex flex-row-reverse justify-between items-start">
            <Badge 
              variant={statusColors[matchingRequest.status as keyof typeof statusColors] || "secondary"}
              className="ms-0 me-0 flex items-center"
            >
              {statusIcons[matchingRequest.status as keyof typeof statusIcons]}
              {matchingRequest.status}
            </Badge>
            <div>
              <CardTitle className="text-xl text-right">{matchingRequest.courseName}</CardTitle>
              <p className="text-muted-foreground text-right">{matchingRequest.instituteName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
            <div className="bg-muted/10 p-6 rounded-lg border border-border/50">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                معلومات الطلب
              </h3>
              <div className="space-y-3">
                <div className="p-2 rounded-md hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">رقم الطلب:</span>{" "}
                  <span className="font-medium">{matchingRequest.id}</span>
                </div>
                <div className="p-2 rounded-md hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">تاريخ تقديم الطلب:</span>{" "}
                  <span className="font-medium">{format(new Date(matchingRequest.submissionDate), "PPP", { locale: ar })}</span>
                </div>
                <div className="p-2 rounded-md hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">تاريخ الدورة:</span>{" "}
                  <span className="font-medium">{format(new Date(matchingRequest.courseDate), "PPP", { locale: ar })}</span>
                </div>
                {matchingRequest.reviewDate && (
                  <div className="p-2 rounded-md hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">تاريخ المراجعة:</span>{" "}
                    <span className="font-medium">{format(new Date(matchingRequest.reviewDate), "PPP", { locale: ar })}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-muted/10 p-6 rounded-lg border border-border/50">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                {matchingRequest.status === "مطابقة" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-primary" />
                )}
                حالة الطلب ومعلومات إضافية
              </h3>
              <div className="space-y-3">
                <div className="p-2 rounded-md bg-muted/20">
                  <span className="text-muted-foreground">حالة الطلب:</span>{" "}
                  <Badge 
                    variant={statusColors[matchingRequest.status as keyof typeof statusColors] || "secondary"}
                    className="ms-2 me-0"
                  >
                    {matchingRequest.status}
                  </Badge>
                </div>
                
                {matchingRequest.comments && (
                  <div className="mt-4">
                    <span className="text-muted-foreground block mb-2">ملاحظات المراجعة:</span>
                    <p className="p-4 bg-muted/30 rounded-md border border-border/50">{matchingRequest.comments}</p>
                  </div>
                )}
                
                {!matchingRequest.comments && matchingRequest.status !== "مطابقة" && (
                  <div className="p-4 bg-muted/20 rounded-md border border-border/50 mt-4">
                    <p className="text-muted-foreground">
                      لم يتم إضافة ملاحظات للمراجعة بعد.
                    </p>
                  </div>
                )}
                
                {matchingRequest.status === "مطابقة" && !matchingRequest.comments && (
                  <div className="p-4 bg-green-50 rounded-md border border-green-100 mt-4">
                    <p className="text-green-600 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      تمت الموافقة على طلب مطابقة الشهادة.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-right" dir="rtl">
            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              الشهادة المرفقة
            </h3>
            <div className="p-6 border rounded-lg bg-muted/10 border-border/50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-muted-foreground mb-1">ملف الشهادة المرفق</span>
                  <span className="text-sm opacity-70">اضغط على الزر لعرض الشهادة الأصلية</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(`/${matchingRequest.certificateFile}`, '_blank')}
                >
                  <FileText className="h-4 w-4" />
                  عرض الشهادة
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex justify-between bg-muted/20" dir="rtl">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setLocation("/student/certificate-matching")}
          >
            <span>&#8592;</span>
            العودة إلى القائمة
          </Button>
          
          {matchingRequest.status === "مطابقة" && matchingRequest.matchedCertificateId && (
            <Button 
              variant="default"
              className="gap-2 bg-gradient-to-r from-primary to-primary-900 hover:opacity-90"
              onClick={() => {
                const certUrl = `/student/certificates/view/${matchingRequest.matchedCertificateId}`;
                console.log("فتح شهادة مطابقة في:", certUrl);
                window.open(certUrl, '_blank');
              }}
            >
              <Check className="h-4 w-4" />
              عرض شهادة المطابقة
            </Button>
          )}
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
}