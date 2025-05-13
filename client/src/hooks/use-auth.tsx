import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password"> & { captcha: string, captchaId: string | null };

// نوع بيانات التسجيل مع معرف الكابتشا
type RegisterData = InsertUser & { captchaId: string | null };

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // طباعة تشخيصية للبيانات عند تغييرها
  useEffect(() => {
    if (user) {
      console.log('AuthProvider: User data received:', {
        userId: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        isActive: user.status === 'active'
      });
    } else {
      console.log('AuthProvider: No user data (user is null or undefined)');
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      // يتحقق مما إذا كانت الاستجابة ليست ناجحة (401 أو غيرها)
      if (!res.ok) {
        // استخدام محتوى الاستجابة لتحديد رسالة الخطأ
        const errorResponse = await res.json().catch(() => ({
          message: "حدث خطأ أثناء تسجيل الدخول"
        }));
        
        // إلقاء الخطأ بالرسالة المناسبة من الاستجابة
        throw new Error(errorResponse.message || "فشل تسجيل الدخول - تحقق من اسم المستخدم وكلمة المرور");
      }
      
      // إذا كانت الاستجابة ناجحة، قم بإرجاع البيانات
      return await res.json();
    },
    onSuccess: (loginResponse: any) => {
      console.log('Login success - response:', loginResponse);
      
      // استخراج بيانات المستخدم من الاستجابة
      const userData = loginResponse.user;
      
      // وضع بيانات المستخدم في التخزين المؤقت
      if (userData) {
        queryClient.setQueryData(["/api/user"], userData);
        console.log('استخراج بيانات المستخدم من استجابة تسجيل الدخول:', userData);
      } else {
        console.error('خطأ: لا توجد بيانات مستخدم في استجابة تسجيل الدخول');
      }
    },
    onError: (error: Error) => {
      // عرض الخطأ في إشعار منبثق
      toast({
        title: "تعذر تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        // استخدام محتوى الاستجابة لتحديد رسالة الخطأ
        const errorResponse = await res.json().catch(() => ({
          message: "حدث خطأ أثناء إنشاء الحساب"
        }));
        
        // إلقاء الخطأ بالرسالة المناسبة من الاستجابة
        throw new Error(errorResponse.message || "فشل إنشاء الحساب");
      }
      return await res.json();
    },
    onSuccess: (registerResponse: any) => {
      console.log('Register success - response:', registerResponse);
      
      // استخراج بيانات المستخدم من الاستجابة
      const userData = registerResponse.user;
      
      // وضع بيانات المستخدم في التخزين المؤقت
      if (userData) {
        queryClient.setQueryData(["/api/user"], userData);
        console.log('استخراج بيانات المستخدم من استجابة التسجيل:', userData);
      } else {
        console.error('خطأ: لا توجد بيانات مستخدم في استجابة التسجيل');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
