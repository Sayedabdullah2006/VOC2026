import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-16 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">سياسة الاستخدام الآمن</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <p className="mb-6 leading-relaxed">
                تهدف سياسة الاستخدام الآمن هذه إلى تحديد الضوابط والإرشادات التي تضمن حماية معلومات وبيانات مستخدمي منصة لوجستي، وضمان استخدامهم الآمن للخدمات المقدمة.
              </p>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">نطاق السياسة</h2>
                <p className="leading-relaxed">
                  تنطبق هذه السياسة على جميع مستخدمي منصة لوجستي، بما في ذلك الزوار، والعملاء، والشركاء، والموظفين.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">الغرض من جمع المعلومات واستخدامها</h2>
                <p className="leading-relaxed">
                  قد نقوم بجمع معلومات شخصية وغير شخصية من المستخدمين لتحسين تجربة الاستخدام وتقديم الخدمات بكفاءة. وتُستخدم المعلومات المجمعة لأغراض تحسين الخدمات، والتواصل مع المستخدمين، والامتثال للمتطلبات القانونية.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">حماية المعلومات</h2>
                <p className="leading-relaxed">
                  تلتزم منصة لوجستي باتخاذ التدابير التقنية والإدارية اللازمة لحماية المعلومات من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">حقوق المستخدمين</h2>
                <p className="leading-relaxed">
                  يحق للمستخدمين الوصول إلى معلوماتهم الشخصية وتحديثها عند الحاجة.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">إخلاء المسؤولية</h2>
                <p className="leading-relaxed">
                  قد تحتوي منصة لوجستي على روابط لمواقع خارجية قد تتبع سياسات وأساليب مختلفة في حماية المعلومات وخصوصيتها. نحن غير مسؤولين عن محتوى أو سياسات الخصوصية أو الأمان لتلك المواقع, وننصحك بالرجوع إلى إشعارات الخصوصية الخاصة بتلك المواقع.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">ملفات تعريف الارتباط (Cookies)</h2>
                <p className="leading-relaxed">
                  قد تستخدم منصة لوجستي ملفات تعريف الارتباط لتحسين تجربة المستخدم. يمكن للمستخدمين ضبط إعدادات المتصفح لرفض الكوكيز، ولكن قد يؤثر ذلك على بعض وظائف الموقع.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">التعديلات على السياسة</h2>
                <p className="leading-relaxed">
                  قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم إشعار المستخدمين بأي تغييرات جوهرية عبر الموقع.
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">الاتصال بنا</h2>
                <p className="leading-relaxed">
                  لأي استفسارات أو ملاحظات حول سياسة الاستخدام الآمن، يرجى التواصل معنا عبر معلومات الاتصال المتوفرة على الموقع.
                </p>
              </div>
              
              <div className="pt-6 mt-6 text-center border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  تم اعتماده وتحديثه بتاريخ 26/02/2025 1:15 مساء
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}