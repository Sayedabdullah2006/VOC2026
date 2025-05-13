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
import { School, FileCheck, Building, Book, User, Clock, Shield, Laptop, Layout } from "lucide-react";

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
      "الارتباط بالأنظمة الإلكترونية التي تحددها الهيئة."
    ]
  },
  {
    id: "training",
    title: "متطلبات التدريب",
    icon: <Book className="h-5 w-5 text-primary" />,
    requirements: [
      "تقديم البرامج التدريبية بكفاءة وجودة عالية.",
      "توفير مدربين ذوي مؤهلات علمية أو خبرة عملية مناسبة لتقديم البرامج التدريبية.",
      "توفير الحقائب التدريبية المعتمدة من الهيئة والمدة الزمنية لكل برنامج تدريبي.",
      "توفير التدريب بعدة لغات وبحد أدنى اللغة (العربية، والإنجليزية، والأردو).",
      "توفير المعدات والتجهيزات اللازمة للتدريب العملي بما يتوافق مع نوع البرنامج التدريبي.",
      "عدم منح شهادة إتمام الدورة التدريبية للمتدرب في حال تجاوز غيابه -من إجمالي ساعات التدريب- بدون عذر نظامي (10%)، أو بعذر (20%).",
      "ألا يزيد عدد المتدربين في القاعة الدراسية الواحدة على (25) خمسة وعشرين متدرباً بحد أقصى.",
      "وضع الخطط السنوية لتنظيم وتنفيذ البرامج التدريبية.",
      "وضع آلية للتسجيل ومتابعة التزام وحضور المتدربين.",
      "توفير خيار تنفيذ عمليات التدريب عن بُعد (عند الحاجة) بعد موافقة الهيئة، على أن يتم تشغيل الكاميرات طوال فترة التدريب، ومتابعة تفاعل وحضور المتدربين.",
      "تقييم أداء المدربين والمتدربين وفق أساليب التقييم المعتمدة.",
      "قياس رضا المتدربين عن الدورات التدريبية، وأداء المدربين، ومركز التدريب، ومرافقه."
    ]
  },
  {
    id: "tech",
    title: "المتطلبات التقنية",
    icon: <Laptop className="h-5 w-5 text-primary" />,
    requirements: [
      "تجهيز القاعة الدراسية بسبورة واحدة -على الأقل- يتناسب حجمها مع حجم وسعة القاعة.",
      "تجهيز القاعة الدراسية بجهاز وشاشة عرض تتناسب مع حجم وسعة القاعة.",
      "توفير كاميرات مراقبة داخل القاعة الدراسية ومواقع التدريب العملي، وتخزين البيانات لمدة لا تقل عن (180) مائة وثمانين يوماً؛ للرجوع لها عند الحاجة.",
      "توفير أجهزة حاسب آلي -عند الحاجة- تتناسب مع متطلبات البرنامج التدريبي وعدد المتدربين في القاعات الدراسية.",
      "توفير شبكة مزودة بالإنترنت بسرعة تحميل تتناسب مع احتياج مركز التدريب والمتدربين.",
      "توفير موقع إلكتروني خاص بمركز التدريب."
    ]
  },
  {
    id: "infrastructure",
    title: "متطلبات البنية التحتية",
    icon: <Layout className="h-5 w-5 text-primary" />,
    requirements: [
      "ألا يقل عدد القاعات الدراسية في مركز التدريب عن (3) ثلاث قاعات، على أن تتناسب سعة القاعة الواحدة مع عدد متدربين لا يقل عددهم عن (25) خمسة وعشرين متدرباً.",
      "توفير المساحات اللازمة للتدريب العملي، وذلك وفق متطلبات كل برنامج تدريبي.",
      "توفير الوسائل الإرشادية والتوضيحية المناسبة في القاعات الدراسية ومرافق مركز التدريب.",
      "توفير منطقة استقبال واستراحة للمتدربين.",
      "توفير عدد مرافق صحية يتناسب مع الطاقة الاستيعابية القصوى لعدد المتدربين في مركز التدريب.",
      "تجهيز القاعة الدراسية بالعزل الصوتي، وأجهزة التبريد، والتدفئة، والإضاءة."
    ]
  }
];

const TrainingCenterRequirementsPage = () => {
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
              <School className="h-10 w-10" />
              متطلبات مراكز التدريب
            </h1>
            <p className="text-white/80 text-lg mb-8">
              تعرف على متطلبات مراكز التدريب والمعايير اللازمة للاعتماد والتشغيل
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
                <h2 className="text-2xl font-bold text-right">متطلبات مركز التدريب</h2>
              </div>

              {/* Main content with tabs */}
              <Tabs defaultValue="admin" className="w-full" dir="rtl">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 bg-muted/40">
                  <TabsTrigger value="admin">إدارية</TabsTrigger>
                  <TabsTrigger value="training">تدريبية</TabsTrigger>
                  <TabsTrigger value="tech">تقنية</TabsTrigger>
                  <TabsTrigger value="infrastructure">بنية تحتية</TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="mt-4">
                  <div className="space-y-8">
                    {requirementSections.slice(0, 2).map((section) => (
                      <motion.div 
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {section.icon}
                          <h3 className="text-xl font-semibold text-right">{section.title}</h3>
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

                <TabsContent value="training" className="mt-4">
                  <div className="space-y-8">
                    <motion.div 
                      key={requirementSections[2].id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {requirementSections[2].icon}
                        <h3 className="text-xl font-semibold text-right">{requirementSections[2].title}</h3>
                      </div>
                      <ul className="space-y-3 text-right">
                        {requirementSections[2].requirements.map((req, idx) => (
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

                <TabsContent value="tech" className="mt-4">
                  <div className="space-y-8">
                    <motion.div 
                      key={requirementSections[3].id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {requirementSections[3].icon}
                        <h3 className="text-xl font-semibold text-right">{requirementSections[3].title}</h3>
                      </div>
                      <ul className="space-y-3 text-right">
                        {requirementSections[3].requirements.map((req, idx) => (
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

                <TabsContent value="infrastructure" className="mt-4">
                  <div className="space-y-8">
                    <motion.div 
                      key={requirementSections[4].id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-muted/20 p-6 rounded-xl shadow-sm border border-border/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {requirementSections[4].icon}
                        <h3 className="text-xl font-semibold text-right">{requirementSections[4].title}</h3>
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
                  <AccordionTrigger className="text-right">ما هي متطلبات اعتماد مركز التدريب؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    تشمل متطلبات اعتماد مركز التدريب تقديم طلب عبر قنوات الهيئة المعتمدة، وتوفير سجل تجاري ساري المفعول يتضمن نشاط التدريب، وترخيص لمزاولة نشاط التدريب من المؤسسة العامة للتدريب التقني والمهني، بالإضافة إلى ضمان مالي وتوفير مركز مناسب.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-right">كم عدد القاعات المطلوبة في مركز التدريب؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    يجب ألا يقل عدد القاعات الدراسية في مركز التدريب عن 3 قاعات، على أن تتناسب سعة القاعة الواحدة مع عدد متدربين لا يقل عددهم عن 25 متدرباً.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-right">ما هو الحد الأقصى لعدد المتدربين في القاعة الواحدة؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    يجب ألا يزيد عدد المتدربين في القاعة الدراسية الواحدة على 25 متدرباً بحد أقصى.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-right">ما هي اللغات المطلوبة في برامج التدريب؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    يجب توفير التدريب بعدة لغات وبحد أدنى اللغة العربية، والإنجليزية، والأردو.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-right">ما هي نسبة الغياب المسموح بها للمتدرب؟</AccordionTrigger>
                  <AccordionContent className="text-right">
                    لا تُمنح شهادة إتمام الدورة التدريبية للمتدرب في حال تجاوز غيابه من إجمالي ساعات التدريب بدون عذر نظامي (10%)، أو بعذر (20%).
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

export default TrainingCenterRequirementsPage;