import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowRight, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Candidate {
  id: number;
  student_id: number;
  exam_id: number;
  registration_date: string;
  status: string;
  result: string | null;
  student_name: string;
  student_email: string;
  student_phone: string;
  notes: string | null;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  exam_type: string;
  exam_date: string;
  location: string;
  capacity: number;
  registered_candidates: number;
  is_visible: boolean;
  testing_center_id: number;
  status: string;
}

export default function ExamCandidatesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [examId, setExamId] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // استخراج معرف الاختبار من URL
  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/')[3]; // /TestingCenter/exams/1/candidates
    if (id) {
      setExamId(id);
    }
  }, []);
  
  // جلب بيانات الاختبار والمرشحين
  useEffect(() => {
    async function fetchData() {
      if (!examId) return;
      
      setIsLoading(true);
      try {
        // جلب بيانات الاختبار
        const examResponse = await fetch(`/api/exams/${examId}`);
        
        if (!examResponse.ok) {
          throw new Error("فشل في استرجاع بيانات الاختبار");
        }
        
        const examData = await examResponse.json();
        setExam(examData);
        
        // جلب بيانات المرشحين
        const candidatesResponse = await fetch(`/api/exams/${examId}/candidates`);
        
        if (!candidatesResponse.ok) {
          throw new Error("فشل في استرجاع بيانات المرشحين");
        }
        
        const candidatesData = await candidatesResponse.json();
        setCandidates(candidatesData);
        
      } catch (error) {
        console.error("خطأ في استرجاع البيانات:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء استرجاع بيانات الاختبار والمرشحين",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [examId, toast]);
  
  // تقديم تقييم المرشح
  const submitEvaluation = async () => {
    if (!selectedCandidate || !result) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/exam-registrations/${selectedCandidate.id}/evaluate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
          notes: notes || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("فشل في تحديث نتيجة المرشح");
      }
      
      // تحديث البيانات محلياً
      setCandidates(candidates.map(c => 
        c.id === selectedCandidate.id 
          ? { ...c, result, notes: notes || null } 
          : c
      ));
      
      toast({
        title: "تم تحديث النتيجة بنجاح",
        description: "تم تسجيل نتيجة المرشح بنجاح",
      });
      
      // إغلاق الحوار وإعادة تعيين القيم
      setIsDialogOpen(false);
      setSelectedCandidate(null);
      setResult(null);
      setNotes("");
      
    } catch (error) {
      console.error("خطأ في تحديث نتيجة المرشح:", error);
      toast({
        title: "خطأ في تحديث النتيجة",
        description: "حدث خطأ أثناء تسجيل نتيجة المرشح",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return "تاريخ غير صالح";
      }
      
      // تنسيق التاريخ 
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return new Intl.DateTimeFormat('ar', options).format(date);
    } catch (error) {
      console.error("خطأ في تنسيق التاريخ:", error);
      return "تاريخ غير صالح";
    }
  };
  
  // تصدير البيانات كملف CSV
  const exportToCSV = () => {
    if (!candidates.length) return;
    
    // تجهيز ترويسة الملف
    const headers = [
      "اسم المرشح", 
      "البريد الإلكتروني", 
      "رقم الهاتف", 
      "تاريخ التسجيل", 
      "النتيجة", 
      "ملاحظات"
    ];
    
    // تحويل البيانات إلى تنسيق CSV
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    candidates.forEach(candidate => {
      const row = [
        `"${candidate.student_name}"`,
        `"${candidate.student_email}"`,
        `"${candidate.student_phone}"`,
        `"${formatDate(candidate.registration_date)}"`,
        `"${candidate.result || 'غير محدد'}"`,
        `"${candidate.notes || ''}"`,
      ];
      csvRows.push(row.join(','));
    });
    
    // إنشاء الملف وتحميله
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `مرشحو-الاختبار-${examId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">المرشحون للاختبار</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/TestingCenter/exams")}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى قائمة الاختبارات
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {exam && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle>{exam.title}</CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">تاريخ الاختبار</p>
                        <p className="text-sm text-muted-foreground">{formatDate(exam.exam_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exam.status === "مجدولة" ? "outline" : exam.status === "قيد التنفيذ" ? "default" : "secondary"}>
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">المسجلون</p>
                        <p className="text-sm">{exam.registered_candidates} / {exam.capacity}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!candidates.length}>
                        <Download className="h-4 w-4 ml-2" />
                        تصدير البيانات
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>قائمة المرشحين</CardTitle>
                <CardDescription>
                  عرض وإدارة المرشحين المسجلين في الاختبار
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المرشح</TableHead>
                        <TableHead>معلومات التواصل</TableHead>
                        <TableHead>تاريخ التسجيل</TableHead>
                        <TableHead>النتيجة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map(candidate => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">{candidate.student_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{candidate.student_email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.student_phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(candidate.registration_date)}</TableCell>
                          <TableCell>
                            {candidate.result ? (
                              <Badge variant={candidate.result === "ناجح" ? "success" : "destructive"}>
                                {candidate.result === "ناجح" ? (
                                  <CheckCircle2 className="h-3 w-3 ml-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 ml-1" />
                                )}
                                {candidate.result}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="h-3 w-3 ml-1" />
                                غير محدد
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Dialog open={isDialogOpen && selectedCandidate?.id === candidate.id} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setResult(candidate.result);
                                    setNotes(candidate.notes || "");
                                  }}
                                >
                                  تقييم
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تقييم المرشح</DialogTitle>
                                  <DialogDescription>
                                    تسجيل نتيجة المرشح {candidate.student_name} في الاختبار
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4">
                                  <RadioGroup 
                                    value={result || ""} 
                                    onValueChange={setResult}
                                    className="flex flex-col space-y-2"
                                  >
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <RadioGroupItem value="ناجح" id="pass" />
                                      <Label htmlFor="pass" className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ناجح
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <RadioGroupItem value="راسب" id="fail" />
                                      <Label htmlFor="fail" className="flex items-center gap-1">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        راسب
                                      </Label>
                                    </div>
                                  </RadioGroup>

                                  <div className="mt-4">
                                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                                    <Textarea
                                      id="notes"
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="أضف ملاحظات حول أداء المرشح..."
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    إلغاء
                                  </Button>
                                  <Button 
                                    onClick={submitEvaluation} 
                                    disabled={isSubmitting || !result}
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                        جاري الحفظ...
                                      </>
                                    ) : (
                                      "حفظ النتيجة"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">لا يوجد مرشحون بعد</h3>
                    <p className="text-muted-foreground mt-1">
                      لم يتم تسجيل أي مرشحين لهذا الاختبار حتى الآن
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}