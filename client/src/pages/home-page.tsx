import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Target,
  Building2,
  ClipboardCheck,
  Award,
  FileCheck,
  Users,
  BookOpen,
  ScrollText,
  LineChart,
  Search,
  School,
} from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";


const slides = [
  {
    title: "نرتقي بكفاءة سائقي ومديري التشغيل في النقل البري",
    description:
      "وفق أعلى معايير السلامة والجودة",
    gradient: "gradient-blue-green",
  },
  {
    title: "شهادة الكفاءة المهنية",
    description:
      "خطوتك الأولى نحو مستقبل مهني متميز في قطاع النقل",
    gradient: "gradient-green-blue",
  },
  {
    title: "نسعى لتحقيق النقل الآمن والمستدام",
    description: "للركاب والبضائع بسواعد كوادر وطنية مؤهلة",
    gradient: "gradient-primary",
  },
  {
    title: "مراكز تدريب واختبار معتمدة",
    description: "بأحدث التقنيات والمعايير العالمية لتأهيل الكفاءات المهنية",
    gradient: "gradient-green-blue",
  },
];

const goals = [
  {
    icon: <FileCheck className="h-6 w-6 text-white" />,
    title: "أتمتة الإجراءات",
    description:
      "تمتت إجراءات التسجيل والإعتماد لمراكز التدريب والتأهيل ومراكز الاختيار",
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    title: "تسهيل التأهيل",
    description:
      "تسهيل إجراء عمليات التأهيل المهني للعاملين في أنشطة النقل البري",
  },
  {
    icon: <LineChart className="h-6 w-6 text-white" />,
    title: "قاعدة بيانات متكاملة",
    description:
      "بناء قاعدة بيانات تمكن الإدارة قياس أداء مراكز التدريب والاختبار والحصول على الاحصائيات المختلفة",
  },
  {
    icon: <Target className="h-6 w-6 text-white" />,
    title: "تحسين الأداء",
    description: "توثيق عمليات الرقابة والقدرة على تحسين الأداء",
  },
];

const services = [
  {
    id: 1,
    icon: <Building2 className="h-8 w-8 text-[#0C7D99]" />,
    title: "تسجيل مراكز التدريب",
    color: "bg-[#0C7D99]",
  },
  {
    id: 2,
    icon: <ClipboardCheck className="h-8 w-8 text-[#00A896]" />,
    title: "تسجيل مراكز الاختبار",
    color: "bg-[#00A896]",
  },
  {
    id: 3,
    icon: <Users className="h-8 w-8 text-[#05668D]" />,
    title: "تسجيل المتدربين",
    color: "bg-[#05668D]",
  },
  {
    id: 4,
    icon: <ScrollText className="h-8 w-8 text-[#028090]" />,
    title: "تسجيل المتقدمين للاختبار",
    color: "bg-[#028090]",
  },
  {
    id: 5,
    icon: <Award className="h-8 w-8 text-[#0C7D99]" />,
    title: "طباعة وثيقة اعتماد مراكز التدريب ومراكز الاختبار",
    color: "bg-[#0C7D99]",
  },
  {
    id: 6,
    icon: <BookOpen className="h-8 w-8 text-[#00A896]" />,
    title: "طباعة شهادة الكفاءة المهنية",
    color: "bg-[#00A896]",
  },
  {
    id: 7,
    icon: <Search className="h-8 w-8 text-[#05668D]" />,
    title: "توثيق الزيارة الميدانية",
    color: "bg-[#05668D]",
  },
  {
    id: 8,
    icon: <LineChart className="h-8 w-8 text-[#028090]" />,
    title: "استعراض التقارير",
    color: "bg-[#028090]",
  },
  {
    id: 9,
    icon: <FileCheck className="h-8 w-8 text-[#0C7D99]" />,
    title: "تمكين عمليات المطابقة",
    color: "bg-[#0C7D99]",
  },
];

const qualificationSteps = [
  {
    number: 1,
    title: "برامج تدريبية مهنية",
    description: "مناسبة لكل فئة",
    icon: <BookOpen className="h-12 w-12 text-white" />,
  },
  {
    number: 2,
    title: "إجراء اختبار الكفاءة المهنية",
    description: "عن طريق المراكز المختصة",
    icon: <ClipboardCheck className="h-12 w-12 text-white" />,
  },
  {
    number: 3,
    title: "منح شهادة الكفاءة",
    description: "المهنية بعد اجتياز الاختبار",
    icon: <Award className="h-12 w-12 text-white" />,
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[700px]">
        
        {/* Curved Top Border */}
        <div className="absolute top-0 left-0 right-0 h-5 bg-white rounded-b-[50px] z-20 shadow-md"></div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float {
            0% { transform: translateY(0); }
            100% { transform: translateY(8px); }
          }
        `}} />
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="relative w-full h-full">
              <div className={`absolute inset-0 ${slide.gradient}`}></div>
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center mt-0">
                  {/* Left Side Content (Right in RTL) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="order-2 lg:order-1 flex flex-col justify-center"
                  >
                    <div className="inline-block mb-7 rounded-full bg-white/20 px-5 py-3 backdrop-blur">
                      <span className="text-white font-medium text-lg">منصة التأهيل المهني</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-white mb-7 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-xl">
                      {slide.description}
                    </p>
                    
                    {/* Button removed as requested */}
                  </motion.div>
                  
                  {/* Left Side Illustration (Right in RTL) - Changed Position */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="order-1 lg:order-2 flex justify-end items-center"
                  >
                    {index === 0 && (
                      <div className="relative w-full h-80 md:h-96">
                        {/* Main Circle - Hidden on mobile */}
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0, -5, 0]
                          }}
                          transition={{ 
                            duration: 8, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                          className="absolute w-72 h-72 rounded-full bg-white/10 backdrop-blur-md border border-white/30 hidden md:flex items-center justify-center"
                          style={{ left: "calc(50% - 144px)", top: "calc(50% - 144px)" }}
                        >
                          {/* Central Icon */}
                          <div className="w-40 h-40 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <Award className="w-20 h-20 text-white" />
                          </div>
                          
                          {/* Orbiting Elements */}
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="w-16 h-16 rounded-full bg-[#0C7D99] flex items-center justify-center shadow-lg">
                                <FileCheck className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                              <div className="w-16 h-16 rounded-full bg-[#00A896] flex items-center justify-center shadow-lg">
                                <LineChart className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                              <div className="w-16 h-16 rounded-full bg-[#05668D] flex items-center justify-center shadow-lg">
                                <Target className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                            className="absolute w-full h-full"
                          >
                            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                              <div className="w-16 h-16 rounded-full bg-[#0D9C65] flex items-center justify-center shadow-lg">
                                <Building2 className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                        
                        {/* Mobile Version - Simple Icon */}
                        <div className="md:hidden flex items-center justify-center h-full">
                          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <Award className="w-16 h-16 text-white" />
                          </div>
                        </div>
                        
                        {/* Light Effects - Hidden on mobile */}
                        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#0C7D99] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#0D9C65] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                      </div>
                    )}
                    
                    {index === 1 && (
                      <div className="relative w-full h-80 md:h-96">
                        {/* Card effect - Hidden on mobile */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0C7D99] to-[#0D9C65] opacity-30 rounded-3xl hidden md:block"></div>
                        
                        {/* Creative elements - Hidden on mobile */}
                        <motion.div
                          animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 1, 0] 
                          }}
                          transition={{ 
                            duration: 6, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-72 rounded-3xl shadow-2xl overflow-hidden bg-[#0C7D99]/40 border border-white/10 hidden md:block"
                          style={{
                            transform: "perspective(800px) rotateY(-15deg) rotateX(5deg)"
                          }}
                        >
                        </motion.div>
                        
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                            rotate: [0, 1, 0] 
                          }}
                          transition={{ 
                            duration: 7, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.3
                          }}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-72 rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-[#0C7D99] to-[#0D9C65] border border-white/10 hidden md:block"
                        >
                          {/* Dashboard Display */}
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-64 h-48 bg-gradient-to-br from-[#0C7D99] to-[#0D9C65] rounded-xl shadow-xl relative overflow-hidden">
                              {/* Dashboard Content */}
                              <div className="p-3 h-full">
                                <div className="h-8 w-full bg-white/10 flex items-center px-3 mb-2">
                                  <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-white/60"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/40"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/40"></div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-20 h-4 bg-white/20 rounded"></div>
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                
                                {/* Stats Indicators */}
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div className="p-1">
                                    <div className="h-2 w-full bg-white/30 rounded-full mb-1"></div>
                                    <div className="h-2 w-2/3 bg-white/20 rounded-full"></div>
                                  </div>
                                  <div className="p-1">
                                    <div className="h-2 w-full bg-white/30 rounded-full mb-1"></div>
                                    <div className="h-2 w-4/5 bg-white/20 rounded-full"></div>
                                  </div>
                                  <div className="p-1">
                                    <div className="h-2 w-full bg-white/30 rounded-full mb-1"></div>
                                    <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Mobile Version - Simple Icon */}
                        <div className="md:hidden flex items-center justify-center h-full">
                          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <LineChart className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div className="relative w-full h-80 md:h-96">
                        {/* Orbital elements - Hidden on mobile */}
                        <div className="absolute inset-0 rounded-3xl hidden md:flex items-center justify-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 60, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="w-72 h-72 rounded-full border-4 border-[#0C7D99]/30"
                            style={{ 
                              boxShadow: "0 0 30px 5px rgba(12, 125, 153, 0.2)"
                            }}
                          >
                          </motion.div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, -360]
                            }}
                            transition={{ 
                              duration: 40, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-56 h-56 rounded-full border-4 border-[#0D9C65]/30"
                            style={{ 
                              boxShadow: "0 0 30px 5px rgba(13, 156, 101, 0.2)"
                            }}
                          >
                          </motion.div>
                          
                          <div className="absolute w-40 h-40 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                            <Building2 className="w-20 h-20 text-white" />
                          </div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 20, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-72 h-72"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ top: "0%", left: "50%", transform: "translate(-50%, -50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <Users className="w-8 h-8 text-[#0C7D99]" />
                              </div>
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, -360]
                            }}
                            transition={{ 
                              duration: 30, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-56 h-56"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ bottom: "0%", right: "0%", transform: "translate(50%, 50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <Award className="w-8 h-8 text-[#0D9C65]" />
                              </div>
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 25, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-56 h-56"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ bottom: "0%", left: "0%", transform: "translate(-50%, 50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <Target className="w-8 h-8 text-[#0C7D99]" />
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>
                        
                        {/* Light Effects - Hidden on mobile */}
                        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#0C7D99] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#0D9C65] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                        
                        {/* Mobile Version - Simple Icon */}
                        <div className="md:hidden flex items-center justify-center h-full">
                          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <Building2 className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index === 3 && (
                      <div className="relative w-full h-80 md:h-96">
                        {/* Centers Icon - Hidden on mobile */}
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, 0, -2, 0]
                          }}
                          transition={{ 
                            duration: 7, 
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                          className="absolute w-72 h-72 rounded-full bg-white/10 backdrop-blur-md border border-white/30 hidden md:flex items-center justify-center"
                          style={{ left: "calc(50% - 144px)", top: "calc(50% - 144px)" }}
                        >
                          {/* Central Icon */}
                          <div className="absolute w-40 h-40 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                            <ClipboardCheck className="w-20 h-20 text-white" />
                          </div>
                          
                          {/* Orbiting Elements */}
                          <motion.div
                            animate={{ 
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 25, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-72 h-72"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ top: "0%", left: "50%", transform: "translate(-50%, -50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <BookOpen className="w-8 h-8 text-[#0C7D99]" />
                              </div>
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, -360]
                            }}
                            transition={{ 
                              duration: 22, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-56 h-56"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ bottom: "0%", right: "0%", transform: "translate(50%, 50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <Building2 className="w-8 h-8 text-[#0D9C65]" />
                              </div>
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            animate={{ 
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 28, 
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute w-56 h-56"
                          >
                            <motion.div 
                              className="absolute"
                              style={{ bottom: "0%", left: "0%", transform: "translate(-50%, 50%)" }}
                            >
                              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                <FileCheck className="w-8 h-8 text-[#0C7D99]" />
                              </div>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                        
                        {/* Light Effects - Hidden on mobile */}
                        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#0C7D99] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#0D9C65] rounded-full opacity-20 blur-3xl hidden md:block"></div>
                        
                        {/* Mobile Version - Simple Icon */}
                        <div className="md:hidden flex items-center justify-center h-full">
                          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <ClipboardCheck className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Curve Divider */}
      <div className="h-12 bg-white rounded-t-[50px] -mt-8 relative z-10"></div>

      {/* Professional Qualification Section */}
      <section className="pt-6 pb-14 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#0C7D99]/10 text-[#0C7D99] font-medium mb-4">التأهيل المهني</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">ماهو التأهيل المهني</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              رفع مهارات وكفاءة العاملين في قطاع النقل البري من سائقين ومدراء
              تشغيل بما يتوافق مع احتياجات المهنة والممارسات العالمية وضمان
              تحقيق معايير السلامة والأمان.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {qualificationSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <Card className="h-full relative overflow-hidden group hover:shadow-lg transition-shadow border-0 gradient-card-hover">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="w-24 h-24 rounded-full gradient-blue-green flex items-center justify-center shadow-md">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#05668D]">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    <div className="absolute -top-6 -right-6 w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md">
                      {step.number}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curve Divider */}
      <div className="h-12 bg-[#f8fafc] rounded-t-[50px] -mb-8 relative z-10"></div>

      {/* Goals Section */}
      <section className="pt-6 pb-14 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#0C7D99]/10 text-[#0C7D99] font-medium mb-4">الأهداف</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gradient">أهداف النظام التقني</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {goals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 gradient-card-hover">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-md">
                      {goal.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#05668D]">{goal.title}</h3>
                    <p className="text-gray-600">{goal.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curve Divider */}
      <div className="h-12 bg-white rounded-t-[50px] -mb-8 relative z-10"></div>
      
      {/* Services Section */}
      <section className="pt-6 pb-14 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 gradient-blue-green opacity-10 rounded-full -ml-32 -mt-32 z-0"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 gradient-green-blue opacity-10 rounded-full -mr-32 -mb-32 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-[#0C7D99]/10 text-[#0C7D99] font-medium mb-4">الخدمات</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">خدماتنا</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات لتلبية احتياجات قطاع النقل البري
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${service.color} bg-opacity-20 flex items-center justify-center mb-4 shadow-md hover:scale-110 transition-transform duration-300`}
                >
                  {service.icon}
                </div>
                <h3 className="text-sm md:text-base font-bold text-[#05668D] text-center">
                  {service.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}