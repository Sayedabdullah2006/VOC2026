import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission, UserRole } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  path: string;
  permission?: Permission;
  requiredRole?: UserRole | UserRole[];
  component?: () => React.JSX.Element;
  children?: React.ReactNode;
  requireActiveStatus?: boolean;
}

export function ProtectedRoute({
  path,
  permission,
  requiredRole,
  component: Component,
  children,
  requireActiveStatus = true,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { hasPermission } = usePermissions();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription className="text-right">
              يجب تسجيل الدخول للوصول إلى هذه الخدمة.
              {requiredRole && (
                <span>
                  {" "}يجب أن يكون نوع المستخدم{" "}
                  {Array.isArray(requiredRole) 
                    ? requiredRole.map(role => 
                        role === UserRole.TRAINING_CENTER ? "مركز تدريب" :
                        role === UserRole.TESTING_CENTER ? "مركز اختبار" :
                        role === UserRole.STUDENT ? "متدرب" :
                        role === UserRole.SUPER_ADMIN ? "موظف شامل" : ""
                      ).join(" أو ")
                    : requiredRole === UserRole.TRAINING_CENTER ? "مركز تدريب" :
                      requiredRole === UserRole.TESTING_CENTER ? "مركز اختبار" :
                      requiredRole === UserRole.STUDENT ? "متدرب" :
                      requiredRole === UserRole.SUPER_ADMIN ? "موظف شامل" : ""
                  }
                </span>
              )}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={() => window.location.href = requiredRole === UserRole.SUPER_ADMIN ? "/super-admin/auth" : "/auth"}>
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </Route>
    );
  }

  // Check if user has required role
  const hasRequiredRole = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole.includes(user.role as UserRole) || user.role === UserRole.SUPER_ADMIN
      : user.role === requiredRole || user.role === UserRole.SUPER_ADMIN
    : true;

  if (!hasRequiredRole) {
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription className="text-right">
              عذراً، هذه الخدمة متاحة فقط للمستخدمين من نوع{" "}
              {Array.isArray(requiredRole) 
                ? requiredRole.map(role => 
                    role === UserRole.TRAINING_CENTER ? "مركز تدريب" :
                    role === UserRole.TESTING_CENTER ? "مركز اختبار" :
                    role === UserRole.STUDENT ? "متدرب" :
                    role === UserRole.SUPER_ADMIN ? "موظف شامل" : ""
                  ).join(" أو ")
                : requiredRole === UserRole.TRAINING_CENTER ? "مركز تدريب" :
                  requiredRole === UserRole.TESTING_CENTER ? "مركز اختبار" :
                  requiredRole === UserRole.STUDENT ? "متدرب" :
                  requiredRole === UserRole.SUPER_ADMIN ? "موظف شامل" : ""
              }
            </AlertDescription>
          </Alert>
        </div>
      </Route>
    );
  }

  // إضافة طباعة تشخيصية لمعرفة حالة المستخدم - فقط في وضع التطوير
  if (process.env.NODE_ENV === 'development' && path.includes('/testing-center/exams')) {
    console.log('ProtectedRoute: User status check -', {
      user,
      path,
      requireActiveStatus,
      status: user?.status,
      isStatusActive: user?.status === 'active'
    });
  }

  if (requireActiveStatus && user.status !== 'active') {
    console.log(`ProtectedRoute: User ${user.username} (ID: ${user.id}) has non-active status: "${user.status}"`);
    
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription className="text-right">
              <div className="space-y-2">
                <p className="font-semibold text-lg">حسابك غير مفعل حالياً</p>
                <p>حالة حسابك: {" "}
                  <span className="font-medium">
                    {user.status === 'pending' ? 'قيد المراجعة' : 
                     user.status === 'suspended' ? 'موقوف' : user.status}
                  </span>
                </p>
                {user.status === 'pending' && (
                  <p>يتم حالياً مراجعة طلب التسجيل الخاص بك من قبل الإدارة. سيتم إشعارك عبر البريد الإلكتروني عند تفعيل حسابك.</p>
                )}
                {user.status === 'suspended' && (
                  <p>تم إيقاف حسابك. يرجى التواصل مع الإدارة لمزيد من المعلومات.</p>
                )}
                <p className="mt-2 text-sm text-slate-500">رقم التعريف: {user.id} | نوع الحساب: {user.role}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Route>
    );
  }

  if (permission && !hasPermission(permission)) {
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription className="text-right">
              عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الخدمة
            </AlertDescription>
          </Alert>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {Component ? <Component /> : children}
    </Route>
  );
}