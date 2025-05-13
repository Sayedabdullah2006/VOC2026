import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Info, MapPin, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Exam {
  id: number;
  title: string;
  description: string;
  examType: string;
  examDate: string;
  location: string;
  capacity: number;
  registeredCandidates: number;
  price: number;
  testingCenterId: number;
  testingCenterName: string;
  status: string;
  isVisible: boolean;
  isRegistered: boolean;
  registrationId: number | null;
}

export default function StudentExamsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isRegistering, setIsRegistering] = useState<number | null>(null);
  const [isUnregistering, setIsUnregistering] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // استعلام للحصول على قائمة الاختبارات المتاحة
  const { data: availableExams, isLoading: isLoadingAvailable, error: availableError, refetch: refetchAvailable } = useQuery({
    queryKey: ['/api/exams/available'],
  });
  
  // استعلام للحصول على قائمة الاختبارات المسجل فيها
  const { data: registeredExams, isLoading: isLoadingRegistered, error: registeredError, refetch: refetchRegistered } = useQuery({
    queryKey: ['/api/student/registered-exams'],
  });
  
  // تحديد ما إذا كانت هناك أية عملية تحميل
  const isLoading = isLoadingAvailable || isLoadingRegistered;
  
  // تحديد ما إذا كان هناك أي خطأ
  const error = availableError || registeredError;

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });
  
  // دمج البيانات وحذف التكرار
  const exams = useMemo(() => {
    if (!availableExams) return [];
    
    // نبدأ بقائمة الاختبارات المتاحة
    const combinedExams = [...availableExams];
    
    // إذا كانت هناك اختبارات مسجلة، نقوم بتحديث حالة التسجيل للاختبارات المتاحة
    if (registeredExams && Array.isArray(registeredExams)) {
      // للاختبارات المتاحة، نتحقق مما إذا كان المستخدم قد سجل فيها
      for (const exam of combinedExams) {
        const registeredExam = registeredExams.find(regExam => regExam.id === exam.id);
        if (registeredExam) {
          exam.isRegistered = true;
          exam.registrationId = registeredExam.registrationId;
        }
      }
      
      // أضف أي اختبارات مسجلة غير موجودة في القائمة المتاحة (قد تكون مخفية الآن)
      for (const regExam of registeredExams) {
        const existingExam = combinedExams.find(exam => exam.id === regExam.id);
        if (!existingExam) {
          combinedExams.push(regExam);
        }
      }
    }
    
    return combinedExams;
  }, [availableExams, registeredExams]);
  
  // وظيفة إعادة تحميل البيانات
  const refetch = () => {
    refetchAvailable();
    refetchRegistered();
  };

  // وظيفة للتسجيل في اختبار
  const registerForExam = async (examId: number) => {
    if (!user) {
      toast({
        title: "خطأ في التسجيل",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsRegistering(examId);
      
      // إرسال طلب التسجيل باستخدام fetch مباشرة لتجنب أي مشاكل مع apiRequest
      const response = await fetch('/api/exam-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          studentId: user.id,
          status: 'مسجل'
        })
      });

      if (response.ok) {
        toast({
          title: "تم التسجيل بنجاح",
          description: "تم تسجيلك في الاختبار بنجاح",
        });
        
        // إعادة تحميل بيانات الاختبارات
        refetch();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "حدث خطأ أثناء التسجيل في الاختبار");
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل في الاختبار",
        variant: "destructive",
      });
      console.error("خطأ في التسجيل:", error);
    } finally {
      setIsRegistering(null);
    }
  };

  // وظيفة إلغاء التسجيل من اختبار
  const unregisterFromExam = async (examId: number, registrationId: number) => {
    if (!user) {
      toast({
        title: "خطأ في إلغاء التسجيل",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsUnregistering(examId);
      
      const response = await fetch(`/api/exam-registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        toast({
          title: "تم إلغاء التسجيل بنجاح",
          description: "تم إلغاء تسجيلك في الاختبار بنجاح",
        });
        // إعادة تحميل بيانات الاختبارات
        refetch();
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ في إلغاء التسجيل",
          description: errorData.message || "حدث خطأ أثناء إلغاء التسجيل من الاختبار",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في إلغاء التسجيل:", error);
      toast({
        title: "خطأ في إلغاء التسجيل",
        description: "حدث خطأ أثناء إلغاء التسجيل من الاختبار",
        variant: "destructive",
      });
    } finally {
      setIsUnregistering(null);
    }
  };

  // التحقق من إمكانية التسجيل في الاختبار
  const isExamAvailable = (exam: Exam): boolean => {
    // التحقق من عدم امتلاء الاختبار
    const hasCapacity = exam.registeredCandidates < exam.capacity;
    
    // التحقق من أن تاريخ الاختبار لم يمر بعد
    const examDate = new Date(exam.examDate);
    const today = new Date();
    const isDateValid = examDate > today;
    
    return hasCapacity && isDateValid;
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
      }
      
      return new Intl.DateTimeFormat('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return 'تاريخ غير صالح';
    }
  };

  const ExamsContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
          <p className="text-destructive text-lg">حدث خطأ أثناء تحميل الاختبارات المتاحة</p>
          <Button onClick={() => refetch()}>إعادة المحاولة</Button>
        </div>
      );
    }

    // تصفية الاختبارات بناءً على التبويب النشط
    const filteredExams = useMemo(() => {
      if (!exams || !Array.isArray(exams)) return [];
      
      switch (activeTab) {
        case "all":
          return exams;
        case "available":
          return exams.filter(exam => isExamAvailable(exam) && !exam.isRegistered);
        case "registered":
          return exams.filter(exam => exam.isRegistered);
        default:
          return exams;
      }
    }, [exams, activeTab]);
  
    // رسالة في حالة عدم وجود اختبارات
    const noExamsMessage = {
      all: "لا توجد اختبارات متاحة حالياً",
      available: "لا توجد اختبارات متاحة للتسجيل حالياً",
      registered: "لم تقم بالتسجيل في أي اختبار بعد",
    };
  
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold mb-2">الاختبارات المتاحة</h1>
          <p className="text-muted-foreground">سجل في الاختبارات المهنية لتحصل على الشهادات المعتمدة</p>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">جميع الاختبارات</TabsTrigger>
            <TabsTrigger value="available">متاح للتسجيل</TabsTrigger>
            <TabsTrigger value="registered">مسجل فيها</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam: Exam) => (
                  <Card key={exam.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl mb-1">{exam.title}</CardTitle>
                        <Badge variant={
                          exam.isRegistered ? "success" : 
                          isExamAvailable(exam) ? "default" : "destructive"
                        }>
                          {exam.isRegistered ? "مسجل" : 
                           isExamAvailable(exam) ? "متاح" : 
                           exam.registeredCandidates >= exam.capacity ? "مكتمل" : "غير متاح"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span>{formatDate(exam.examDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span>{exam.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span>المسجلون: {exam.registeredCandidates} / {exam.capacity}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span>نوع الاختبار: {exam.examType}</span>
                        </div>
                        {exam.testingCenterName && (
                          <div className="text-sm text-gray-600">
                            <span>مركز الاختبار: {exam.testingCenterName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {exam.isRegistered ? (
                        <Button 
                          onClick={() => unregisterFromExam(exam.id, exam.registrationId!)}
                          disabled={isUnregistering === exam.id}
                          variant="destructive"
                          className="w-full"
                        >
                          {isUnregistering === exam.id ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري إلغاء التسجيل...
                            </>
                          ) : (
                            "إلغاء التسجيل"
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => registerForExam(exam.id)}
                          disabled={!isExamAvailable(exam) || isRegistering === exam.id}
                          className="w-full"
                        >
                          {isRegistering === exam.id ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري التسجيل...
                            </>
                          ) : !isExamAvailable(exam) ? (
                            exam.registeredCandidates >= exam.capacity ? 
                              "الاختبار مكتمل" :
                              "انتهى موعد التسجيل"
                          ) : (
                            "التسجيل في الاختبار"
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-medium mb-2">{noExamsMessage[activeTab as keyof typeof noExamsMessage]}</h2>
                <p className="text-muted-foreground">يرجى مراجعة الصفحة لاحقاً للاطلاع على الاختبارات الجديدة</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-4">
        <ExamsContent />
      </div>
    </DashboardLayout>
  );
}