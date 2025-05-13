import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Certificate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function CertificateViewPage() {
  const { id } = useParams();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [logoError, setLogoError] = useState(false);

  const { data: certificate, isLoading } = useQuery<Certificate>({
    queryKey: [`/api/certificates/${id}`],
  });

  useEffect(() => {
    if (certificate?.id) {
      // Generate QR code with the current certificate URL for verification
      const verificationUrl = `${window.location.origin}/student/certificates/view/${certificate.id}`;
      QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("Error generating QR code:", err));
    }
  }, [certificate?.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mb-2">جاري التحميل...</p>
            <p>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!certificate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="mb-2">الشهادة غير موجودة</p>
            <p>Certificate not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Actions Bar */}
          <div className="mb-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                window.open(`/student/certificates/view/${id}`, '_blank');
              }}
            >
              <Download className="h-4 w-4" />
              <span className="ml-2">عرض الشهادة</span>
              <span className="mr-2">View Certificate</span>
            </Button>
          </div>

          {/* Certificate Preview */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden relative">
            {/* TGA Logo for all certificates */}
            {!logoError && (
              <div className="flex justify-center pt-8 pb-4">
                <img
                  src="https://salogos.org/wp-content/uploads/2023/02/%D8%A7%D9%84%D9%87%D9%8A%D8%A6%D8%A9-%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9-%D9%84%D9%84%D9%86%D9%82%D9%84-%D8%AC%D8%AF%D9%8A%D8%AF.png"
                  alt="شعار هيئة النقل العامة - TGA Logo"
                  className="h-24 object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}

            {/* Certificate Content */}
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                {certificate.type === 'training_center' && (
                  <>
                    <h1 className="text-3xl font-bold text-primary">شهادة تسجيل مركز تدريب</h1>
                    <h2 className="text-2xl font-semibold">Training Center Registration Certificate</h2>
                  </>
                )}
                {certificate.type === 'testing_center' && (
                  <>
                    <h1 className="text-3xl font-bold text-primary">شهادة تسجيل مركز اختبار</h1>
                    <h2 className="text-2xl font-semibold">Testing Center Registration Certificate</h2>
                  </>
                )}
                {certificate.type === 'course' && (
                  <>
                    {certificate.courseName && certificate.courseName.startsWith('مطابقة:') ? (
                      <>
                        <h1 className="text-3xl font-bold text-primary">شهادة مطابقة تدريب</h1>
                        <h2 className="text-2xl font-semibold">Training Certificate Recognition</h2>
                      </>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-primary">شهادة إتمام تدريب</h1>
                        <h2 className="text-2xl font-semibold">Course Completion Certificate</h2>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Main Content */}
              <div className="space-y-8 relative z-10">
                {/* Certificate Text */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Arabic Content */}
                  <div className="text-right space-y-6" dir="rtl">
                    {certificate.type === 'course' ? (
                      <>
                        {certificate.courseName && certificate.courseName.startsWith('مطابقة:') ? (
                          <>
                            <p className="text-xl">تشهد الهيئة العامة للنقل بمطابقة شهادة التدريب للمتدرب</p>
                            <p className="text-2xl font-bold text-primary">{certificate.studentName}</p>
                            <p className="text-xl">في</p>
                            <p className="text-xl font-semibold">{certificate.courseName.replace('مطابقة: ', '')}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xl">{certificate.centerName} يشهد أن المتدرب</p>
                            <p className="text-2xl font-bold text-primary">{certificate.studentName}</p>
                            <p className="text-xl">قد أتم بنجاح متطلبات</p>
                            <p className="text-xl font-semibold">{certificate.courseName}</p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xl">تشهد الهيئة العامة للنقل أن مركز</p>
                        <p className="text-2xl font-bold text-primary">{certificate.centerName}</p>
                        <p className="text-xl">تحت إدارة</p>
                        <p className="text-xl font-semibold">{certificate.managerName}</p>
                        <p className="text-xl">قد استوفى جميع المتطلبات والمعايير المطلوبة</p>
                      </>
                    )}
                  </div>

                  {/* English Content */}
                  <div className="text-left space-y-6">
                    {certificate.type === 'course' ? (
                      <>
                        {certificate.courseName && certificate.courseName.startsWith('مطابقة:') ? (
                          <>
                            <p className="text-xl">The Transport General Authority certifies that</p>
                            <p className="text-2xl font-bold text-primary">{certificate.studentName}</p>
                            <p className="text-xl">has a recognized training certificate for</p>
                            <p className="text-xl font-semibold">{certificate.courseName.replace('مطابقة: ', '')}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xl">{certificate.centerName} certifies that</p>
                            <p className="text-2xl font-bold text-primary">{certificate.studentName}</p>
                            <p className="text-xl">has successfully completed</p>
                            <p className="text-xl font-semibold">{certificate.courseName}</p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xl">The Transport General Authority certifies that</p>
                        <p className="text-2xl font-bold text-primary">{certificate.centerName}</p>
                        <p className="text-xl">under the management of</p>
                        <p className="text-xl font-semibold">{certificate.managerName}</p>
                        <p className="text-xl">has met all required standards and requirements</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Dates and Certificate Number */}
                <div className="grid grid-cols-2 gap-8 mt-8">
                  {/* Arabic Dates */}
                  <div className="text-right space-y-2" dir="rtl">
                    <p className="font-semibold">تاريخ الإصدار</p>
                    <p>{format(new Date(certificate.issuedAt), 'PPP', { locale: ar })}</p>
                    {certificate.type !== 'course' && certificate.expiresAt && (
                      <>
                        <p className="font-semibold mt-4">تاريخ الانتهاء</p>
                        <p>{format(new Date(certificate.expiresAt), 'PPP', { locale: ar })}</p>
                      </>
                    )}
                    <p className="font-semibold mt-4">رقم الشهادة</p>
                    <p className="font-mono">{certificate.certificateNumber}</p>
                  </div>

                  {/* English Dates */}
                  <div className="text-left space-y-2">
                    <p className="font-semibold">Issue Date</p>
                    <p>{format(new Date(certificate.issuedAt), 'PPP', { locale: enUS })}</p>
                    {certificate.type !== 'course' && certificate.expiresAt && (
                      <>
                        <p className="font-semibold mt-4">Expiry Date</p>
                        <p>{format(new Date(certificate.expiresAt), 'PPP', { locale: enUS })}</p>
                      </>
                    )}
                    <p className="font-semibold mt-4">Certificate Number</p>
                    <p className="font-mono">{certificate.certificateNumber}</p>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="flex justify-center mt-8">
                    <div className="text-center">
                      <img src={qrCodeUrl} alt="Verification QR Code - رمز التحقق" className="w-32 h-32 mx-auto" />
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="block">رمز التحقق من صحة الشهادة</span>
                        <span className="block">Certificate Verification QR Code</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}