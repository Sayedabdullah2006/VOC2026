import React, { useState } from "react";
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
  FileCheck,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import NotificationsDropdown from "@/components/notifications-dropdown";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => {
  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all relative overflow-hidden group",
    isActive 
      ? "bg-primary/10 text-primary font-medium shadow-sm" 
      : "text-foreground hover:bg-accent/50"
  );
  
  return (
    <Link href={href}>
      <div className={className}>
        {/* Active state indicator */}
        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
        )}
        
        {/* Icon */}
        <div
          className={cn(
            "relative",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {icon}
        </div>
        
        {/* Label */}
        <span className="relative">{label}</span>
      </div>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        href: "/",
        icon: <Home className="h-4 w-4" />,
        label: "الصفحة الرئيسية"
      }
    ];

    switch(user?.role) {
      case UserRole.SUPER_ADMIN:
        return [
          ...baseItems,
          {
            href: "/super-admin/stats",
            icon: <LayoutDashboard className="h-4 w-4" />,
            label: "الإحصائيات",
          },
          {
            href: "/super-admin/certificate-matching",
            icon: <FileText className="h-4 w-4" />,
            label: "مطابقة الشهادات",
          },
          {
            href: "/super-admin/training-centers/applications",
            icon: <Building2 className="h-4 w-4" />,
            label: "طلبات مراكز التدريب",
          },
          {
            href: "/super-admin/testing-centers/applications",
            icon: <School className="h-4 w-4" />,
            label: "طلبات مراكز الاختبار",
          },
          {
            href: "/super-admin/users",
            icon: <Users className="h-4 w-4" />,
            label: "إدارة المستخدمين",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "إعدادات النظام",
          },
        ];

      case UserRole.ADMIN:
        return [
          ...baseItems,
          {
            href: "/admin/training-centers/applications",
            icon: <Building2 className="h-4 w-4" />,
            label: "طلبات مراكز التدريب",
          },
          {
            href: "/admin/testing-centers/applications",
            icon: <School className="h-4 w-4" />,
            label: "طلبات مراكز الاختبار",
          },
          {
            href: "/admin/certificate-matching",
            icon: <FileText className="h-4 w-4" />,
            label: "طلبات مطابقة الشهادات",
          },
          {
            href: "/admin/users",
            icon: <Users className="h-4 w-4" />,
            label: "إدارة المستخدمين",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "إعدادات النظام",
          },
        ];

      case UserRole.TRAINING_CENTER:
        return [
          ...baseItems,
          {
            href: "/TrainingCenter/stats",
            icon: <ClipboardList className="h-4 w-4" />,
            label: "الإحصائيات والأرقام"
          },
          {
            href: "/TrainingCenter/applications",
            icon: <ClipboardList className="h-4 w-4" />,
            label: "طلبات التسجيل",
          },
          {
            href: "/TrainingCenter/register",
            icon: <Building2 className="h-4 w-4" />,
            label: "تسجيل مركز تدريب",
          },
          {
            href: "/TrainingCenter/courses",
            icon: <BookOpen className="h-4 w-4" />,
            label: "إدارة الدورات",
          },
          {
            href: "/TrainingCenter/courses/create",
            icon: <PlusCircle className="h-4 w-4" />,
            label: "الإعلان عن الدورات",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "الإعدادات",
          },
        ];
      
      case UserRole.TESTING_CENTER:
        return [
          ...baseItems,
          {
            href: "/TestingCenter/stats",
            icon: <ClipboardList className="h-4 w-4" />,
            label: "الإحصائيات والأرقام"
          },
          {
            href: "/TestingCenter/applications",
            icon: <ClipboardList className="h-4 w-4" />,
            label: "طلبات التسجيل",
          },
          {
            href: "/TestingCenter/register",
            icon: <Building2 className="h-4 w-4" />,
            label: "تسجيل مركز اختبار",
          },
          {
            href: "/TestingCenter/exams",
            icon: <FileCheck className="h-4 w-4" />,
            label: "إدارة الاختبارات",
          },
          {
            href: "/TestingCenter/exams/create",
            icon: <PlusCircle className="h-4 w-4" />,
            label: "إضافة اختبار جديد",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "الإعدادات",
          },
        ];

      case UserRole.STUDENT:
        return [
          ...baseItems,
          {
            href: "/student/dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
            label: "لوحة التحكم",
          },
          {
            href: "/student/courses",
            icon: <BookOpen className="h-4 w-4" />,
            label: "الدورات التدريبية",
          },
          {
            href: "/student/exams",
            icon: <ClipboardCheck className="h-4 w-4" />,
            label: "الاختبارات",
          },
          {
            href: "/student/certificates",
            icon: <Award className="h-4 w-4" />,
            label: "الشهادات",
          },
          {
            href: "/student/certificate-matching",
            icon: <FileText className="h-4 w-4" />,
            label: "مطابقة شهادة",
          },
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "الإعدادات",
          },
        ];

      default:
        return [
          ...baseItems,
          {
            href: "/profile",
            icon: <UserCircle className="h-4 w-4" />,
            label: "الملف الشخصي",
          },
          {
            href: "/settings",
            icon: <Settings className="h-4 w-4" />,
            label: "الإعدادات",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  const renderNav = () => (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={location === item.href}
        />
      ))}
    </nav>
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
        <SheetContent side="right" className="w-72 p-4 bg-background/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="font-semibold">{user?.fullName}</span>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <NotificationsDropdown />
          </div>
          <Separator className="mb-4" />
          {renderNav()}
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation - Fixed with enhanced styling */}
      <div className="hidden md:block">
        <div className="fixed top-0 right-0 h-screen w-72 border-l bg-background/95 backdrop-blur-[2px] shadow-sm z-20">
          <div className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between px-3">
              <div className="flex flex-col">
                <span className="font-semibold">{user?.fullName}</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              <NotificationsDropdown />
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
              {renderNav()}
            </div>
            
            {/* Decorative gradient at the bottom */}
            <div className="h-16 w-full absolute bottom-0 right-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:mr-72">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;