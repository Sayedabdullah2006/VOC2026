import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Menu } from "lucide-react";
import AppLogo from "@/components/app-logo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback } from "react";
import { UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
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
          if (user.role !== UserRole.TRAINING_CENTER) {
            toast({
              title: "غير مصرح",
              description: "هذه الخدمة متاحة فقط لمراكز التدريب",
              variant: "destructive",
            });
            return "/";
          }
          return "/dashboard/centers/register";

        case "/test-centers/register":
          if (user.role !== UserRole.TESTING_CENTER) {
            toast({
              title: "غير مصرح",
              description: "هذه الخدمة متاحة فقط لمراكز الاختبار",
              variant: "destructive",
            });
            return "/";
          }
          return "/dashboard/test-centers/register";

        case "/student/register":
          if (user.role !== UserRole.STUDENT) {
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

  return (
    <header
      className={cn("transition-colors duration-300 bg-white shadow-md sticky top-0 z-50", className)}
    >
        <div className="container mx-auto px-4 h-20 flex items-center">
        {/* Logo Section - Right Side */}
        <div className="flex items-center gap-8 ml-auto">
          <Link href="/">
            <div className="flex items-center gap-4">
              <AppLogo size="sm" />
              <h1 className="text-xl font-bold text-[#05668D] cursor-pointer">لوجستي</h1>
            </div>
          </Link>

          {/* Navigation Menu - After Logos */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[#05668D] hover:text-[#0C7D99] bg-transparent hover:bg-[#0C7D99]/5 border-none">
                  مراكز التدريب
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px] gradient-green-blue backdrop-blur-sm rounded-lg shadow-lg">
                    <Link href={handleServiceClick("/centers/register")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          تسجيل مركز تدريب
                        </div>
                        <p className="text-sm text-white/80">
                          تسجيل مركز تدريب جديد في المنصة
                        </p>
                      </div>
                    </Link>
                    <Link href={handleServiceClick("/centers/search")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          البحث عن مراكز التدريب
                        </div>
                        <p className="text-sm text-white/80">
                          استعراض مراكز التدريب المعتمدة
                        </p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[#05668D] hover:text-[#0C7D99] bg-transparent hover:bg-[#0C7D99]/5 border-none">
                  مراكز الاختبار
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px] gradient-green-blue backdrop-blur-sm rounded-lg shadow-lg">
                    <Link href={handleServiceClick("/test-centers/register")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          تسجيل مركز اختبار
                        </div>
                        <p className="text-sm text-white/80">
                          تسجيل مركز اختبار جديد في المنصة
                        </p>
                      </div>
                    </Link>
                    <Link href={handleServiceClick("/test-centers/search")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          البحث عن مراكز الاختبار
                        </div>
                        <p className="text-sm text-white/80">
                          استعراض مراكز الاختبار المعتمدة
                        </p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-[#05668D] hover:text-[#0C7D99] bg-transparent hover:bg-[#0C7D99]/5 border-none">
                  خدمات المتدربين
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px] gradient-green-blue backdrop-blur-sm rounded-lg shadow-lg">
                    <Link href={handleServiceClick("/student/register")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          التسجيل كمتدرب
                        </div>
                        <p className="text-sm text-white/80">
                          التسجيل في برنامج تأهيل السائقين المهنيين
                        </p>
                      </div>
                    </Link>
                    <Link href={handleServiceClick("/courses/progress")}>
                      <div className="block p-3 space-y-1 hover:bg-white/10 rounded-md cursor-pointer transition-all duration-300">
                        <div className="font-medium text-white">
                          متابعة التقدم
                        </div>
                        <p className="text-sm text-white/80">
                          متابعة التقدم في الدورات والاختبارات
                        </p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User Profile Section - Left Side */}
        <div className="flex items-center gap-4 mr-auto">
          {!user ? (
            <Link href="/auth">
              <Button className="gap-2 gradient-primary hover:opacity-90 text-white shadow-md">
                <span>تسجيل الدخول</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 text-[#05668D] hover:bg-[#0C7D99]/5"
                >
                  <Avatar className="h-8 w-8 border-2 border-[#0C7D99]/20">
                    <AvatarFallback className="bg-[#00A896] text-white">
                      {user.fullName?.[0] || user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">
                    {user.fullName || user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl text-right">
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer text-[#0C7D99] hover:bg-[#0C7D99]/10">
                    لوحة التحكم
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer text-[#0C7D99] hover:bg-[#0C7D99]/10">
                    الملف الشخصي
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer text-[#0C7D99] hover:bg-[#0C7D99]/10">
                    الإعدادات
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer hover:bg-red-50"
                  onClick={() => logoutMutation.mutate()}
                >
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[#05668D] hover:bg-[#0C7D99]/5"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 gradient-card">
              <div className="flex flex-col gap-4 mt-6">
                {user && (
                  <div className="flex items-center gap-2 px-4">
                    <Avatar className="h-10 w-10 border-2 border-[#0C7D99]/20">
                      <AvatarFallback className="bg-[#00A896] text-white">
                        {user.fullName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#0C7D99]">
                        {user.fullName || user.username}
                      </span>
                      <div className="flex gap-2 mt-2">
                        <Link href="/dashboard">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gradient-primary text-white"
                          >
                            لوحة التحكم
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gradient-secondary text-white"
                          >
                            الملف الشخصي
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="border-b border-[#0C7D99]/20 pb-4">
                    <h3 className="font-medium mb-2 text-[#05668D]">مراكز التدريب</h3>
                    <div className="space-y-2">
                      <Link href={handleServiceClick("/centers/register")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          تسجيل مركز تدريب
                        </div>
                      </Link>
                      <Link href={handleServiceClick("/centers/search")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          البحث عن مراكز التدريب
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="border-b border-[#0C7D99]/20 pb-4">
                    <h3 className="font-medium mb-2 text-[#05668D]">مراكز الاختبار</h3>
                    <div className="space-y-2">
                      <Link href={handleServiceClick("/test-centers/register")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          تسجيل مركز اختبار
                        </div>
                      </Link>
                      <Link href={handleServiceClick("/test-centers/search")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          البحث عن مراكز الاختبار
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-[#05668D]">خدمات المتدربين</h3>
                    <div className="space-y-2">
                      <Link href={handleServiceClick("/student/register")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          التسجيل كمتدرب
                        </div>
                      </Link>
                      <Link href={handleServiceClick("/courses/progress")}>
                        <div className="block p-2 text-sm text-gray-600 hover:bg-[#0C7D99]/5 rounded-md cursor-pointer transition-all duration-300">
                          متابعة التقدم
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
