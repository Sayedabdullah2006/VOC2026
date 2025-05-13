import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import Header from "@/components/layout/header";

export default function CourseProgressIntroPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const getServicePath = useCallback(() => {
    if (!user) {
      return "/auth";
    }

    if (user.role !== UserRole.STUDENT) {
      return "/";
    }

    return "/dashboard/courses/progress";
  }, [user]);

  const handleServiceClick = useCallback(() => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "الرجاء تسجيل الدخول للوصول إلى هذه الخدمة",
        variant: "destructive",
      });
    } else if (user.role !== UserRole.STUDENT) {
      toast({
        title: "غير مصرح",
        description: "هذه الخدمة متاحة فقط للمتدربين",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return (
    <div className="min-h-screen relative" dir="rtl">
      <Header />
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-blue-green opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=2070')] bg-cover bg-center opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-8">

        <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              متابعة التقدم في البرنامج التدريبي
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              تتبع مسارك التدريبي وإنجازاتك في برنامج تأهيل السائقين المهنيين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-white">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="inline-flex w-8 h-8 bg-[#0C7D99]/20 rounded-full items-center justify-center mr-2 text-sm">١</span>
                مميزات متابعة التقدم
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                  <span>عرض تفصيلي للدورات المسجلة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                  <span>متابعة نسب الإنجاز في كل وحدة تدريبية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                  <span>الاطلاع على نتائج الاختبارات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                  <span>تحميل الشهادات المكتسبة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                  <span>جدول المواعيد والمهام المطلوبة</span>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="inline-flex w-8 h-8 bg-[#0D9C65]/20 rounded-full items-center justify-center mr-2 text-sm">٢</span>
                  الخدمات المتاحة
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>تقارير الأداء والتقدم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>التواصل مع المدربين</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>طلب الدعم والمساعدة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>تحديث بيانات التسجيل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>حجز مواعيد التدريب والاختبارات</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="inline-flex w-8 h-8 bg-[#0C7D99]/20 rounded-full items-center justify-center mr-2 text-sm">٣</span>
                  متطلبات المتابعة
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>حساب مسجل في المنصة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>التسجيل في برنامج تدريبي نشط</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>إتمام عملية التسجيل والدفع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>تحديث المعلومات الشخصية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>الالتزام بالجدول الزمني</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href={getServicePath()}>
                <Button
                  size="lg"
                  className="bg-white text-[#0C7D99] hover:bg-white/90 px-8 py-6 font-semibold shadow-lg"
                  onClick={handleServiceClick}
                >
                  متابعة التقدم
                  <ChevronLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="bg-[#0C7D99] text-white border-white hover:bg-[#0D9C65] px-8 py-6">
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}