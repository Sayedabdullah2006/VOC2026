import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Building2, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Course, UserRole } from '@shared/schema';
import { Badge } from '@/components/ui/badge';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const statusColors = {
  'قيد التسجيل': 'bg-[#0C7D99]/10 text-[#0C7D99]',
  'مكتملة التسجيل': 'bg-[#00A896]/10 text-[#00A896]',
  'قيد التنفيذ': 'bg-[#028090]/10 text-[#028090]',
  'جارية': 'bg-[#028090]/10 text-[#028090]',
  'معلقة': 'bg-[#05668D]/10 text-[#05668D]',
  'منتهية': 'bg-gray-100 text-gray-800',
  'ملغاة': 'bg-red-100 text-red-800',
  'مجدولة': 'bg-[#00A896]/10 text-[#00A896]'
} as const;

interface TrainingCenter {
  id: number;
  name: string;
  region: string;
  city: string;
  location: string;
}

export const LatestCourses = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // استرجاع المراكز المعتمدة
  const { data: centers = [] } = useQuery<TrainingCenter[]>({
    queryKey: ["/api/training-centers/approved"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/training-centers/approved");
      return response.json();
    }
  });

  // استرجاع أحدث الدورات مع عدد المسجلين
  const { data: latestCourses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/latest"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses/latest");
      return response.json();
    }
  });

  // استرجاع عدد المسجلين في كل دورة
  const { data: enrollmentCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/courses/enrollments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/courses/enrollments");
      return response.json();
    },
    enabled: latestCourses.length > 0
  });

  const handleCourseClick = (courseId: number) => {
    if (!user) {
      setLocation('/auth');
    } else if (user.role === UserRole.STUDENT) {
      setLocation(`/courses/${courseId}`);
    } else {
      alert('يجب تسجيل الدخول كمتدرب للوصول إلى الدورات');
    }
  };

  if (isLoading || latestCourses.length === 0) {
    return null;
  }

  return (
    <section className="bg-white relative z-10">
      <div className="container mx-auto px-4 pt-8 pb-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-[#0C7D99]/10 text-[#0C7D99] font-medium mb-4">الدورات</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">آخر الدورات المضافة</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            تصفح أحدث الدورات التدريبية المضافة من مراكز التدريب المعتمدة
          </p>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="!pb-12"
        >
          {latestCourses.map((course) => {
            const center = centers.find((c) => c.id === course.training_center_id);
            const enrollmentCount = enrollmentCounts[course.id] || 0;

            return (
              <SwiperSlide key={course.id}>
                <Card 
                  className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="h-2 gradient-primary w-full"></div>
                  <CardHeader className="pb-3 pt-6">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2 text-[#05668D]">{course.title}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[course.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {course.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {center && (
                        <>
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-4 h-4 ml-2 text-[#0C7D99]" />
                            <span className="text-sm line-clamp-1 font-medium">{center.name}</span>
                          </div>
                          {center.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 ml-2 text-[#0C7D99]" />
                              <span className="text-sm">{center.location}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 ml-2 text-[#0C7D99]" />
                        <span className="text-sm">
                          {format(new Date(course.start_date), 'dd MMMM yyyy', { locale: ar })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 ml-2 text-[#0C7D99]" />
                        <span className="text-sm" dir="ltr">
                          {enrollmentCount} / {course.capacity} متدرب
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full gradient-primary hover:opacity-90 text-white transition-all shadow-sm mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course.id);
                          }}
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};