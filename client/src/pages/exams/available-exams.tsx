import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Info, MapPin, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
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

export default function AvailableExamsPage() {
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
  
  console.log("بيانات الاختبارات المدمجة:", exams);

  // وظيفة للتسجيل في اختبار
  const registerForExam = async (examId: number) => {
    try {
      setIsRegistering(examId);
      
      // التحقق من بيانات المستخدم الحالي
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) {
        toast({
          title: "خطأ في التسجيل",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      const user = await userResponse.json();
      
      // إرسال طلب التسجيل
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
        toast({
          title: "خطأ في التسجيل",
          description: errorData.message || "حدث خطأ أثناء التسجيل في الاختبار",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء التسجيل في الاختبار",
        variant: "destructive",
      });
      console.error("خطأ في التسجيل:", error);
    } finally {
      setIsRegistering(null);
    }
  };
  
  // وظيفة لإلغاء التسجيل في اختبار
  const unregisterFromExam = async (examId: number) => {
    try {
      setIsUnregistering(examId);
      
      // إرسال طلب إلغاء التسجيل
      const response = await fetch(`/api/exam-registrations/${examId}`, {
        method: 'DELETE',
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
          description: errorData.message || "حدث خطأ أثناء إلغاء التسجيل في الاختبار",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في إلغاء التسجيل",
        description: "حدث خطأ أثناء إلغاء التسجيل في الاختبار",
        variant: "destructive",
      });
      console.error("خطأ في إلغاء التسجيل:", error);
    } finally {
      setIsUnregistering(null);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // تحقق مما إذا كان تاريخ الاختبار قد مر
  const isExamDatePassed = (examDate: string) => {
    const today = new Date();
    const date = new Date(examDate);
    return date <= today;
  };
  
  // الحصول على الاختبارات المسجل فيها
  const getRegisteredExams = () => {
    if (!exams || !Array.isArray(exams)) return [];
    return exams.filter(exam => exam.isRegistered);
  };
  
  // الحصول على الاختبارات المتاحة (غير المسجل فيها)
  const getAvailableExams = () => {
    if (!exams || !Array.isArray(exams)) return [];
    return exams.filter(exam => !exam.isRegistered && !isExamDatePassed(exam.examDate) && exam.registeredCandidates < exam.capacity);
  };
  
  // الحصول على جميع الاختبارات
  const getAllExams = () => {
    if (!exams || !Array.isArray(exams)) return [];
    return exams;
  };
  
  // تحديد قائمة الاختبارات المعروضة حسب التبويب النشط
  const getDisplayedExams = () => {
    switch (activeTab) {
      case "registered":
        return getRegisteredExams();
      case "available":
        return getAvailableExams();
      default:
        return getAllExams();
    }
  };

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
  
  const displayedExams = getDisplayedExams();
  const registeredCount = getRegisteredExams().length;

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">الاختبارات المتاحة</h1>
        <p className="text-muted-foreground mb-6">سجل في الاختبارات المتاحة من مراكز الاختبار المعتمدة</p>
        
        <Tabs defaultValue="all" className="w-full max-w-3xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">جميع الاختبارات</TabsTrigger>
            <TabsTrigger value="available">الاختبارات المتاحة</TabsTrigger>
            <TabsTrigger value="registered" className="relative">
              اختباراتي
              {registeredCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center">
                  {registeredCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {displayedExams.length === 0 && (
              <Alert variant="default" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>لا توجد اختبارات</AlertTitle>
                <AlertDescription>
                  {activeTab === "registered" 
                    ? "لم تقم بالتسجيل في أي اختبارات بعد."
                    : activeTab === "available" 
                      ? "لا توجد اختبارات متاحة حالياً، يرجى المراجعة لاحقاً."
                      : "لا توجد اختبارات متاحة حالياً."}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedExams.map((exam: Exam) => {
                const isDatePassed = isExamDatePassed(exam.examDate);
                const isFull = exam.registeredCandidates >= exam.capacity;
                const isAvailable = !isDatePassed && !isFull;
                
                return (
                  <Card key={exam.id} className={`overflow-hidden ${exam.isRegistered ? 'border-primary border-2' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl mb-1">{exam.title}</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          {exam.isRegistered && (
                            <Badge variant="success" className="mr-1">
                              مسجل
                            </Badge>
                          )}
                          {isDatePassed ? (
                            <Badge variant="destructive">منتهي</Badge>
                          ) : isFull ? (
                            <Badge variant="destructive">مكتمل</Badge>
                          ) : (
                            <Badge variant="default">متاح</Badge>
                          )}
                        </div>
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
                          <div className="flex items-center">
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                            <span>مركز الاختبار: {exam.testingCenterName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {exam.isRegistered ? (
                        <Button 
                          onClick={() => unregisterFromExam(exam.id)}
                          variant="destructive"
                          disabled={isUnregistering === exam.id || isDatePassed}
                          className="w-full"
                        >
                          {isUnregistering === exam.id ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري إلغاء التسجيل...
                            </>
                          ) : isDatePassed ? (
                            "لا يمكن إلغاء التسجيل (انتهى الموعد)"
                          ) : (
                            "إلغاء التسجيل"
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => registerForExam(exam.id)}
                          disabled={!isAvailable || isRegistering === exam.id}
                          className="w-full"
                          variant={isAvailable ? "default" : "outline"}
                        >
                          {isRegistering === exam.id ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري التسجيل...
                            </>
                          ) : isDatePassed ? (
                            "انتهى موعد الاختبار"
                          ) : isFull ? (
                            "مكتمل العدد"
                          ) : (
                            "التسجيل في الاختبار"
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}