import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Book, School, FileCheck, Award, User, Clock, Building, Laptop } from "lucide-react";

// تجميع الأسئلة الشائعة من الصفحات المختلفة
const faqCategories = [
  {
    id: "certificate",
    title: "شهادة الكفاءة المهنية",
    icon: <Award className="h-5 w-5 text-primary" />,
    questions: [
      {
        question: "ما هي شهادة الكفاءة المهنية؟",
        answer: "شهادة الكفاءة المهنية هي وثيقة تصدر بعد اجتياز المتقدم للاختبار بنسبة لا تقل عن 60%، وتثبت أن حاملها يتمتع بالمهارات والمعارف اللازمة لممارسة مهنة القيادة المهنية بكفاءة وأمان."
      },
      {
        question: "ما هي مدة صلاحية شهادة الكفاءة المهنية؟",
        answer: "صلاحية شهادة الكفاءة المهنية 5 سنوات من تاريخ صدورها، ويجب قبل انتهاء صلاحيتها بـ 60 يوماً أخذ دورة تنشيطية لدى مراكز التدريب من قبل السائقين لتجديد الشهادة لـ5 سنوات إضافية."
      },
      {
        question: "ما هي الدورة التنشيطية وماذا تتضمن؟",
        answer: "الدورة التنشيطية هي دورة مختصرة تهدف إلى تجديد وتحديث معلومات السائق المهني حول أنظمة القيادة وأفضل الممارسات في مجال السلامة والقيادة المهنية. تستغرق الدورة وقتًا أقل من الدورة الأصلية وتركز على المستجدات في مجال النقل والقيادة المهنية."
      },
      {
        question: "هل يمكن الحصول على الشهادة دون حضور دورة تدريبية؟",
        answer: "لا، تشترط الهيئة إتمام الدورة التدريبية في أحد مراكز التدريب المعتمدة، أو الحصول على شهادة المطابقة الصادرة من الهيئة للدورات التدريبية السابقة."
      },
      {
        question: "ما هي اللغات المتاحة للاختبار؟",
        answer: "توفر مراكز الاختبار الاختبارات بعدة لغات وبحد أدنى اللغة العربية، والإنجليزية، والأردو."
      }
    ]
  },
  {
    id: "trainingCenters",
    title: "مراكز التدريب",
    icon: <School className="h-5 w-5 text-primary" />,
    questions: [
      {
        question: "ما هي متطلبات اعتماد مركز التدريب؟",
        answer: "تشمل متطلبات اعتماد مركز التدريب تقديم طلب عبر قنوات الهيئة المعتمدة، وتوفير سجل تجاري ساري المفعول يتضمن نشاط التدريب، وترخيص لمزاولة نشاط التدريب من المؤسسة العامة للتدريب التقني والمهني، بالإضافة إلى ضمان مالي وتوفير مركز مناسب."
      },
      {
        question: "كم عدد القاعات المطلوبة في مركز التدريب؟",
        answer: "يجب ألا يقل عدد القاعات الدراسية في مركز التدريب عن 3 قاعات، على أن تتناسب سعة القاعة الواحدة مع عدد متدربين لا يقل عددهم عن 25 متدرباً."
      },
      {
        question: "ما هو الحد الأقصى لعدد المتدربين في القاعة الواحدة؟",
        answer: "يجب ألا يزيد عدد المتدربين في القاعة الدراسية الواحدة على 25 متدرباً بحد أقصى."
      },
      {
        question: "ما هي اللغات المطلوبة في برامج التدريب؟",
        answer: "يجب توفير التدريب بعدة لغات وبحد أدنى اللغة العربية، والإنجليزية، والأردو."
      },
      {
        question: "ما هي نسبة الغياب المسموح بها للمتدرب؟",
        answer: "لا تُمنح شهادة إتمام الدورة التدريبية للمتدرب في حال تجاوز غيابه من إجمالي ساعات التدريب بدون عذر نظامي (10%)، أو بعذر (20%)."
      }
    ]
  },
  {
    id: "examCenters",
    title: "مراكز الاختبار",
    icon: <FileCheck className="h-5 w-5 text-primary" />,
    questions: [
      {
        question: "ما هي متطلبات الاعتماد لمراكز الاختبار؟",
        answer: "تشمل متطلبات الاعتماد لمراكز الاختبار توفير طلب مقدم من المنشأة عبر قنوات الهيئة المعتمدة، وسجل تجاري ساري المفعول، وترخيص لمزاولة النشاط، وضمان مالي باسم الهيئة بمبلغ وقدره 100,000 ريال سعودي، وتوفير مركز مناسب وفقاً للاشتراطات، والارتباط بالأنظمة الإلكترونية التي تحددها الهيئة."
      },
      {
        question: "كيف يتم إجراء الاختبارات في مراكز الاختبار؟",
        answer: "يجب إجراء الاختبارات حضورياً، وأن تكون إلكترونية (محوسبة). يجب توفير الاختبارات بعدة لغات وبحد أدنى اللغة العربية والإنجليزية والأردو، مع تزويد الهيئة بنتائج اختبارات المتقدمين فور صدورها عبر الربط الإلكتروني مع أنظمة الهيئة."
      },
      {
        question: "ما هي نسبة النجاح المطلوبة في الاختبار؟",
        answer: "يتم إصدار شهادة الكفاءة المهنية عند اجتياز المتقدم للاختبار بنسبة 60% وربطها مع أنظمة الهيئة."
      },
      {
        question: "ما هي المتطلبات التقنية لمراكز الاختبار؟",
        answer: "تشمل المتطلبات التقنية توفير نظام آلي لإدارة الاختبارات، وتجهيز قاعة الاختبار بأجهزة حاسب آلي، وتوفير كاميرات مراقبة داخل قاعة الاختبار وتخزين البيانات لمدة لا تقل عن 180 يوماً، وتوفير شبكة مزودة بالإنترنت بسرعة تحميل كافية، وتوفير موقع إلكتروني خاص بمركز الاختبارات."
      }
    ]
  },
  {
    id: "qualificationRequirements",
    title: "متطلبات التأهيل",
    icon: <User className="h-5 w-5 text-primary" />,
    questions: [
      {
        question: "ما هي معايير قبول المتقدم لدخول الاختبار؟",
        answer: "يجب أن يحمل المتقدم إثبات هوية ساري المفعول، وإتمام الدورة التدريبية في أحد مراكز التدريب، أو الحصول على شهادة المطابقة الصادرة من الهيئة للدورات التدريبية."
      },
      {
        question: "ماذا يحدث في حال انتهاء صلاحية الشهادة دون أخذ الدورة التنشيطية؟",
        answer: "في حال انتهاء صلاحية الشهادة دون أخذ الدورة التنشيطية، فلا يتم تجديد بطاقة السائق المهني."
      },
      {
        question: "هل يمكن تقديم اختبارات عن بعد؟",
        answer: "لا، يجب إجراء الاختبارات حضورياً، وأن تكون إلكترونية (محوسبة)."
      }
    ]
  },
  {
    id: "technical",
    title: "المتطلبات التقنية",
    icon: <Laptop className="h-5 w-5 text-primary" />,
    questions: [
      {
        question: "ما هي متطلبات البنية التقنية لمراكز التدريب؟",
        answer: "تشمل المتطلبات التقنية لمراكز التدريب تجهيز القاعة الدراسية بسبورة واحدة على الأقل، وتجهيز القاعة بجهاز وشاشة عرض، وتوفير كاميرات مراقبة داخل القاعة الدراسية ومواقع التدريب العملي، وتوفير أجهزة حاسب آلي عند الحاجة، وتوفير شبكة مزودة بالإنترنت، وموقع إلكتروني خاص بمركز التدريب."
      },
      {
        question: "هل يمكن تقديم التدريب عن بعد؟",
        answer: "نعم، يمكن توفير خيار تنفيذ عمليات التدريب عن بُعد (عند الحاجة) بعد موافقة الهيئة، على أن يتم تشغيل الكاميرات طوال فترة التدريب، ومتابعة تفاعل وحضور المتدربين."
      },
      {
        question: "ما هي مدة الاحتفاظ بتسجيلات الكاميرات؟",
        answer: "يجب تخزين بيانات كاميرات المراقبة لمدة لا تقل عن 180 يوماً؛ للرجوع لها عند الحاجة."
      }
    ]
  }
];

const FAQPage = () => {
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
              <HelpCircle className="h-10 w-10" />
              الأسئلة الشائعة
            </h1>
            <p className="text-white/80 text-lg mb-8">
              إجابات على الأسئلة المتكررة حول برنامج تأهيل السائقين المهنيين ومتطلبات مراكز التدريب والاختبار
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {faqCategories.map((category, index) => (
            <AnimatedGradientBorder
              key={category.id}
              gradient="modern"
              intensity="low"
              className="rounded-2xl overflow-hidden shadow-xl h-full"
            >
              <motion.div 
                className="bg-card rounded-2xl overflow-hidden h-full p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  {category.questions.length} أسئلة متعلقة بـ {category.title}
                </p>
                <div className="mt-auto">
                  <a 
                    href={`#${category.id}`} 
                    className="text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    عرض الأسئلة
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                  </a>
                </div>
              </motion.div>
            </AnimatedGradientBorder>
          ))}
        </div>

        {faqCategories.map((category) => (
          <div id={category.id} key={category.id}>
            <AnimatedGradientBorder
              gradient="modern"
              intensity="low"
              className="rounded-2xl overflow-hidden shadow-xl mb-8"
            >
              <div className="bg-card rounded-2xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-1 bg-gradient-to-b from-[#0C7D99] to-[#0D9C65] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-right flex items-center gap-2">
                      {category.icon}
                      <span>{category.title}</span>
                    </h2>
                  </div>

                  <Accordion type="single" collapsible className="w-full" dir="rtl">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={`${category.id}-${index}`} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-right font-medium">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-right">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </AnimatedGradientBorder>
          </div>
        ))}

        {/* Contact Section */}
        <AnimatedGradientBorder
          gradient="modern"
          intensity="low"
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-1 bg-gradient-to-b from-[#0C7D99] to-[#0D9C65] rounded-full"></div>
                <h2 className="text-2xl font-bold text-right">لم تجد إجابة لسؤالك؟</h2>
              </div>

              <div className="text-center max-w-2xl mx-auto py-6">
                <p className="text-lg mb-6">
                  إذا لم تجد إجابة لسؤالك، يرجى التواصل معنا عبر قنوات الدعم المتاحة وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <button className="bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] hover:opacity-90 text-white px-6 py-3 rounded-md shadow-md transition-all duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    تواصل عبر البريد الإلكتروني
                  </button>
                  <button className="bg-white border border-[#0C7D99] text-[#0C7D99] hover:bg-[#0C7D99]/5 px-6 py-3 rounded-md shadow-md transition-all duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headphones">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                    </svg>
                    الدعم الفني
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedGradientBorder>
      </div>

      {/* Footer is now managed globally */}
    </div>
  );
};

export default FAQPage;