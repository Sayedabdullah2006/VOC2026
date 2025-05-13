import React, { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ar } from "date-fns/locale";

const ExamsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCenter, setSelectedCenter] = useState<string>();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const testingCenters = [
    { id: 1, name: "مركز اختبارات الرياض" },
    { id: 2, name: "مركز اختبارات جدة" },
    { id: 3, name: "مركز اختبارات الدمام" },
  ];

  const exams = [
    {
      id: 1,
      title: "اختبار القيادة المهنية للشاحنات",
      date: "١٥ فبراير ٢٠٢٤",
      time: "١٠:٠٠ صباحاً",
      duration: "ساعتان",
      status: "scheduled",
      score: null,
      location: "مركز الاختبارات - الرياض"
    },
    {
      id: 2,
      title: "اختبار السلامة على الطرق",
      date: "١٠ فبراير ٢٠٢٤",
      time: "٩:٠٠ صباحاً",
      duration: "ساعة ونصف",
      status: "completed",
      score: 85,
      location: "مركز الاختبارات - الرياض"
    }
  ];

  const handleBookExam = (event: React.FormEvent) => {
    event.preventDefault();
    // هنا سيتم إرسال بيانات الحجز إلى الخادم
    console.log({
      date: selectedDate,
      center: selectedCenter,
    });
    setBookingDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">
            <CalendarIcon className="h-4 w-4" />
            <span>مجدول</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>مكتمل</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>غير مجتاز</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الاختبارات</h1>
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button>حجز موعد اختبار</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>حجز موعد اختبار جديد</DialogTitle>
                <DialogDescription>
                  اختر المركز والموعد المناسب لإجراء الاختبار
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookExam} className="space-y-4">
                <div className="space-y-2">
                  <Label>مركز الاختبار</Label>
                  <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مركز الاختبار" />
                    </SelectTrigger>
                    <SelectContent>
                      {testingCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id.toString()}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الاختبار</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ar}
                    className="rounded-md border"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={!selectedDate || !selectedCenter}>
                    تأكيد الحجز
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{exam.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {exam.location}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(exam.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">المدة: {exam.duration}</span>
                  </div>
                </div>
                {exam.score !== null && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">النتيجة:</span>
                      <span className={cn(
                        "font-bold",
                        exam.score >= 70 ? "text-green-600" : "text-red-600"
                      )}>
                        {exam.score}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamsPage;