import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Building2,
  Briefcase,
  GraduationCap,
  Shield,
  BadgeCheck,
  ArrowRight,
  ScrollText
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TrainingCenterIntro() {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 gradient-blue-green opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000')] bg-cover bg-center opacity-10"></div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full shadow-lg">
                  <Building2 className="h-14 w-14 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">خدمة اعتماد مراكز التدريب</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                خدمة تتيح لمراكز التدريب تقديم طلب اعتماد لدى الهيئة العامة للنقل لممارسة نشاط التدريب للسائقين ومدراء التشغيل
              </p>
              <div className="flex justify-center">
                <Link href="/centers/register">
                  <Button size="lg" className="gap-2 bg-white text-[#0C7D99] hover:bg-white/90 shadow-lg px-8 py-6 text-lg">
                    <span>تقديم طلب الاعتماد</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 gap-8 mb-12"
            >
              {/* المميزات */}
              <motion.div variants={item}>
                <Card className="h-full shadow-md border-0 overflow-hidden">
                  <div className="h-2 gradient-blue-green w-full"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-[#0C7D99]/10 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-[#0C7D99]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#05668D]">مميزات الاعتماد</h3>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <BadgeCheck className="h-5 w-5 text-[#0C7D99] mt-1" />
                        <span>اعتماد رسمي من الهيئة العامة للنقل</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-[#0C7D99] mt-1" />
                        <span>ضمان جودة التدريب والخدمات المقدمة</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-[#0C7D99] mt-1" />
                        <span>فرص عمل وشراكات استراتيجية</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* متطلبات الاعتماد */}
              <motion.div variants={item}>
                <Card className="h-full shadow-md border-0 overflow-hidden">
                  <div className="h-2 gradient-green-blue w-full"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-[#0D9C65]/10 rounded-lg">
                        <ScrollText className="h-6 w-6 text-[#0D9C65]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#05668D]">متطلبات الاعتماد</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="h-5 w-5 text-[#0D9C65] mt-1 shrink-0" />
                        <p>سجل تجاري يتضمن نشاط تدريب</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="h-5 w-5 text-[#0D9C65] mt-1 shrink-0" />
                        <p>ضمان مالي باسم الهيئة بمبلغ وقدره (100,000) مائة ألف ريال سعودي</p>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="h-5 w-5 text-[#0D9C65] mt-1 shrink-0" />
                        <p>توفير مركز مناسب وفق شروط وإجراءات تأهيل واعتماد مراكز التدريب</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
            >
              <Card className="mb-12 border-0 shadow-md overflow-hidden">
                <div className="h-2 gradient-blue-green w-full"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[#0C7D99]/10 rounded-lg">
                      <FileText className="h-6 w-6 text-[#0C7D99]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#05668D]">المستندات المطلوبة</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        <FileText className="h-5 w-5 text-[#0C7D99]" />
                        <span>صورة السجل التجاري</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        <FileText className="h-5 w-5 text-[#0C7D99]" />
                        <span>خطاب الضمان المالي</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        <FileText className="h-5 w-5 text-[#0C7D99]" />
                        <span>ترخيص مزاولة نشاط التدريب</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                        <FileText className="h-5 w-5 text-[#0C7D99]" />
                        <span>وثائق إثبات الهوية</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}