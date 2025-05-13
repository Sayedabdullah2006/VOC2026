// استيراد الثوابت مع التعامل مع حالة عدم وجودها في بيئة الإنتاج
import { LOGO_BASE64, LOGO_WHITE_BASE64 } from "@/lib/logo-constants";

// نسخة احتياطية للشعار (SVG مضمن) في حالة فشل تحميل الصورة الأصلية
const DEFAULT_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgNDAiPgogIDx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDU2NjhEIj7ZhNmI2KzYs9iq2Yo8L3RleHQ+Cjwvc3ZnPg==";

const DEFAULT_WHITE_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgNDAiPgogIDx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj7ZhNmI2KzYs9iq2Yo8L3RleHQ+Cjwvc3ZnPg==";

interface AppLogoProps {
  variant?: "default" | "white";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * مكون الشعار الموحد للتطبيق الذي يستخدم في جميع أنحاء التطبيق
 * @param variant نوع الشعار (افتراضي أو أبيض)
 * @param className فئات CSS إضافية
 * @param size حجم الشعار (صغير، متوسط، كبير)
 */
export default function AppLogo({ 
  variant = "default", 
  className = "", 
  size = "md" 
}: AppLogoProps) {
  // تحديد ارتفاع الشعار حسب الحجم المطلوب
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto"
  };

  // تحديد مصدر الشعار حسب النوع مع وجود قيمة احتياطية
  let logoSrc;
  try {
    logoSrc = variant === "white" 
      ? (LOGO_WHITE_BASE64 || DEFAULT_WHITE_LOGO) 
      : (LOGO_BASE64 || DEFAULT_LOGO);
  } catch (error) {
    // في حالة حدوث خطأ، استخدم الشعار الاحتياطي
    console.warn('Error loading logo constants, using fallback logo');
    logoSrc = variant === "white" ? DEFAULT_WHITE_LOGO : DEFAULT_LOGO;
  }
  
  return (
    <img
      src={logoSrc}
      alt="شعار لوجستي"
      className={`${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // في حالة فشل تحميل الصورة، استخدم الشعار الاحتياطي
        const target = e.target as HTMLImageElement;
        target.onerror = null; // منع التكرار اللانهائي
        target.src = variant === "white" ? DEFAULT_WHITE_LOGO : DEFAULT_LOGO;
      }}
    />
  );
}