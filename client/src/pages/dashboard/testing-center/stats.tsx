import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  ChartPie,
  Users,
  CalendarCheck,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// تعريف بنية بيانات إحصائيات مركز الاختبار
interface TestCenterStats {
  totalExams: number;
  totalCandidates: number;
  activeExams: number;
  completedExams: number;
  successRate: number;
  averageScore: number;
  examTypeStats: {
    type: string;
    count: number;
  }[];
  resultDistribution: {
    passed: number;
    failed: number;
  };
  examTrends: {
    week: string;
    examCount: number;
    passRate: number;
  }[];
  topExamCategories: {
    category: string;
    count: number;
  }[];
  upcomingExams: number;
  occupancyRate: number;
  averageWaitTime: number;
  candidateStats: {
    male: number;
    female: number;
    age18to25: number;
    age26to40: number;
    age41plus: number;
  };
  peakTimes: {
    day: string;
    hour: string;
  }[];
  centerStatus: string;
  lastUpdated: string;
}

// الإحصائيات الافتراضية في حالة عدم وجود بيانات
const defaultStats: TestCenterStats = {
  totalExams: 0,
  totalCandidates: 0,
  activeExams: 0,
  completedExams: 0,
  successRate: 0,
  averageScore: 0,
  examTypeStats: [],
  resultDistribution: {
    passed: 0,
    failed: 0
  },
  examTrends: [],
  topExamCategories: [],
  upcomingExams: 0,
  occupancyRate: 0,
  averageWaitTime: 0,
  candidateStats: {
    male: 0,
    female: 0,
    age18to25: 0,
    age26to40: 0,
    age41plus: 0
  },
  peakTimes: [],
  centerStatus: "غير معروف",
  lastUpdated: new Date().toISOString()
};

export default function TestingCenterStatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<boolean>(false);
  const [manuallyFetching, setManuallyFetching] = useState<boolean>(false);
  
  // استخدام useQuery لجلب البيانات الحقيقية من API
  const { 
    data: stats = defaultStats, 
    isLoading, 
    error, 
    isError,
    refetch,
    isRefetching,
    isRefetchError 
  } = useQuery<TestCenterStats>({
    queryKey: ['/api/testing-centers/stats'],
    enabled: !!user?.id && !authError,
    placeholderData: defaultStats,
    retry: 1,
    onError: (err: any) => {
      console.error("Error fetching stats:", err);
      // التحقق إذا كان الخطأ متعلق بالمصادقة
      if (err.status === 401 || err.message?.includes("unauthorized") || err.message?.includes("401")) {
        console.log("Authentication error, disabling further requests");
        setAuthError(true);
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الخروج وإعادة تسجيل الدخول مرة أخرى",
          variant: "destructive"
        });
      }
    }
  });
  
  // وظيفة للحصول على البيانات يدوياً
  const fetchStatsManually = async () => {
    setManuallyFetching(true);
    try {
      const response = await apiRequest("/api/testing-centers/stats", {
        method: "GET",
        credentials: "include", // لضمان إرسال البيانات المرتبطة بالجلسة
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "تم تحديث البيانات",
          description: "تم تحديث إحصائيات مركز الاختبار بنجاح",
        });
        setAuthError(false);
        refetch(); // إعادة تحميل البيانات بواسطة useQuery
      } else {
        // التعامل مع أخطاء الاستجابة
        if (response.status === 401) {
          setAuthError(true);
          toast({
            title: "خطأ في المصادقة",
            description: "الرجاء تسجيل الخروج وإعادة تسجيل الدخول",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في تحميل البيانات",
            description: `حدث خطأ (${response.status}). الرجاء المحاولة مرة أخرى لاحقاً.`,
            variant: "destructive"
          });
        }
      }
    } catch (err) {
      console.error("Manual fetch error:", err);
      toast({
        title: "فشل في الاتصال",
        description: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك.",
        variant: "destructive"
      });
    } finally {
      setManuallyFetching(false);
    }
  };

  // عرض حالة التحميل
  if (isLoading || isRefetching || manuallyFetching) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg">جاري تحميل الإحصائيات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // عرض رسالة الخطأ في حالة حدوث خطأ
  if ((isError || isRefetchError || authError) && !manuallyFetching) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>حدث خطأ أثناء تحميل الإحصائيات</AlertTitle>
            <AlertDescription>
              {authError ? "خطأ في المصادقة. يرجى تسجيل الخروج وإعادة تسجيل الدخول." : 
                error instanceof Error ? error.message : "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-4 mb-6">
            <Button 
              onClick={fetchStatsManually}
              variant="default"
              className="flex items-center gap-2"
              disabled={manuallyFetching}
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              تحديث الصفحة بالكامل
            </Button>
          </div>
          
          {/* عرض بيانات افتراضية للواجهة في حالة الخطأ */}
          <div className="opacity-60">
            <StatsDisplay stats={defaultStats} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChartPie className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">إحصائيات مركز الاختبار</h1>
              <p className="text-gray-600">
                نظرة عامة على أداء المركز والإحصائيات المهمة
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
        
        <StatsDisplay stats={stats} />
        
        {/* ملاحظة توضيحية */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>* الإحصائيات تعكس البيانات المسجلة في النظام وتُحدث بشكل دوري.</p>
          <p>* آخر تحديث: {new Date(stats.lastUpdated).toLocaleString('ar-SA')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// مكون فرعي للإحصائيات
function StatsDisplay({ stats }: { stats: TestCenterStats }) {
  // تحويل بيانات أنواع الامتحانات إلى تنسيق مناسب للرسم البياني الدائري
  const examTypeData = stats.examTypeStats.length > 0 
    ? stats.examTypeStats.map(item => ({
        name: item.type,
        value: item.count
      }))
    : [{ name: 'لا توجد بيانات', value: 1 }];

  const resultDistributionData = [
    { name: 'ناجح', value: stats.resultDistribution.passed },
    { name: 'راسب', value: stats.resultDistribution.failed }
  ];

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#8884d8"];
  const RESULT_COLORS = ["#4CAF50", "#FF5252"];

  return (
    <>
      {/* البطاقات الإحصائية الرئيسية */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المرشحين
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              مرشح مسجل في النظام
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              اختبارات نشطة
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeExams}</div>
            <p className="text-xs text-muted-foreground">
              اختبارات نشطة حالياً
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              اختبارات منتهية
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedExams}</div>
            <p className="text-xs text-muted-foreground">
              اختبارات تم إكمالها
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              نسبة النجاح
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}٪</div>
            <p className="text-xs text-muted-foreground">
              معدل النجاح في الاختبارات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الرسومات البيانية */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="status">أنواع الاختبارات</TabsTrigger>
          <TabsTrigger value="results">نتائج الاختبارات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الاختبارات حسب النوع</CardTitle>
              <CardDescription>
                عرض إحصائي لأنواع الاختبارات في المركز
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stats.examTypeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={examTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {examTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">لا توجد بيانات متاحة</p>
                    <p className="text-sm text-gray-400">سيتم عرض بيانات أنواع الاختبارات بمجرد توفرها</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع نتائج الاختبارات</CardTitle>
              <CardDescription>
                عرض إحصائي لنتائج الاختبارات (ناجح/راسب)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stats.resultDistribution.passed > 0 || stats.resultDistribution.failed > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resultDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resultDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RESULT_COLORS[index % RESULT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">لا توجد بيانات متاحة</p>
                    <p className="text-sm text-gray-400">سيتم عرض بيانات نتائج الاختبارات بمجرد توفرها</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات الاختبارات الأسبوعية</CardTitle>
              <CardDescription>
                عرض بياني لنتائج الاختبارات خلال الأسابيع الماضية
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stats.examTrends && stats.examTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.examTrends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="عدد الاختبارات" dataKey="examCount" fill="#0088FE" />
                    <Bar name="نسبة النجاح %" dataKey="passRate" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full border border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">لا توجد بيانات متاحة</p>
                    <p className="text-sm text-gray-400">سيتم عرض اتجاهات الاختبارات بمجرد توفرها</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}