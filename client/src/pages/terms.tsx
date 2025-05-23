import React from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header space for global header */}
      
      <div className="container mx-auto px-4 py-16 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">الشروط والأحكام</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#0C7D99] to-[#0D9C65] mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">أولاً: التعريفات:</h2>
                <p className="leading-relaxed mb-4">
                  يقصـد بالكلمـات والعبـارات التاليـة أينمـا وردت المعانـي المبينــة أمامهــا مــا لــم يتضــح صراحــة مــن النــص أو يقتضــي الســياق غيــر ذلـك:
                </p>
                <ul className="space-y-3 list-disc list-inside mr-4">
                  <li className="mb-2">
                    <span className="font-semibold">منصة » لوجستي» أو المنصة:</span> هــي منصة إلكترونيــة تمكــن العامليــن فــي القطاع اللوجستي بأشــكاله كافـة، سـواء مـن أفـراد أو منشـآت، مـن التسجيل في المنصة وتتيح لهم التقديـم عـن بعــد علــى مختلــف التراخيــص لممارسـة أعمـال النقل اللوجستي حسـب مـا هـو محـدد فـي شـروط وأحـكام المنصة، وإتمـام جميـع الإجـراءات ومعالجتهـا إلكترونيـاً دون الحاجـة لزيـارة هيئـة النقـل أو فروعهـا.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">الخدمـة أو الخدمـات:</span> وتعنـي أي مـن الخدمـات المقدمــة فــي نمــوذج التسجيل هــذا مجتمعــة أو منفــردة.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">المستخدم:</span> وتعنــي مســتخدم خدمــة مــن الخدمـات المعتمـدة ضمـن منصة نقـل سـواء أفــراد أو شــركات ومؤسســات أو جهات حكومية وذلــك وفــق نمــوذج التسجيل هــذا.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">المســتخدم الرئيســي:</span> هــو المســتخدم المفــوض مـن المسجل لتمثيـل المنشـأة أو الفـرد فـي تجديـد التسجيل فــي خدمــات جديــدة او إضافيـة مسـتقبلا أو أمـور أخـرى تتعلـق بالخدمـة ولـه الصلاحيـة الكاملـة فـي ذلـك مـن قبـل المستخدم ومـا يترتــب علــى ذلــك مــن التزامــات او مســؤوليات او تكاليـف ماديـة علـى الخدمـات المطلوبـة، حيـث يحـق للمستخدم الرئيسي تعييــن اكثــر مــن مســتخدم.
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">الجهات المختصة:</span> يقصد بها الهيئات والجهات ذات العلاقة والتي تقدم خدمات تراخيصها عبر منصة » لوجستي».
                  </li>
                  <li className="mb-2">
                    <span className="font-semibold">الجهــات ذات العلاقــة:</span> وتعنــي جميــع الجهــات الحكوميــة أو شــبه الحكوميــة التــي تختــص بتقديــم الخدمــة محــل هــذا التسجيل أو يتــم الاعتمــاد علــى بياناتهــا مثــل وزارة الداخليــة، أو وزارة التجــارة أو أي جهـة حكوميـة معنيـة بالخدمـة، وكذلـك المحاكـم أو اللجـان القضائيـة أو أي جهـة قضائيـة داخـل المملكـة العربيــة الســعودية.
                  </li>
                </ul>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">ثانياً: استمرارية ووقت الخدمة:</h2>
                <p className="leading-relaxed mb-4">
                  تبــذل المنصة قصــارى جهدهــا لتوفيــر الخدمــة وعلــى مــدار الأربــع وعشــرين ســاعة مــع عــدم تحملهــا للمســؤولية فــي حــال عــدم توفــر الخدمــة بســبب أي ظـرف عـارض علـى أن توفيـر واسـتمرارية الخدمـة يخضـع دائمــاً للشــروط التاليــة:
                </p>
                <ol className="list-decimal list-inside mr-4 space-y-2">
                  <li className="mb-2">
                    إن تقديـم الخدمـة يعتمـد علـى الربـط الالكترونـي مـع مقدمــي خدمــات الأنترنــت او الجهــات ذات العلاقة التــي تقــوم بتزويــد الخدمــة بالمعلومــات والبيانــات وقــدرة الأنظمــة القائمــة لديهــم او لــدى المسجل علـى تقديـم الخدمـات بالشـكل الملائـم، ولـن تتحمـل الهيئات والجهات ذات العلاقة بمنصة» لوجستي» أي مسـؤولية تجـاه ذلـك.
                  </li>
                  <li className="mb-2">
                    يحـق للمنصة مـن وقـت لآخر إيقـاف الخدمـة بشكلٍ مؤقت لعمــل الصيانــة الدوريــة والطارئــة ســواء هــذا الايقــاف بإشــعار او بــدون إشــعار مســبق.
                  </li>
                  <li className="mb-2">
                    يحــق للمنصة إيقــاف الخدمــة أو تعليقهــا بموجــب أحــكام هــذا التسجيل.
                  </li>
                </ol>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">ثالثًا: التزامات المستخدم:</h2>
                <p className="leading-relaxed mb-4">
                  يتعهد ويلتزم المستخدم بالتالي:
                </p>
                <ol className="list-decimal list-inside mr-4 space-y-2">
                  <li className="mb-2">
                    المحافظــة علــى اســم المســتخدم وكلمــة الســر الخاصــة بــه أو بالمســتخدمين لديــه، والإبـلاغ عنــد فقــد أي منهمــا مباشــرة ويتحمــل المستخدم المســؤولية التامــة عــن اســتخدامهما.
                  </li>
                  <li className="mb-2">
                    الالتـزام بالمسـؤوليات المترتبـة علـى أي طلـب مقدم عـن طريـق اسـم المسـتخدم أو كلمـة المـرور وعـدم مطالبــة الهيئات والجهات ذات العلاقة بمنصة » لوجستي» بــأي تعويضــات نتيجــة هــذا الطلــب، كمـا يلتـزم المستخدم بـأن يكـون جميـع المسـتخدمين موظفيـن تابعيـن لـه.
                  </li>
                  <li className="mb-2">
                    التأكــد مــن صحــة البيانــات المدخلــة مــن قبلــه علــى منصة » لوجستي» أثنــاء التســجيل وتحديثهــا فــي حــال تغيرهــا، وتجديــد الوثائــق حــال انتهــاء صلاحيتهــا، كمــا يتحمــل المستخدم كافــة أخطاء الإدخــال للبيانــات والمعلومــات فــي الخدمــة، ويتحمــل كافــة المســؤوليات الناتجــة عــن تســرب المعلومــات والبيانــات الخاصــة بالأشــخاص المدخلــة بياناتهــم.
                  </li>
                  <li className="mb-2">
                    يتعهـد المستخدم بتنفيـذ جميـع التعليمـات التـي تـرد لــه مــن الجهــات ذات العلاقة والجهــات المختصــة سواء مباشــرة عــن طريــق منصة » لوجستي» أو عــن طريــق الهيئات والجهات ذات العلاقة بمنصة » لوجستي» أو عــن طريــق الجهــات المختصــة أو الجهـات ذات العلاقة.
                  </li>
                  <li className="mb-2">
                    يتحمــل المستخدم كافــة المســؤوليات الناتجــة عــن الطلبـات الصـادرة منـه أو من المسـتخدمين الرئيسـين أو مــن أي مســتخدمين آخريــن تابعيــن للمستخدم ومــا يترتــب عليهــا مــن رســوم أو تكاليــف أو غرامــات (مباشــرة أو غيــر مباشــرة).
                  </li>
                </ol>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">رابعاً: المخالفات والجزاءات:</h2>
                <ol className="list-decimal list-inside mr-4 space-y-2">
                  <li className="mb-2">
                    يتحمــل المسجل كافــة الغرامــات المفروضــة مــن الجهـة المختصـة أو مـن أي جهـة ذات سـلطة نظاميـة بنــاء علــى مخالفتــه أي مــن الأنظمــة النافــذة فــي المملكــة العربيــة الســعودية.
                  </li>
                  <li className="mb-2">
                    لا يعفــي تطبيــق أي مــن الجــزاءات الــواردة أعــلاهَ المستخدم مــن مســؤوليته أمــام الجهــات المختصــة أو ذات العلاقــة عــن الأضــرار الناجمــة والتعويضــات المســتحقة مــن مخالفــة أحــكام وشــروط هــذا التسجيل.
                  </li>
                </ol>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">خامساً: إيقاف الحساب:</h2>
                <p className="leading-relaxed mb-4">
                  يحــق للمنصة إيقاف الحساب فــوراً أو تعليقــه بشــكل كامــل أو جزئــي فــي الحــالات التالية:
                </p>
                <ol className="list-decimal list-inside mr-4 space-y-2">
                  <li className="mb-2">
                    إســاءة اســتخدام المستخدم للخدمــة أو المعلومــات الموجــودة فيهــا أو اســتخدام الخدمــة فــي غيــر الغــرض المخصــص لها.
                  </li>
                  <li className="mb-2">
                    إخلاله بأحــد شــروط وأحــكام هــذا التسجيل الــواردة فــي هــذا النمــوذج أو فــي موقــع الخدمـة أو التعليمـات المرسـلة للمسجل من خلال موقــع الخدمــة الإلكترونــي.
                  </li>
                  <li className="mb-2">
                    عدم صحة أو تحديث المعلومات الخاصة بالمسجل أو الوثائق والتراخيص المقدمة منه.
                  </li>
                  <li className="mb-2">
                    طلب الجهة ذات العلاقة أو الجهات المختصة إيقاف الخدمة بشكلٍ كامل أو جزئي عن المشترك أو تعليقها.
                  </li>
                  <li className="mb-2">
                    في حال إنهاء أو انتهاء التسجيل لأي سبب فإنه يحق للمنصة إلغاء كافة الخدمات الخاصة بالمسجل ومسح وإزالة جميع البيانات والمعلومات الموجودة في الخدمة والخاصة بالمسجل دون تحمل أي مسؤولية تجاه أي خسائر أو أضرار تقع للمسجل.
                  </li>
                  <li className="mb-2">
                    ينتهي الاشتراك في حالة الظروف القاهرة التي تعذر معها الهيئات والجهات ذات العلاقة بمنصة » لوجستي» عن الاستمرار في تقديم الخدمة.
                  </li>
                </ol>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0C7D99] mb-3">سادساً: خصوصية وسرية البيانات والمعلومات:</h2>
                <ol className="list-decimal list-inside mr-4 space-y-2">
                  <li className="mb-2">
                    لا تتحمل الهيئات والجهات ذات العلاقة بمنصة » لوجستي» أي مسؤولية تجاه أي من المشاكل التي قد تنتج بسبب عدم صحة المعلومات أو تحديث المعلومات المقدمة للمستخدم من الجهات ذات العلاقة عن طريق الخدمة.
                  </li>
                  <li className="mb-2">
                    يتعهد المستخدم باستخدام البيانات والمعلومات والخدمات المتاحة من خلال الخدمة للأغراض المحددة لها وفقا لأحكام وشروط هذا النموذج.
                  </li>
                  <li className="mb-2">
                    إن جميــع المعلومــات والبيانــات الــواردة والمســجلة فـي منصة منصة » لوجستي» تعتبـر معلومـات سـرية ويتعهـد المستخدم بعــدم إســاءة اســتخدامها وعــدم تمريرهــا للغيــر أو بيعهــا أو عرضهــا أو التنــازل عنهــا إلــى أي طـرف آخـر.
                  </li>
                  <li className="mb-2">
                    يلتزم المستخدم بعدم تمكين غير العاملين لديه من استخدام الخدمة ويتم ذلك فقط لموظفين تابعين له.
                  </li>
                  <li className="mb-2">
                    يتحمــل المستخدم وحــده المســئولية الكاملــة عــن اســتخدام الخدمــة ســواء تــم ذلــك عــن طريــق المستخدم مباشــرة أو عــن طريــق أي مــن العامليــن لديــه أو غيرهــم.
                  </li>
                </ol>
              </div>
              
              <div className="pt-6 text-center border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  آخر تحديث: 26/02/2025 1:15 مساء
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer space for global footer */}
    </div>
  );
}