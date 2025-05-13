import { Link } from "wouter";
import {
  Mail,
  Phone,
} from "lucide-react";
import AppLogo from "@/components/app-logo";

export default function Footer() {
  return (
    <footer
      className="gradient-blue-green relative"
      dir="rtl"
    >
      {/* Curved Top Border - Inverted */}
      <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-b-[100px] z-10 shadow-md"></div>
        <div className="absolute bottom-0 left-[10%] w-12 h-12 bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] rounded-full opacity-10 blur-xl"></div>
        <div className="absolute bottom-0 right-[10%] w-12 h-12 bg-gradient-to-r from-[#0D9C65] to-[#0C7D99] rounded-full opacity-10 blur-xl"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12 mt-3">
          {/* معلومات المنصة */}
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="font-bold text-white">منصة لوجستي</h3>
            </div>
            <p className="text-white/90">
              البوابة الموحدة لتأهيل واعتماد مراكز التدريب والاختبار للسائقين
            </p>
          </div>

          {/* روابط مهمة */}
          <div>
            <h3 className="font-bold mb-6 text-white">روابط مهمة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms">
                  <div className="text-white/80 hover:text-white cursor-pointer transition-colors flex items-center">
                    <span className="inline-block w-2 h-2 bg-white rounded-full ml-2"></span>
                    الشروط والأحكام
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <div className="text-white/80 hover:text-white cursor-pointer transition-colors flex items-center">
                    <span className="inline-block w-2 h-2 bg-white rounded-full ml-2"></span>
                    سياسة الخصوصية
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <div className="text-white/80 hover:text-white cursor-pointer transition-colors flex items-center">
                    <span className="inline-block w-2 h-2 bg-white rounded-full ml-2"></span>
                    الأسئلة الشائعة
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h3 className="font-bold mb-6 text-white">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <span>19929</span>
              </li>
              <li className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hd@logisti.sa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-white/80">
            جميع الحقوق محفوظة للهيئة العامة للنقل © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
