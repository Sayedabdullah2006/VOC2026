import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

/**
 * مكون لحماية الصفحات التي تتطلب مركز اختبار معتمد
 * يتحقق من حالة الاعتماد ويعيد توجيه المستخدم إذا لم يكن معتمداً
 */
export function TestingCenterApprovalGuard({ children }: { children: React.ReactNode }) {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function checkApprovalStatus() {
      try {
        // جلب معلومات المستخدم
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          throw new Error("فشل في الحصول على معلومات المستخدم");
        }
        
        const user = await userResponse.json();
        const userId = user.id;
        
        // استخدام المسار الجديد والمحسن لجلب طلبات مراكز الاختبار
        const response = await fetch(`/api/testing-centers/applications`);
        if (!response.ok) {
          throw new Error("فشل في الحصول على طلبات الاعتماد");
        }
        
        const applications = await response.json();
        console.log("طلبات مركز الاختبار:", applications);
        
        // التحقق من وجود طلب معتمد: يجب أن تكون حالة الطلب "مقبول" فقط
        const approvedApplication = applications.find((app: any) => 
          app.type === "testing_center" && app.status === "مقبول"
        );
        
        if (approvedApplication) {
          console.log("تم العثور على طلب معتمد لمركز الاختبار");
          setApplicationId(approvedApplication.id);
          setApplicationStatus(approvedApplication.status);
          setIsApproved(true);
        } else if (applications.length > 0) {
          // إذا كان هناك طلب ولكنه غير معتمد، احفظ حالته
          const testingCenterApp = applications.find((app: any) => app.type === "testing_center");
          if (testingCenterApp) {
            console.log("تم العثور على طلب غير معتمد لمركز الاختبار:", testingCenterApp.status);
            setApplicationId(testingCenterApp.id);
            setApplicationStatus(testingCenterApp.status);
            setIsApproved(false);
          } else {
            // لا يوجد طلب اعتماد على الإطلاق
            setIsApproved(false);
          }
        } else {
          // لا يوجد طلبات على الإطلاق
          setIsApproved(false);
        }
      } catch (error) {
        console.error("خطأ في التحقق من حالة الاعتماد:", error);
        setIsApproved(false);
      }
    }
    
    checkApprovalStatus();
  }, []);

  // عرض حالة التحميل
  if (isApproved === null) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري التحقق من حالة الاعتماد...</span>
        </div>
      </DashboardLayout>
    );
  }

  // إذا كان المركز معتمداً، عرض المحتوى
  if (isApproved) {
    return <>{children}</>;
  }

  // إذا لم يكن معتمداً، عرض رسالة وإعادة التوجيه
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium">غير مصرح بالوصول</h3>
          </div>
          <p className="mt-2">
            لا يمكنك الوصول إلى هذه الصفحة. يجب أن يكون طلب اعتماد مركز الاختبار الخاص بك معتمداً أولاً.
          </p>
          
          {applicationStatus && (
            <p className="mt-2">
              حالة طلبك الحالية: <strong>{applicationStatus}</strong>
            </p>
          )}
          
          <p className="mt-2">
            {!applicationId 
              ? "لم يتم العثور على طلب اعتماد. يرجى تقديم طلب اعتماد أولاً."
              : "يرجى الانتظار حتى تتم مراجعة واعتماد طلبك."}
          </p>
          
          <div className="mt-4 space-x-2 space-x-reverse">
            {applicationId ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/TestingCenter/applications/${applicationId}`)}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                عرض تفاصيل الطلب
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate("/TestingCenter/register")}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                تقديم طلب اعتماد
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/TestingCenter/applications")}
              className="mr-2"
            >
              جميع الطلبات
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/TestingCenter/dashboard")}
              className="mr-2"
            >
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}