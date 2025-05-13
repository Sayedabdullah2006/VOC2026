import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Certificate } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const CertificatesPage = () => {
  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
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
      <div className="space-y-6" dir="rtl">
        <h1 className="text-3xl font-bold">الشهادات</h1>

        <div className="grid gap-6">
          {certificates?.map((cert) => (
            <Card key={cert.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Award className="w-full h-full" />
              </div>

              {/* Certificate Preview */}
              <CardContent className="p-6">
                <div className="border rounded-lg p-8 bg-white relative">
                  {/* Certificate Content */}
                  <div className="text-center space-y-6 max-w-2xl mx-auto">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-primary">
                        شهادة إتمام تدريب
                      </h2>
                      <p className="text-xl">{cert.courseName}</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg">
                        {cert.centerName && `يشهد ${cert.centerName} بأن`}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xl font-bold">{cert.studentName}</p>
                      </div>

                      <p className="text-lg">
                        قد اجتاز بنجاح متطلبات الدورة
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm mt-8">
                      <div>
                        <p className="font-semibold">تاريخ الإصدار</p>
                        <p>
                          {format(new Date(cert.issuedAt), "PPP", {
                            locale: ar,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">رقم الشهادة</p>
                        <p>{cert.certificateNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end mt-4 gap-2">
                  <Link href={`/student/certificates/view/${cert.id}`}>
                    <Button variant="outline" className="gap-2">
                      <Award className="h-4 w-4" />
                      عرض الشهادة
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => {
                      window.open(`/api/certificates/${cert.id}?format=pdf`, '_blank');
                    }}
                  >
                    <Award className="h-4 w-4" />
                    تحميل PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!certificates || certificates.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  لا توجد شهادات متاحة حالياً
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CertificatesPage;