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
// Removed header import as it's now provided globally in App.tsx

export default function TrainingCentersSearchIntroPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Header space for global header */}
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-blue-green opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=2070')] bg-cover bg-center opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-8">

        <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              مراكز التدريب المعتمدة
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              استعراض وتصفح مراكز التدريب المعتمدة في المملكة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-white">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="inline-flex w-8 h-8 bg-[#0C7D99]/20 rounded-full items-center justify-center mr-2 text-sm">١</span>
                خدمات المراكز المتاحة
              </h3>
              <p className="leading-relaxed">
                مراكز التدريب المعتمدة تقدم خدمات متعددة للعثور على المركز
                المناسب لاحتياجاتك التدريبية.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="inline-flex w-8 h-8 bg-[#0D9C65]/20 rounded-full items-center justify-center mr-2 text-sm">٢</span>
                  مميزات المراكز
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                    <span>البحث حسب المنطقة والمدينة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                    <span>تصفية النتائج حسب البرامج التدريبية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                    <span>الاطلاع على تقييمات المتدربين</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                    <span>معلومات تفصيلية عن كل مركز</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center mt-0.5">✓</span>
                    <span>مقارنة بين المراكز المختلفة</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="inline-flex w-8 h-8 bg-[#0C7D99]/20 rounded-full items-center justify-center mr-2 text-sm">٣</span>
                  معلومات المراكز المتوفرة
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>موقع المركز وتفاصيل الاتصال</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>البرامج التدريبية المقدمة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>مواعيد العمل والتدريب</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>الشهادات والاعتمادات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center mt-0.5">•</span>
                    <span>صور ومعلومات عن المرافق</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href="/public/training-centers">
                <Button
                  size="lg"
                  className="bg-white text-[#0C7D99] hover:bg-white/90 px-8 py-6 font-semibold shadow-lg"
                >
                  استعراض المراكز
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