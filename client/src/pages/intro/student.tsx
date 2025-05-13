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

// Removed header import as it's now provided globally in App.tsx

export default function StudentIntroPage() {
  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Header space for global header */}
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-blue-green opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2128')] bg-cover bg-center opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-8">

        <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              برنامج تأهيل السائقين المهنيين
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              خطوتك الأولى نحو مستقبل مهني في قطاع النقل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-white">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <div className="w-8 h-8 bg-[#0C7D99]/20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-sm">١</span>
                </div>
                نبذة عن البرنامج
              </h3>
              <p className="leading-relaxed">
                برنامج تأهيل السائقين المهنيين هو برنامج شامل يهدف إلى رفع كفاءة العاملين
                في قطاع النقل وتأهيلهم للحصول على رخصة القيادة المهنية. يشمل البرنامج
                تدريباً نظرياً وعملياً على أيدي مدربين معتمدين.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-[#0D9C65]/20 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm">٢</span>
                  </div>
                  مزايا البرنامج
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center">✓</span>
                    <span>شهادة معتمدة من الهيئة العامة للنقل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center">✓</span>
                    <span>تدريب عملي على أحدث المعدات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center">✓</span>
                    <span>مناهج تدريبية متطورة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center">✓</span>
                    <span>فرص عمل في قطاع النقل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0D9C65]/20 rounded-full items-center justify-center">✓</span>
                    <span>متابعة مستمرة وتقييم دوري</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <div className="w-8 h-8 bg-[#0C7D99]/20 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm">٣</span>
                  </div>
                  متطلبات التسجيل
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center">•</span>
                    <span>الهوية الوطنية أو الإقامة سارية المفعول</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center">•</span>
                    <span>رخصة قيادة سارية المفعول</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center">•</span>
                    <span>اجتياز الفحص الطبي</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center">•</span>
                    <span>إتمام 20 عام من العمر</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="inline-flex w-5 h-5 bg-[#0C7D99]/20 rounded-full items-center justify-center">•</span>
                    <span>إجادة القراءة والكتابة</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-[#0C7D99] hover:bg-white/90 px-8 py-6 font-semibold shadow-lg">
                  تسجيل كمتدرب
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