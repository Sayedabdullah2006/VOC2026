import { useState, useEffect, forwardRef } from 'react';
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CaptchaProps {
  onChange: (value: string) => void;
  value: string;
  error?: boolean;
  errorMessage?: string;
  remainingAttempts?: number;
  name?: string;
  onCaptchaIdChange?: (captchaId: string) => void;
}

// تخزين رمز CSRF عالميًا للاستخدام في باقي أنحاء التطبيق
let globalCsrfToken: string | null = null;
// تخزين معرف الكابتشا للاستخدام في عملية التحقق
let globalCaptchaId: string | null = null;

// الحصول على رمز CSRF الحالي
export function getCsrfToken(): string | null {
  return globalCsrfToken;
}

// الحصول على معرف الكابتشا الحالي
export function getCaptchaId(): string | null {
  return globalCaptchaId;
}

const Captcha = forwardRef<HTMLDivElement, CaptchaProps>(function Captcha(props, ref) {
  const { onChange, value, error, errorMessage, remainingAttempts, name, onCaptchaIdChange } = props;
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [captchaId, setCaptchaId] = useState<string | null>(null);
  
  // التحقق مما إذا كان المكون مستخدم في صفحة المشرف الشامل
  const isInSuperAdminPage = window.location.pathname.includes('/super-admin');

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/captcha');
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الكابتشا');
      }
      
      const data = await response.json();
      setCaptchaImage(data.image);
      
      // تخزين معرف الكابتشا
      if (data.id) {
        setCaptchaId(data.id);
        globalCaptchaId = data.id; // تخزين عالمي
        
        // استدعاء الدالة للإبلاغ عن تغيير معرف الكابتشا
        if (onCaptchaIdChange) {
          onCaptchaIdChange(data.id);
        }
        
        console.log('تم الحصول على معرف الكابتشا:', data.id);
      }
      
      // تخزين رمز CSRF الذي تم استلامه من الخادم (إذا كان موجودًا)
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
        globalCsrfToken = data.csrfToken; // تخزين عالمي للاستخدام في أي مكان آخر
        console.log('تم الحصول على رمز CSRF:', data.csrfToken);
      }
    } catch (error) {
      console.error('خطأ في تحميل الكابتشا:', error);
    } finally {
      setLoading(false);
    }
  };

  // التحقق من كود الكابتشا
  const verifyCaptcha = async (captchaInput: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // إضافة رمز CSRF للرأس (إذا كان متوفرًا)
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ captchaInput })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('خطأ في التحقق من الكابتشا:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <FormLabel className={isInSuperAdminPage ? "text-black" : "text-white"}>
        الكود الأمني
      </FormLabel>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          {captchaImage ? (
            <div className="relative">
              <img 
                src={captchaImage} 
                alt="كود أمني" 
                className="border rounded-md w-full h-auto"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-1 left-1 bg-white/80 hover:bg-white text-black p-1 rounded-full"
                onClick={fetchCaptcha}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </Button>
            </div>
          ) : (
            <div className="animate-pulse bg-gray-400/20 h-16 w-full rounded-md flex items-center justify-center">
              <span className={isInSuperAdminPage ? "text-gray-500" : "text-white/50"}>
                جاري التحميل...
              </span>
            </div>
          )}
          
          <div className={`mt-1 text-xs w-full text-center ${isInSuperAdminPage ? "text-gray-600" : "text-gray-300"}`}>
            اضغط على الأيقونة لتحديث الكود إذا كان صعب القراءة
          </div>
        </div>
        
        <div>
          <FormControl>
            <Input
              type="text"
              placeholder="أدخل الكود الظاهر بالصورة"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`text-right ${error ? 'border-red-500' : ''} ${
                isInSuperAdminPage 
                  ? "bg-white text-black border-gray-200" 
                  : "bg-white/20 text-white border-white/20"
              }`}
              maxLength={8}
              autoComplete="off"
            />
          </FormControl>
          
          {error && errorMessage && (
            <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
          )}
          
          {remainingAttempts !== undefined && remainingAttempts < 5 && (
            <div className="text-amber-500 text-sm mt-1">
              عدد المحاولات المتبقية: {remainingAttempts}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// تصدير المكون بشكل افتراضي
export default Captcha;