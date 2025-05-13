import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { motion } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GraduationCap, FileCheck, Building, Book, User, Clock, Shield, LayoutGrid } from "lucide-react";

const requirementSections = [
  {
    id: "admin",
    title: "المتطلبات الإدارية",
    icon: <Building className="h-5 w-5 text-primary" />,
    requirements: [
      "رؤية ورسالة وأهداف واضحة.",
      "خطة استراتيجية وتشغيلية.",
      "هيكل تنظيمي."
    ]
  },
  {
    id: "approval",
    title: "متطلبات الاعتماد",
    icon: <Shield className="h-5 w-5 text-primary" />,
    requirements: [
      "طلب مقدم من المنشأة عبر قنوات الهيئة المعتمدة.",
      "سجل تجاري للمنشأة يتضمن نشاط (التدريب) ساري المفعول.",
      "ترخيص لمزاولة نشاط التدريب من المؤسسة العامة للتدريب التقني والمهني ساري المفعول.",
      "ضمان مالي باسم الهيئة بمبلغ وقدره (100.000) مائة ألف ريال سعودي.",
      "توفير مركز مناسب في المدينة محل الاعتماد وفقاً للاشتراطات البلدية والفنية المعتمدة، والاشتراطات الصادرة عن الجهات ذات العلاقة.",
      "الارتباط بالأنظمة الإلكترونية التي تحددها الهيئة.",
      "توفير فرع في كل منطقة من مناطق المملكة."
    ]
  },
  {
    id: "exam",
    title: "متطلبات الاختبار",
    icon: <FileCheck className="h-5 w-5 text-primary" />,
    requirements: [
      "تقديم الاختبارات بكفاءة وجودة عالية.",
      "توفير الاختبارات بعدة لغات وبحد أدنى اللغة (العربية، والإنجليزية، والأردو).",
      "توفير المعدات والتجهيزات اللازمة لإجراء الاختبارات العملية والتطبيقية.",
      "إجراء الاختبارات حضورياً، وأن تكون إلكترونية (محوسبة).",
      "تزويد الهيئة بنتائج اختبارات المتقدمين فور صدورها عبر الربط الإلكتروني مع أنظمة الهيئة.",
      "إصدار شهادة الكفاءة المهنية عند اجتياز المتقدم للاختبار بنسبة (60%) وربطها مع أنظمة الهيئة.",
      "تحديد جدول مواعيد الاختبارات، وآلية التقديم عليها.",
      "تحديد آلية مراقبة وإدارة سير الاختبارات (المسافة الفاصلة بين المتقدمين، منع الأجهزة المحمولة، عدم السماح بتصوير الاختبارات، إلخ).",
      "تحديد آلية تقديم الإرشاد والتوجيه للمتقدمين أثناء الاختبارات.",
      "تحديد آلية لحفظ نتائج الاختبارات، وتزويد المتقدمين بالنتائج.",
      "قياس رضا المتقدمين عن تجهيزات مركز الاختبار وخدماته."
    ]
  },
  {
    id: "tech",
    title: "المتطلبات التقنية",
    icon: <LayoutGrid className="h-5 w-5 text-primary" />,
    requirements: [
      "توفير نظام آلي لإدارة الاختبارات.",
      "تجهيز قاعة الاختبار بأجهزة حاسب آلي تتناسب مع عدد المتقدمين.",
      "توفير كاميرات مراقبة داخل قاعة الاختبار، وتخزين البيانات لمدة لا تقل عن (180) مائة وثمانين يوماً؛ للرجوع لها عند الحاجة.",
      "توفير شبكة مزودة بالإنترنت بسرعة تحميل كافية تتناسب مع حجم مركز الاختبار.",
      "توفير موقع إلكتروني خاص بمركز الاختبارات."
    ]
  },
  {
    id: "infrastructure",
    title: "متطلبات البنية التحتية",
    icon: <Building className="h-5 w-5 text-primary" />,
    requirements: [
      "توفير قاعة أو أكثر بمساحة كافية لاستيعاب المتقدمين لإجراء الاختبارات.",
      "توفير المساحات اللازمة لإجراء الاختبارات العملية والتطبيقية وذلك وفق متطلبات كل برنامج تدريبي.",
      "توفير الوسائل الإرشادية والتوضيحية المناسبة في قاعة الاختبار ومرافق مركز الاختبار.",
      "توفير عدد مرافق صحية يتناسب مع الطاقة الاستيعابية القصوى لعدد المتقدمين في مركز الاختبار.",
      "توفير منطقة استقبال واستراحة للمتدربين.",
      "تجهيز قاعة الاختبار بالعزل الصوتي، وأجهزة التبريد، والتدفئة، والإضاءة."
    ]
  },
  {
    id: "candidateRequirements",
    title: "معايير قبول المتقدم لدخول الاختبار",
    icon: <User className="h-5 w-5 text-primary" />,
    requirements: [
      "أن يحمل إثبات هوية ساري المفعول.",
      "إتمام الدورة التدريبية في أحد مراكز التدريب، أو الحصول على شهادة المطابقة الصادرة من الهيئة للدورات التدريبية."
    ]
  },
  {
    id: "certificateValidity",
    title: "صلاحية شهادة الكفاءة المهنية",
    icon: <Clock className="h-5 w-5 text-primary" />,
    requirements: [
      "صلاحية شهادة الكفاءة المهنية 5 سنوات من تاريخ صدورها، ويجب قبل انتهاء صلاحية الشهادة بـ(60) يوماً، أخذ دورة تنشيطية لدى مراكز التدريب من قبل السائقين لتجديد الشهادة لـ5 سنوات إضافية، وفي حال انتهاء صلاحية الشهادة دون أخذ الدورة التنشيطية، فلا يتم تجديد بطاقة سائق مهني."
    ]
  }
];

const QualificationRequirementsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header space for global header */}
      
      {/* Page Header */}
      <div className="pt-24 pb-32 bg-gradient-to-l from-[#0C7D99] to-[#0D9C65] relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-10 bg-pattern-dots"></div>
        <div className="absolute bottom-0 right-0 w-full h-20 bg-white/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <GraduationCap className="h-10 w-10" />
              متطلبات التأهيل
            </h1>
            <p className="text-white/80 text-lg mb-8">
              تعرف على متطلبات مراكز الاختبار والمعايير اللازمة للتأهيل للحصول على شهادة الكفاءة المهنية
            </p>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 96L48 90.7C96 85 192 75 288 69.3C384 64 480 64 576 74.7C672 85 768 107 864 101.3C960 96 1056 64 1152 48C1248 32 1344 32 1392 32H1440V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V96Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-20 pb-16">
        <AnimatedGradientBorder
          gradient="modern"
          intensity="low"
          className="rounded-2xl overflow-hidden shadow-xl mb-12"
        >
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-1 bg-gradient-to-b from-[#0C7D99] to-[#0D9C65] rounded-full"></div>
                <h2 className="text-2xl font-bold text-right">متطلبات مركز الاختبار</h2>
              </div>

              {/* Main content with tabs */}
              <Tabs defaultValue="admin" className="w-full" dir="rtl">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 bg-muted/40">
                  <TabsTrigger value="admin">إدارية</TabsTrigger>
                  <TabsTrigger value="tech">تقنية</TabsTrigger>
                  <TabsTrigger value="requirements">بنية تحتية</TabsTrigger>
                  <TabsTrigger value="certificates">الشهادات</TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="mt-4">
                  <div className="space-y-8">
                    {requirementSections.slice(0, 3).map((section) => (
                      <motion.div 
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {section.icon}
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                        </div>
                        <ul className="space-y-3 text-right">
                          {section.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                {idx + 1}
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tech" className="mt-4">
                  <div className="space-y-8">
                    {requirementSections.slice(3, 5).map((section) => (
                      <motion.div 
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {section.icon}
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                        </div>
                        <ul className="space-y-3 text-right">
                          {section.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                {idx + 1}
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="mt-4">
                  <div className="space-y-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {requirementSections[4].icon}
                        <h3 className="text-xl font-semibold">{requirementSections[4].title}</h3>
                      </div>
                      <ul className="space-y-3 text-right">
                        {requirementSections[4].requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                              {idx + 1}
                            </span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="certificates" className="mt-4">
                  <div className="space-y-8">
                    {requirementSections.slice(5, 7).map((section) => (
                      <motion.div 
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {section.icon}
                          <h3 className="text-xl font-semibold">{section.title}</h3>
                        </div>
                        <ul className="space-y-3 text-right">
                          {section.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                                {idx + 1}
                              </span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </AnimatedGradientBorder>

        {/* FAQs Section */}
        <AnimatedGradientBorder
          gradient="modern"
          intensity="low"
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-1 bg-gradient-to-b from-[#0C7D99] to-[#0D9C65] rounded-full"></div>
                <h2 className="text-2xl font-bold text-right">الأسئلة الشائعة</h2>
              </div>

              <Accordion type="single" collapsible className="w-full" dir="rtl">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-right">ما هي شهادة الكفاءة المهنية؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    شهادة الكفاءة المهنية هي وثيقة تصدر بعد اجتياز المتقدم للاختبار بنسبة لا تقل عن 60%، وتثبت أن حاملها يتمتع بالمهارات والمعارف اللازمة لممارسة مهنة القيادة المهنية بكفاءة وأمان.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-right">ما هي مدة صلاحية شهادة الكفاءة المهنية؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    صلاحية شهادة الكفاءة المهنية 5 سنوات من تاريخ صدورها، ويجب قبل انتهاء صلاحيتها بـ 60 يوماً أخذ دورة تنشيطية لدى مراكز التدريب من قبل السائقين لتجديد الشهادة لـ5 سنوات إضافية.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-right">ما هي الدورة التنشيطية وماذا تتضمن؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    الدورة التنشيطية هي دورة مختصرة تهدف إلى تجديد وتحديث معلومات السائق المهني حول أنظمة القيادة وأفضل الممارسات في مجال السلامة والقيادة المهنية. تستغرق الدورة وقتًا أقل من الدورة الأصلية وتركز على المستجدات في مجال النقل والقيادة المهنية.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-right">هل يمكن الحصول على الشهادة دون حضور دورة تدريبية؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    لا، تشترط الهيئة إتمام الدورة التدريبية في أحد مراكز التدريب المعتمدة، أو الحصول على شهادة المطابقة الصادرة من الهيئة للدورات التدريبية السابقة.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-right">ما هي اللغات المتاحة للاختبار؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    توفر مراكز الاختبار الاختبارات بعدة لغات وبحد أدنى اللغة العربية، والإنجليزية، والأردو.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </AnimatedGradientBorder>
      </div>

      {/* Footer is now managed globally */}
    </div>
  );
};

export default QualificationRequirementsPage;