import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Building2, Clock, Users, Calendar, MapPin, Info, Check, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { UserRole, CourseStatus, type CourseStatusType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { CourseStatusIndicator } from "@/components/ui/course-status-indicator";
import { Link } from "wouter";

interface TrainingCenter {
  id: number;
  name: string;
  region: string;
  centerName: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  capacity: number;
  start_date: string;
  status: string; // قد تكون نص من قاعدة البيانات
  training_center_id: number;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCenter, setSelectedCenter] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  
  // وظيفة التسجيل في الدورة
  const enrollCourse = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiRequest('POST', `/api/courses/${courseId}/register`);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'فشل التسجيل في الدورة';
        
        try {
          // محاولة تحليل النص كـ JSON
          const errorObj = JSON.parse(errorText);
          if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } catch (e) {
          // إذا فشل التحليل، استخدم النص كما هو
          console.error('غير قادر على تحليل رد الخطأ:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم تسجيلك في الدورة بنجاح',
        variant: 'default',
      });
      // تحديث بيانات التسجيل
      queryClient.invalidateQueries({ queryKey: ['/api/courses/enrollment-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student/dashboard'] });
      setEnrollingCourseId(null);
    },
    onError: (error) => {
      toast({
        title: 'فشل التسجيل',
        description: error.message,
        variant: 'destructive',
      });
      setEnrollingCourseId(null);
    },
  });

  // معالج التسجيل
  const handleEnrollment = (courseId: number) => {
    if (!user) {
      toast({
        title: 'تنبيه',
        description: 'يجب تسجيل الدخول أولاً للتسجيل في الدورة',
        variant: 'destructive',
      });
      return;
    }
    
    if (user.role !== UserRole.STUDENT) {
      toast({
        title: 'تنبيه',
        description: 'التسجيل متاح فقط للطلاب',
        variant: 'destructive',
      });
      return;
    }
    
    setEnrollingCourseId(courseId);
    enrollCourse.mutate(courseId);
  };

  // Fetch approved training centers
  const { data: centers = [], isLoading: centersLoading } = useQuery<TrainingCenter[]>({
    queryKey: ["/api/training-centers/approved"],
    queryFn: async () => {
      console.log('Fetching approved centers...');
      const response = await apiRequest("GET", "/api/training-centers/approved");
      if (!response.ok) {
        throw new Error('فشل في جلب مراكز التدريب');
      }
      const data = await response.json();
      console.log('Retrieved centers:', data);
      return data;
    }
  });

  // Fetch all courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      console.log('Fetching courses...');
      const response = await apiRequest("GET", "/api/courses");
      if (!response.ok) {
        throw new Error('فشل في جلب الدورات');
      }
      const data = await response.json();
      console.log('Retrieved courses:', data);
      return data;
    }
  });

  // Get unique regions
  const regions = React.useMemo(() => {
    const uniqueRegions = Array.from(new Set(centers.map(center => center.region)));
    return uniqueRegions.filter(Boolean).sort();
  }, [centers]);

  // Filter centers based on selected region
  const filteredCenters = React.useMemo(() => {
    return centers.filter(center => 
      selectedRegion === "all" || center.region === selectedRegion
    );
  }, [centers, selectedRegion]);

  // الحصول على كل حالات الدورات الفريدة الموجودة في البيانات
  const courseStatuses = React.useMemo(() => {
    const statusSet = new Set(courses.map(course => course.status));
    return Array.from(statusSet).filter(Boolean).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = React.useMemo(() => {
    console.log('Filtering courses with:', {
      selectedRegion,
      selectedCenter,
      selectedStatus,
      searchQuery,
      coursesCount: courses.length,
      centersCount: centers.length
    });

    return courses.filter((course) => {
      const center = centers.find((c) => c.id === course.training_center_id);
      if (!center) {
        console.log('No center found for course:', course.id);
        return false;
      }

      const matchesRegion = selectedRegion === "all" || center.region === selectedRegion;
      const matchesCenter = selectedCenter === "all" || course.training_center_id.toString() === selectedCenter;
      const matchesStatus = selectedStatus === "all" || course.status === selectedStatus;
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRegion && matchesCenter && matchesStatus && matchesSearch;
    });
  }, [courses, centers, selectedRegion, selectedCenter, selectedStatus, searchQuery]);

  // استعلام لجلب حالة التسجيل للدورات
  const { data: enrollmentStatus = {}, isLoading: isEnrollmentStatusLoading } = useQuery<Record<number, boolean>>({
    queryKey: ["/api/courses/enrollment-status"],
    queryFn: async () => {
      try {
        const courseIds = courses.map(course => course.id);
        if (courseIds.length === 0) return {};
        
        console.log('Sending enrollment check request for course IDs:', courseIds);
        
        const response = await apiRequest("POST", "/api/courses/check-enrollments", { 
          courseIds 
        });
        
        if (!response.ok) {
          console.error('Enrollment status API returned error:', response.status);
          return {};
        }
        
        const result = await response.json();
        console.log('Enrollment status received from API:', result);
        return result;
      } catch (error) {
        console.error("Error checking enrollment status:", error);
        return {};
      }
    },
    enabled: courses.length > 0 && !!user,
  });

  useEffect(() => {
    console.log('Current state:', {
      courses: courses.length,
      centers: centers.length,
      filteredCourses: filteredCourses.length,
      selectedRegion,
      selectedCenter
    });
  }, [courses, centers, filteredCourses, selectedRegion, selectedCenter]);

  if (coursesLoading || centersLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          جاري التحميل...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <h1 className="text-3xl font-bold mb-8">الدورات التدريبية المتاحة</h1>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Select 
            value={selectedRegion} 
            onValueChange={(value) => {
              setSelectedRegion(value);
              setSelectedCenter("all"); // Reset center when region changes
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المناطق</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger>
              <SelectValue placeholder="اختر مركز التدريب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المراكز</SelectItem>
              {filteredCenters.map((center) => (
                <SelectItem key={center.id} value={center.id.toString()}>
                  {center.centerName || center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الدورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {courseStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="ابحث عن دورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const center = centers.find((c) => c.id === course.training_center_id);

              return (
                <Card key={course.id} className="bg-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{course.title}</CardTitle>
                      {/* تحويل حالة الدورة إلى CourseStatusType المناسب */}
                      {Object.values(CourseStatus).includes(course.status as any) 
                        ? <CourseStatusIndicator status={course.status as CourseStatusType} />
                        : null
                      }
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>المركز: {center?.centerName || center?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{course.duration} ساعة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.capacity} متدرب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {typeof course.start_date === 'string' && course.start_date
                            ? format(new Date(course.start_date), 'dd MMMM yyyy', { locale: ar })
                            : 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{center?.region}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    {/* زر تفاصيل الدورة */}
                    <Link href={`/student/courses/${course.id}`} className="w-full">
                      <Button 
                        className="w-full flex items-center justify-center gap-2" 
                        variant="outline"
                      >
                        <Info className="h-4 w-4" />
                        <span>تفاصيل الدورة</span>
                      </Button>
                    </Link>

                    {/* عرض حالة التسجيل أو زر التسجيل */}
                    {enrollmentStatus[course.id] ? (
                      <div className="w-full bg-green-50 border border-green-200 p-3 rounded-lg flex items-center justify-center gap-2 text-green-600 font-semibold">
                        <Check className="h-5 w-5" />
                        <span>تم التسجيل في هذه الدورة</span>
                      </div>
                    ) : course.status === 'مجدولة' ? (
                      <Button 
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white" 
                        onClick={() => handleEnrollment(course.id)}
                        disabled={enrollCourse.isPending}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>{enrollCourse.isPending && course.id === enrollingCourseId ? 'جاري التسجيل...' : 'التسجيل في الدورة'}</span>
                      </Button>
                    ) : (
                      <div className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-center gap-2 text-gray-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>التسجيل غير متاح حالياً</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              لا توجد دورات متاحة تطابق معايير البحث
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}