import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Menu, Search, GraduationCap, Bell, Home, User, Settings, LogOut, School, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useState, useCallback, useRef, useEffect } from "react";
import { UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  className?: string;
}

export default function ModernHeaderHome({ className }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleServiceClick = useCallback((path: string) => {
    switch (path) {
      case "/centers/register":
        return "/intro/training-center";
      case "/centers/search":
        return "/intro/training-centers/search";
      case "/test-centers/register":
        return "/intro/testing-center";
      case "/test-centers/search":
        return "/intro/testing-centers/search";
      case "/student/register":
        return "/intro/student";
      case "/courses/progress":
        return "/intro/course-progress";
      default:
        return path;
    }
  }, []);

  const handleDashboardRedirect = useCallback(
    (path: string) => {
      if (!user) {
        toast({
          title: "يجب تسجيل الدخول",
          description: "الرجاء تسجيل الدخول للوصول إلى هذه الخدمة",
          variant: "destructive",
        });
        return "/auth";
      }

      switch (path) {
        case "/centers/register":
          if (user?.role !== UserRole.TRAINING_CENTER) {
            toast({
              title: "غير مصرح",
              description: "هذه الخدمة متاحة فقط لمراكز التدريب",
              variant: "destructive",
            });
            return "/";
          }
          return "/dashboard/centers/register";

        case "/test-centers/register":
          if (user?.role !== UserRole.TESTING_CENTER) {
            toast({
              title: "غير مصرح",
              description: "هذه الخدمة متاحة فقط لمراكز الاختبار",
              variant: "destructive",
            });
            return "/";
          }
          return "/dashboard/test-centers/register";

        case "/student/register":
          if (user?.role !== UserRole.STUDENT) {
            toast({
              title: "غير مصرح",
              description: "هذه الخدمة متاحة فقط للمتدربين",
              variant: "destructive",
            });
            return "/";
          }
          return "/dashboard/student/register";

        default:
          return `/dashboard${path}`;
      }
    },
    [user, toast],
  );

  // State for dropdown menus
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeMenu && menuRefs.current[activeMenu] && 
          !menuRefs.current[activeMenu]?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  // Animation variants
  const logoVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.3, 
        delay: 0.1 + (i * 0.1) 
      } 
    }),
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 } 
    }
  };

  const menuVariants = {
    initial: { opacity: 0, y: 10, height: 0 },
    animate: { 
      opacity: 1, 
      y: 0, 
      height: "auto",
      transition: { 
        duration: 0.3,
        height: { duration: 0.4 },
      } 
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      height: 0,
      transition: { 
        duration: 0.2,
        height: { duration: 0.3 },
      } 
    }
  };

  const headerButton = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <header
      className={cn(
        "transition-all duration-300 z-50",
        "bg-white", 
        className
      )}
    >
      <div className="container mx-auto px-4 h-24 flex items-center pt-2">
        {/* Logo Section - Right Side */}
        <div className="flex items-center gap-8 ml-auto">
          <Link href="/">
            <motion.div 
              className="flex items-center gap-4"
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <img
                src="/assets/images/LogistiLogo.png"
                alt="شعار الهيئة العامة للنقل"
                className="h-12 w-auto cursor-pointer"
              />
            </motion.div>
          </Link>

          {/* Custom Dropdown Menu - After Logos */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {[
              { label: "مراكز التدريب", path: "/centers" },
              { label: "مراكز الاختبار", path: "/test-centers" },
              { label: "خدمات المتدربين", path: "/student" }
            ].map((item, i) => (
              <div key={item.path} className="relative" ref={el => (menuRefs.current[item.path] = el)}>
                <motion.div
                  custom={i}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex items-center gap-1 cursor-pointer py-3 px-4 rounded-md hover:bg-primary/5 transition-colors"
                  onClick={() => setActiveMenu(activeMenu === item.path ? null : item.path)}
                >
                  <span className="text-foreground font-medium text-lg">{item.label}</span>
                  <ChevronDown 
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-200",
                      activeMenu === item.path ? "transform rotate-180" : ""
                    )} 
                  />
                </motion.div>
                
                <AnimatePresence>
                  {activeMenu === item.path && (
                    <motion.div
                      variants={menuVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute top-full right-0 mt-2 z-50 w-[350px]"
                    >
                      <AnimatedGradientBorder 
                        gradient="modern" 
                        intensity="high" 
                        containerClassName="w-full"
                      >
                        <div className="grid gap-3 p-6 bg-white rounded-md shadow-lg" dir="rtl">
                          <Link href={handleServiceClick(`${item.path}/register`)}>
                            <div className="block p-3 space-y-1 hover:bg-primary/10 rounded-md cursor-pointer transition-all duration-300">
                              <div className="font-medium text-foreground flex items-center gap-2 justify-end">
                                {item.label === "مراكز التدريب" ? "تسجيل مركز تدريب" : 
                                item.label === "مراكز الاختبار" ? "تسجيل مركز اختبار" : 
                                "التسجيل كمتدرب"}
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground text-right">
                                {item.label === "مراكز التدريب" ? "تسجيل مركز تدريب جديد في المنصة" : 
                                item.label === "مراكز الاختبار" ? "تسجيل مركز اختبار جديد في المنصة" : 
                                "التسجيل في برنامج تأهيل السائقين المهنيين"}
                              </p>
                            </div>
                          </Link>

                          {item.label === "خدمات المتدربين" && (
                            <>
                              <Link href={handleServiceClick("/centers/search")}>
                                <div className="block p-3 space-y-1 hover:bg-primary/10 rounded-md cursor-pointer transition-all duration-300">
                                  <div className="font-medium text-foreground flex items-center gap-2 justify-end">
                                    البحث عن مراكز التدريب
                                    <Search className="h-4 w-4 text-primary" />
                                  </div>
                                  <p className="text-sm text-muted-foreground text-right">
                                    استعراض مراكز التدريب المعتمدة
                                  </p>
                                </div>
                              </Link>
                              
                              <Link href={handleServiceClick("/test-centers/search")}>
                                <div className="block p-3 space-y-1 hover:bg-primary/10 rounded-md cursor-pointer transition-all duration-300">
                                  <div className="font-medium text-foreground flex items-center gap-2 justify-end">
                                    البحث عن مراكز الاختبار
                                    <Search className="h-4 w-4 text-primary" />
                                  </div>
                                  <p className="text-sm text-muted-foreground text-right">
                                    استعراض مراكز الاختبار المعتمدة
                                  </p>
                                </div>
                              </Link>
                            </>
                          )}
                          {item.label === "مراكز التدريب" && (
                            <Link href="/training-center-requirements">
                              <div className="block p-3 space-y-1 hover:bg-primary/10 rounded-md cursor-pointer transition-all duration-300">
                                <div className="font-medium text-foreground flex items-center gap-2 justify-end">
                                  متطلبات مراكز التدريب
                                  <School className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground text-right">
                                  استعراض متطلبات مراكز التدريب والمعايير اللازمة للاعتماد
                                </p>
                              </div>
                            </Link>
                          )}
                          {item.label === "مراكز الاختبار" && (
                            <Link href="/qualification-requirements">
                              <div className="block p-3 space-y-1 hover:bg-primary/10 rounded-md cursor-pointer transition-all duration-300">
                                <div className="font-medium text-foreground flex items-center gap-2 justify-end">
                                  متطلبات التأهيل
                                  <GraduationCap className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground text-right">
                                  استعراض متطلبات التأهيل لاختبارات القيادة المهنية
                                </p>
                              </div>
                            </Link>
                          )}
                        </div>
                      </AnimatedGradientBorder>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* User Profile Section - Left Side */}
        <div className="flex items-center gap-4 mr-auto">
          {!user ? (
            <motion.div
              variants={headerButton}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Link href="/auth">
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white shadow-md">
                  <span>تسجيل الدخول</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  variants={headerButton}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Button
                    variant="ghost"
                    className="gap-2 text-foreground hover:bg-primary/5 p-2"
                  >
                    <Avatar className="h-8 w-8 border border-primary/20">
                      <AvatarImage src="" alt={user?.fullName || "User"} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user.fullName?.[0] || (user.username && user.username[0]) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">
                      {user?.fullName || user?.username || "المستخدم"}
                    </span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-right">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="font-medium text-sm">{user?.fullName || user?.username || "المستخدم"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2 flex-row-reverse">
                    <Home className="h-4 w-4 text-primary" />
                    لوحة التحكم
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2 flex-row-reverse">
                    <User className="h-4 w-4 text-primary" />
                    الملف الشخصي
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2 flex-row-reverse">
                    <Settings className="h-4 w-4 text-primary" />
                    الإعدادات
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer flex items-center gap-2 flex-row-reverse"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden text-foreground hover:bg-primary/5"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80 max-w-full">
              <AnimatedGradientBorder 
                gradient="modern" 
                variant="default" 
                intensity="low" 
                className="h-full rounded-none"
              >
                <div className="flex flex-col h-full p-6">
                  {/* Header with Logo */}
                  <div className="flex items-center gap-2 mb-6">
                    <img
                      src="https://logisti.sa/assets/img/logo.png"
                      alt="شعار الهيئة العامة للنقل"
                      className="h-9 w-auto cursor-pointer"
                    />
                  </div>

                  {/* User Profile - if logged in */}
                  {user && (
                    <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/10">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {user?.fullName?.[0] || (user?.username && user?.username[0]) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{user?.fullName || user?.username || "المستخدم"}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email || ""}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href="/dashboard" className="flex-1">
                          <Button size="sm" variant="default" className="w-full text-xs">
                            لوحة التحكم
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive text-xs border-destructive/30 hover:bg-destructive/10"
                          onClick={() => logoutMutation.mutate()}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          خروج
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6">
                      {!user && (
                        <div className="mb-4 flex justify-center">
                          <a href="/api/login" className="w-full">
                            <Button className="w-full gap-2 bg-gradient-to-r from-primary to-primary-dark">
                              <span>تسجيل الدخول</span>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium mb-2 text-primary flex items-center gap-2 px-2">
                          <span className="h-1 w-3 bg-primary rounded-full"></span>
                          مراكز التدريب
                        </h3>
                        <div className="space-y-1">
                          <Link href={handleServiceClick("/centers/register")}>
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              تسجيل مركز تدريب
                            </div>
                          </Link>

                          <Link href="/training-center-requirements">
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              متطلبات مراكز التدريب
                            </div>
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2 text-primary flex items-center gap-2 px-2">
                          <span className="h-1 w-3 bg-primary rounded-full"></span>
                          مراكز الاختبار
                        </h3>
                        <div className="space-y-1">
                          <Link href={handleServiceClick("/test-centers/register")}>
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              تسجيل مركز اختبار
                            </div>
                          </Link>

                          <Link href="/qualification-requirements">
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              متطلبات التأهيل
                            </div>
                          </Link>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2 text-primary flex items-center gap-2 px-2">
                          <span className="h-1 w-3 bg-primary rounded-full"></span>
                          خدمات المتدربين
                        </h3>
                        <div className="space-y-1">
                          <Link href={handleServiceClick("/student/register")}>
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              التسجيل كمتدرب
                            </div>
                          </Link>

                          <Link href={handleServiceClick("/centers/search")}>
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              البحث عن مراكز التدريب
                            </div>
                          </Link>
                          <Link href={handleServiceClick("/test-centers/search")}>
                            <div className="block px-3 py-2 text-sm hover:bg-primary/5 rounded-md cursor-pointer transition-all">
                              البحث عن مراكز الاختبار
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto text-center text-xs text-muted-foreground pt-4">
                    <p>© {new Date().getFullYear()} منصة التدريب المهني</p>
                    <p className="mt-1">جميع الحقوق محفوظة</p>
                  </div>
                </div>
              </AnimatedGradientBorder>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}