import React, { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// تعريف نوع المستخدم
export interface User {
  userId: number;
  id?: number;
  username: string;
  role: "TRAINING_CENTER" | "TESTING_CENTER" | "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  status: string;
  isActive: boolean;
}

// تعريف سياق المصادقة
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => void;
}

// إنشاء سياق المصادقة
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  logout: () => {},
});

// مزود سياق المصادقة
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // استخدام useQuery لجلب بيانات المستخدم من الخادم
  const { data, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      console.log("Query function executing for /api/user with unauthorized behavior: returnNull");
      try {
        console.log("Making GET request to /api/user");
        const response = await fetch("/api/user");
        if (!response.ok) {
          // إذا كان الرد غير ناجح، نعيد null بدلاً من رمي استثناء
          console.log("Received unsuccessful response from /api/user");
          return null;
        }
        const userData = await response.json();
        console.log("Received data from /api/user:", userData);
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 60 * 1000, // 15 دقيقة
    notifyOnChangeProps: ['data', 'error'],
  });

  // تحديث حالة المستخدم عند تغير البيانات
  useEffect(() => {
    if (data) {
      console.log("AuthProvider: User data received:", data);
      setUser(data);
    } else {
      console.log("AuthProvider: No user data (user is null or undefined)");
      setUser(null);
    }
  }, [data]);

  // وظيفة تسجيل الخروج - تستخدم مسار Replit Auth الجديد
  const logout = async () => {
    try {
      // استخدام مسار Replit Auth الجديد مع طريقة GET
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error: error as Error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// دالة استخدام سياق المصادقة
export const useAuth = () => useContext(AuthContext);