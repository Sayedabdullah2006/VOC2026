import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Menu,
  School,
  ClipboardCheck,
  FileText,
  Settings,
  UserCircle,
  BookOpen,
  Award,
  UserPlus,
  Building2,
  PlusCircle,
  Home,
  Users,
  ClipboardList,
  ChevronLeft,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import { AnimatedMenuItem } from "@/components/ui/animated-menu-item"; 
import NotificationsDropdown from "@/components/notifications-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const ModernDashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        href: "/",
        icon: <Home className="h-5 w-5" />,
        label: "الصفحة الرئيسية"
      }
    ];

    switch(user?.role) {
      case UserRole.SUPER_ADMIN:
        return [
          ...baseItems,
          {
            href: "/super-admin/stats",
            icon: <LayoutDashboard className="h-5 w-5" />,
            label: "الإحصائيات",
          },
          {
            href: "/super-admin/certificate-matching",
            icon: <FileText className="h-5 w-5" />,
            label: "مطابقة الشهادات",
          },
          {
            href: "/super-admin/training-centers/applications",
            icon: <Building2 className="h-5 w-5" />,
            label: "طلبات مراكز التدريب",
          },
          {
            href: "/super-admin/testing-centers/applications",
            icon: <School className="h-5 w-5" />,
            label: "طلبات مراكز الاختبار",
          },
          {
            href: "/super-admin/users",
            icon: <Users className="h-5 w-5" />,
            label: "إدارة المستخدمين",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-5 w-5" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-5 w-5" />,
            label: "إعدادات النظام",
          },
        ];

      case UserRole.ADMIN:
        return [
          ...baseItems,
          {
            href: "/admin/training-centers/applications",
            icon: <Building2 className="h-5 w-5" />,
            label: "طلبات مراكز التدريب",
          },
          {
            href: "/admin/testing-centers/applications",
            icon: <School className="h-5 w-5" />,
            label: "طلبات مراكز الاختبار",
          },
          {
            href: "/admin/certificate-matching",
            icon: <FileText className="h-5 w-5" />,
            label: "طلبات مطابقة الشهادات",
          },
          {
            href: "/admin/users",
            icon: <Users className="h-5 w-5" />,
            label: "إدارة المستخدمين",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-5 w-5" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-5 w-5" />,
            label: "إعدادات النظام",
          },
        ];

      case UserRole.TRAINING_CENTER:
        return [
          ...baseItems,
          {
            href: "/TrainingCenter/stats",
            icon: <ClipboardList className="h-5 w-5" />,
            label: "الإحصائيات والأرقام"
          },
          {
            href: "/TrainingCenter/applications",
            icon: <ClipboardList className="h-5 w-5" />,
            label: "طلبات التسجيل",
          },
          {
            href: "/TrainingCenter/register",
            icon: <Building2 className="h-5 w-5" />,
            label: "تسجيل مركز تدريب",
          },
          {
            href: "/TrainingCenter/courses",
            icon: <BookOpen className="h-5 w-5" />,
            label: "إدارة الدورات",
          },
          {
            href: "/TrainingCenter/courses/create",
            icon: <PlusCircle className="h-5 w-5" />,
            label: "الإعلان عن الدورات",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-5 w-5" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-5 w-5" />,
            label: "الإعدادات",
          },
        ];

      case UserRole.STUDENT:
        return [
          ...baseItems,
          {
            href: "/student/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
            label: "لوحة التحكم",
          },
          {
            href: "/student/courses",
            icon: <BookOpen className="h-5 w-5" />,
            label: "الدورات التدريبية",
          },
          {
            href: "/student/exams",
            icon: <ClipboardCheck className="h-5 w-5" />,
            label: "الاختبارات",
          },
          {
            href: "/student/certificates",
            icon: <Award className="h-5 w-5" />,
            label: "الشهادات",
          },
          {
            href: "/student/certificate-matching",
            icon: <FileText className="h-5 w-5" />,
            label: "مطابقة شهادة",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-5 w-5" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-5 w-5" />,
            label: "الإعدادات",
          },
        ];

      default:
        return [
          ...baseItems,
          {
            href: "/profile",
            icon: <UserCircle className="h-5 w-5" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-5 w-5" />,
            label: "الإعدادات",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const renderNav = () => (
    <div className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <AnimatedMenuItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={isMenuCollapsed ? "" : item.label}
          isActive={location === item.href}
          className={isMenuCollapsed ? "justify-center" : ""}
        />
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed right-4 top-4 z-40 md:hidden shadow-md bg-background/90 backdrop-blur-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0 overflow-hidden bg-background">
          <AnimatedGradientBorder 
            gradient="modern" 
            variant="default" 
            intensity="low" 
            className="h-full py-4"
          >
            <div className="flex flex-col h-full p-4">
              {/* User Profile Section */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src="/user-avatar.png" alt={user?.fullName || "المستخدم"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.fullName?.[0] || "م"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user?.fullName || "المستخدم"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>

              <Separator className="mb-4" />

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-2">
                {renderNav()}
              </div>

              {/* Bottom Section */}
              <div className="mt-auto px-2">
                <Separator className="my-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </AnimatedGradientBorder>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation - Fixed with enhanced styling */}
      <div className="hidden md:block">
        <div 
          className={cn(
            "fixed top-0 right-0 h-screen border-l shadow-sm z-20 transition-all duration-300",
            "bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-[2px]",
            isMenuCollapsed ? "w-20" : "w-72"
          )}
        >
          {/* Animated border wrapper */}
          <AnimatedGradientBorder 
            gradient="modern"
            variant="default"
            intensity="low"
            className="h-full rounded-none rounded-r-none" 
          >
            <div className="flex h-full flex-col">
              {/* Header section with user info */}
              <div className={cn(
                "flex items-center px-4 py-4 transition-all duration-300",
                isMenuCollapsed ? "justify-center" : "justify-between"
              )}>
                {!isMenuCollapsed && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 border border-primary/20">
                      <AvatarImage src="/user-avatar.png" alt={user?.fullName || "المستخدم"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.fullName?.[0] || "م"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user?.fullName}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {isMenuCollapsed && (
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage src="/user-avatar.png" alt={user?.fullName || "المستخدم"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.fullName?.[0] || "م"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isMenuCollapsed && <NotificationsDropdown />}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    {isMenuCollapsed ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              {/* Main navigation area */}
              <div className={cn(
                "flex-1 overflow-y-auto px-3 pt-2 pb-6 scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent",
                "transition-all duration-500 ease-in-out"
              )}>
                {renderNav()}

                {/* Logout at bottom */}
                <div className="mt-6">
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full text-muted-foreground hover:text-destructive transition-colors",
                      isMenuCollapsed ? "justify-center px-2" : "justify-start"
                    )}
                    onClick={() => logout()}
                  >
                    <LogOut className="h-5 w-5" />
                    {!isMenuCollapsed && <span className="mr-2">تسجيل الخروج</span>}
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedGradientBorder>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className={cn(
        "fixed top-0 z-30 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur-sm md:right-72 transition-all duration-300",
        isMenuCollapsed && "md:right-20"
      )}>
        <div className="flex items-center justify-between h-full px-4">
          {/* Mobile menu is shown in top-right corner already */}
          <div className="flex items-center gap-2">
            {/* Mobile-only notification icon */}
            <div className="md:hidden">
              <NotificationsDropdown />
            </div>
            
            {/* Logo or brand name */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">منصة التدريب المهني</span>
            </div>
          </div>
          
          {/* User dropdown (mobile only) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src="/user-avatar.png" alt={user?.fullName || "المستخدم"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.fullName?.[0] || "م"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium text-sm">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Decorative gradient line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/5 via-primary/50 to-primary/5" />
      </div>

      {/* Main Content with modern shadow effect */}
      <motion.main 
        className={cn(
          "flex-1 pt-16 transition-all duration-300 ease-in-out md:mr-72",
          isMenuCollapsed && "md:mr-20"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default ModernDashboardLayout;