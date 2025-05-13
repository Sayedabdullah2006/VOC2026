import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, Clock, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statusColors = {
  "تم تقديم الطلب": "secondary",
  "تحت المراجعة": "warning",
  "مطابقة": "success",
  "غير مطابقة": "destructive",
} as const;

const statusIcons = {
  "تم تقديم الطلب": <Clock className="w-4 h-4 ms-1" />,
  "تحت المراجعة": <Clock className="w-4 h-4 ms-1" />,
  "مطابقة": <Check className="w-4 h-4 ms-1" />,
  "غير مطابقة": <X className="w-4 h-4 ms-1" />,
};

export default function AdminCertificateMatchingPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const queryClient = useQueryClient();

  // Fetch all certificate matching requests
  const { data: matchingRequests, isLoading } = useQuery({
    queryKey: ['/api/certificate-matching'],
    queryFn: async () => {
      const response = await fetch('/api/certificate-matching');
      if (!response.ok) {
        throw new Error("فشل في جلب طلبات مطابقة الشهادات");
      }
      return response.json();
    },
  });

  // Mutation for updating a certificate matching request
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; reviewNotes?: string }) => {
      console.log('Sending update with data:', data);
      return fetch(`/api/certificate-matching/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: data.status,
          comments: data.reviewNotes // Using 'comments' instead of 'reviewNotes' to match the server API
        }),
      }).then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || 'حدث خطأ أثناء تحديث الطلب');
          });
        }
        return response.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificate-matching'] });
      setReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewNotes("");
      setNewStatus("");
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.position = 'fixed';
      successMessage.style.top = '50%';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translate(-50%, -50%)';
      successMessage.style.backgroundColor = 'white';
      successMessage.style.padding = '20px 30px';
      successMessage.style.borderRadius = '8px';
      successMessage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      successMessage.style.zIndex = '9999';
      successMessage.style.textAlign = 'center';
      successMessage.style.direction = 'rtl';
      successMessage.style.minWidth = '300px';
      
      successMessage.innerHTML = `
        <div style="margin-bottom: 15px;">
          <h3 style="color: #1e40af; margin-bottom: 10px; font-size: 18px; font-weight: bold;">منصة التدريب المهني</h3>
          <p style="font-size: 16px; margin: 0;">تم تحديث حالة طلب مطابقة الشهادة بنجاح</p>
        </div>
        <button id="okButton" style="background-color: #1d4ed8; color: white; border: none; border-radius: 4px; padding: 8px 20px; cursor: pointer; font-size: 14px;">موافق</button>
      `;
      
      document.body.appendChild(successMessage);
      
      document.getElementById('okButton')?.addEventListener('click', () => {
        document.body.removeChild(successMessage);
      });
    },
  });

  const handleReviewSubmit = () => {
    if (!selectedRequest || !newStatus) return;
    
    updateMutation.mutate({
      id: selectedRequest.id,
      status: newStatus,
      reviewNotes: reviewNotes,
    });
  };

  const openReviewModal = (request: any) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setReviewNotes(request.reviewNotes || "");
    setReviewModalOpen(true);
  };

  const getStatusCount = (status: string) => {
    if (!matchingRequests) return 0;
    return matchingRequests.filter((req: any) => req.status === status).length;
  };

  return (
    <div className="flex flex-col gap-8 p-6 container mx-auto">
      <DashboardHeader 
        heading="إدارة طلبات مطابقة الشهادات" 
        text="يمكنك هنا مراجعة وإدارة طلبات مطابقة الشهادات المقدمة من المتدربين"
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4 w-full md:w-auto">
          <TabsTrigger value="all">
            الكل 
            <Badge variant="secondary" className="mr-2">
              {matchingRequests?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="new">
            جديدة 
            <Badge variant="secondary" className="mr-2">
              {getStatusCount("تم تقديم الطلب")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewing">
            قيد المراجعة 
            <Badge variant="secondary" className="mr-2">
              {getStatusCount("تحت المراجعة")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="matched">
            مطابقة 
            <Badge variant="secondary" className="mr-2">
              {getStatusCount("مطابقة")}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            غير مطابقة 
            <Badge variant="secondary" className="mr-2">
              {getStatusCount("غير مطابقة")}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* All matching requests */}
        <TabsContent value="all">
          <RequestsList 
            isLoading={isLoading} 
            requests={matchingRequests} 
            onReview={openReviewModal} 
            filter="all" 
          />
        </TabsContent>

        {/* New matching requests */}
        <TabsContent value="new">
          <RequestsList 
            isLoading={isLoading} 
            requests={matchingRequests} 
            onReview={openReviewModal} 
            filter="تم تقديم الطلب" 
          />
        </TabsContent>

        {/* Reviewing matching requests */}
        <TabsContent value="reviewing">
          <RequestsList 
            isLoading={isLoading} 
            requests={matchingRequests} 
            onReview={openReviewModal} 
            filter="تحت المراجعة" 
          />
        </TabsContent>

        {/* Matched matching requests */}
        <TabsContent value="matched">
          <RequestsList 
            isLoading={isLoading} 
            requests={matchingRequests} 
            onReview={openReviewModal} 
            filter="مطابقة" 
          />
        </TabsContent>

        {/* Rejected matching requests */}
        <TabsContent value="rejected">
          <RequestsList 
            isLoading={isLoading} 
            requests={matchingRequests} 
            onReview={openReviewModal} 
            filter="غير مطابقة" 
          />
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>مراجعة طلب مطابقة شهادة</DialogTitle>
            <DialogDescription>
              قم بمراجعة تفاصيل الطلب وتحديث حالته
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">اسم الدورة</Label>
                  <div id="courseName" className="font-medium mt-1">
                    {selectedRequest.courseName}
                  </div>
                </div>
                <div>
                  <Label htmlFor="instituteName">اسم المعهد</Label>
                  <div id="instituteName" className="font-medium mt-1">
                    {selectedRequest.instituteName}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseDate">تاريخ الدورة</Label>
                  <div id="courseDate" className="font-medium mt-1">
                    {format(new Date(selectedRequest.courseDate), "PPP", { locale: ar })}
                  </div>
                </div>
                <div>
                  <Label htmlFor="submissionDate">تاريخ التقديم</Label>
                  <div id="submissionDate" className="font-medium mt-1">
                    {format(new Date(selectedRequest.submissionDate), "PPP", { locale: ar })}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="status">حالة الطلب</Label>
                <Select 
                  value={newStatus} 
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر حالة الطلب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تم تقديم الطلب">تم تقديم الطلب</SelectItem>
                    <SelectItem value="تحت المراجعة">تحت المراجعة</SelectItem>
                    <SelectItem value="مطابقة">مطابقة</SelectItem>
                    <SelectItem value="غير مطابقة">غير مطابقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reviewNotes">ملاحظات المراجعة</Label>
                <Textarea
                  id="reviewNotes"
                  className="mt-1"
                  placeholder="أدخل ملاحظات المراجعة هنا"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div>
                <Label>شهادة المتدرب المرفقة</Label>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/${selectedRequest.certificateFile}`, '_blank')}
                  >
                    عرض الشهادة المرفقة
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row-reverse mt-4">
            <Button 
              type="button" 
              onClick={handleReviewSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setReviewModalOpen(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component for displaying the list of certificate matching requests
interface RequestsListProps {
  isLoading: boolean;
  requests: any[];
  onReview: (request: any) => void;
  filter: string;
}

function RequestsList({ isLoading, requests, onReview, filter }: RequestsListProps) {
  // Filter requests based on the selected filter
  const filteredRequests = requests?.filter(
    (request) => filter === "all" || request.status === filter
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {filter === "all" ? "جميع طلبات المطابقة" : `طلبات المطابقة (${filter})`}
        </CardTitle>
        <CardDescription>
          {filter === "all"
            ? "قائمة بجميع طلبات مطابقة الشهادات المقدمة من المتدربين"
            : `قائمة بطلبات مطابقة الشهادات بحالة "${filter}"`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center p-4">جاري تحميل الطلبات...</p>
        ) : !filteredRequests || filteredRequests.length === 0 ? (
          <p className="text-center p-4 text-muted-foreground">لا توجد طلبات مطابقة {filter !== "all" ? `بحالة "${filter}"` : ""}</p>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4" dir="rtl">
              {/* Sort by submission date (newest first) */}
              {[...filteredRequests]
                .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                .map((request) => (
                <Card key={request.id} className="overflow-hidden text-right">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex flex-row-reverse justify-between items-start">
                      <Badge 
                        variant={statusColors[request.status] || "secondary"}
                        className="ms-0 me-0 flex items-center"
                      >
                        {statusIcons[request.status as keyof typeof statusIcons]}
                        {request.status}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{request.courseName}</CardTitle>
                        <CardDescription>{request.instituteName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <span className="text-muted-foreground">رقم الطلب:</span>{" "}
                          {request.id}
                        </div>
                        <div>
                          <span className="text-muted-foreground">تاريخ الدورة:</span>{" "}
                          {format(new Date(request.courseDate), "PPP", { locale: ar })}
                        </div>
                        <div>
                          <span className="text-muted-foreground">تاريخ التقديم:</span>{" "}
                          {format(new Date(request.submissionDate), "PPP", { locale: ar })}
                        </div>
                        {request.reviewDate && (
                          <div>
                            <span className="text-muted-foreground">تاريخ المراجعة:</span>{" "}
                            {format(new Date(request.reviewDate), "PPP", { locale: ar })}
                          </div>
                        )}
                      </div>
                      
                      {request.reviewNotes && (
                        <div className="mt-2">
                          <span className="text-muted-foreground">ملاحظات المراجعة:</span>{" "}
                          {request.reviewNotes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4 flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/${request.certificateFile}`, '_blank')}
                    >
                      عرض الشهادة المرفقة
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onReview(request)}
                    >
                      مراجعة الطلب
                    </Button>
                    
                    {request.status === "مطابقة" && request.matchedCertificateId && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => window.open(`/student/certificates/view/${request.matchedCertificateId}`, '_blank')}
                      >
                        عرض شهادة المطابقة
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}