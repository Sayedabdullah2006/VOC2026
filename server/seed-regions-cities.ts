import { db } from './db';
import { saudiRegionsTable, saudiCitiesTable } from '@shared/schema';

// بيانات المناطق السعودية
const regionsData = [
  { name: 'Riyadh', nameAr: 'الرياض', code: 'RD' },
  { name: 'Makkah', nameAr: 'مكة المكرمة', code: 'MK' },
  { name: 'Madinah', nameAr: 'المدينة المنورة', code: 'MD' },
  { name: 'Qassim', nameAr: 'القصيم', code: 'QS' },
  { name: 'Eastern Province', nameAr: 'المنطقة الشرقية', code: 'EP' },
  { name: 'Asir', nameAr: 'عسير', code: 'AS' },
  { name: 'Tabuk', nameAr: 'تبوك', code: 'TB' },
  { name: 'Hail', nameAr: 'حائل', code: 'HL' },
  { name: 'Northern Borders', nameAr: 'الحدود الشمالية', code: 'NB' },
  { name: 'Jazan', nameAr: 'جازان', code: 'JZ' },
  { name: 'Najran', nameAr: 'نجران', code: 'NJ' },
  { name: 'Bahah', nameAr: 'الباحة', code: 'BH' },
  { name: 'Jawf', nameAr: 'الجوف', code: 'JF' }
];

// بيانات المدن السعودية حسب المنطقة
const citiesData = [
  // منطقة الرياض
  { name: 'Riyadh', nameAr: 'الرياض', regionId: 1 },
  { name: 'Diriyah', nameAr: 'الدرعية', regionId: 1 },
  { name: 'Al-Kharj', nameAr: 'الخرج', regionId: 1 },
  { name: 'Dawadmi', nameAr: 'الدوادمي', regionId: 1 },
  { name: 'Al-Majma\'ah', nameAr: 'المجمعة', regionId: 1 },
  { name: 'Al-Quway\'iyah', nameAr: 'القويعية', regionId: 1 },
  { name: 'Wadi ad-Dawasir', nameAr: 'وادي الدواسر', regionId: 1 },
  { name: 'Al-Aflaj', nameAr: 'الأفلاج', regionId: 1 },
  { name: 'Zulfi', nameAr: 'الزلفي', regionId: 1 },
  { name: 'Shaqra', nameAr: 'شقراء', regionId: 1 },
  { name: 'Hotat Bani Tamim', nameAr: 'حوطة بني تميم', regionId: 1 },
  { name: 'Afif', nameAr: 'عفيف', regionId: 1 },
  { name: 'Al-Sulayyil', nameAr: 'السليل', regionId: 1 },
  
  // منطقة مكة المكرمة
  { name: 'Mecca', nameAr: 'مكة', regionId: 2 },
  { name: 'Jeddah', nameAr: 'جدة', regionId: 2 },
  { name: 'Taif', nameAr: 'الطائف', regionId: 2 },
  { name: 'Qunfudhah', nameAr: 'القنفذة', regionId: 2 },
  { name: 'Al Lith', nameAr: 'الليث', regionId: 2 },
  { name: 'Rabigh', nameAr: 'رابغ', regionId: 2 },
  { name: 'Al Jumum', nameAr: 'الجموم', regionId: 2 },
  { name: 'Khulays', nameAr: 'خليص', regionId: 2 },
  { name: 'Al Kamil', nameAr: 'الكامل', regionId: 2 },
  { name: 'Al Khurmah', nameAr: 'الخرمة', regionId: 2 },
  { name: 'Turubah', nameAr: 'تربة', regionId: 2 },
  { name: 'Maysaan', nameAr: 'ميسان', regionId: 2 },
  { name: 'Adham', nameAr: 'أضم', regionId: 2 },
  
  // منطقة المدينة المنورة
  { name: 'Medina', nameAr: 'المدينة المنورة', regionId: 3 },
  { name: 'Yanbu', nameAr: 'ينبع', regionId: 3 },
  { name: 'Al Ula', nameAr: 'العلا', regionId: 3 },
  { name: 'Mahd Al Thahab', nameAr: 'مهد الذهب', regionId: 3 },
  { name: 'Al Hinakiyah', nameAr: 'الحناكية', regionId: 3 },
  { name: 'Badr', nameAr: 'بدر', regionId: 3 },
  { name: 'Khaybar', nameAr: 'خيبر', regionId: 3 },
  { name: 'Al-\'Ais', nameAr: 'العيص', regionId: 3 },
  
  // منطقة القصيم
  { name: 'Buraydah', nameAr: 'بريدة', regionId: 4 },
  { name: 'Unaizah', nameAr: 'عنيزة', regionId: 4 },
  { name: 'Ar Rass', nameAr: 'الرس', regionId: 4 },
  { name: 'Al Mithnab', nameAr: 'المذنب', regionId: 4 },
  { name: 'Al Bukayriyah', nameAr: 'البكيرية', regionId: 4 },
  { name: 'Al Badayea', nameAr: 'البدائع', regionId: 4 },
  { name: 'Riyadh Al Khabra', nameAr: 'رياض الخبراء', regionId: 4 },
  { name: 'Al Ass\'haliyah', nameAr: 'الأسياح', regionId: 4 },
  { name: 'Al Nabhaniyah', nameAr: 'النبهانية', regionId: 4 },
  { name: 'Ash Shimasiyah', nameAr: 'الشماسية', regionId: 4 },
  { name: 'Uqlat Al Suqur', nameAr: 'عقلة الصقور', regionId: 4 },
  { name: 'Darat Bani Umar', nameAr: 'ضرية', regionId: 4 },
  
  // المنطقة الشرقية
  { name: 'Dammam', nameAr: 'الدمام', regionId: 5 },
  { name: 'Dhahran', nameAr: 'الظهران', regionId: 5 },
  { name: 'Khobar', nameAr: 'الخبر', regionId: 5 },
  { name: 'Al Ahsa', nameAr: 'الأحساء', regionId: 5 },
  { name: 'Qatif', nameAr: 'القطيف', regionId: 5 },
  { name: 'Jubail', nameAr: 'الجبيل', regionId: 5 },
  { name: 'Hafr Al-Batin', nameAr: 'حفر الباطن', regionId: 5 },
  { name: 'Khafji', nameAr: 'الخفجي', regionId: 5 },
  { name: 'Ras Tanura', nameAr: 'رأس تنورة', regionId: 5 },
  { name: 'Abqaiq', nameAr: 'بقيق', regionId: 5 },
  { name: 'Nariyah', nameAr: 'النعيرية', regionId: 5 },
  { name: 'Qaryat Al Ulya', nameAr: 'قرية العليا', regionId: 5 },

  // منطقة عسير
  { name: 'Abha', nameAr: 'أبها', regionId: 6 },
  { name: 'Khamis Mushait', nameAr: 'خميس مشيط', regionId: 6 },
  { name: 'Bisha', nameAr: 'بيشة', regionId: 6 },
  { name: 'Al Namas', nameAr: 'النماص', regionId: 6 },
  { name: 'Muhayil', nameAr: 'محايل', regionId: 6 },
  { name: 'Sarat Abidah', nameAr: 'سراة عبيدة', regionId: 6 },
  { name: 'Rijal Alma', nameAr: 'رجال ألمع', regionId: 6 },
  { name: 'Ahad Rifaydah', nameAr: 'أحد رفيدة', regionId: 6 },
  { name: 'Dhahran Al Janub', nameAr: 'ظهران الجنوب', regionId: 6 },
  { name: 'Tathlith', nameAr: 'تثليث', regionId: 6 },
  { name: 'Balqarn', nameAr: 'بلقرن', regionId: 6 },
  { name: 'Al-Majardah', nameAr: 'المجاردة', regionId: 6 },

  // منطقة تبوك
  { name: 'Tabuk', nameAr: 'تبوك', regionId: 7 },
  { name: 'Umluj', nameAr: 'أملج', regionId: 7 },
  { name: 'Al Wajh', nameAr: 'الوجه', regionId: 7 },
  { name: 'Duba', nameAr: 'ضباء', regionId: 7 },
  { name: 'Tayma', nameAr: 'تيماء', regionId: 7 },
  { name: 'Haql', nameAr: 'حقل', regionId: 7 },
  { name: 'Al Bad\'', nameAr: 'البدع', regionId: 7 },

  // منطقة حائل
  { name: 'Hail', nameAr: 'حائل', regionId: 8 },
  { name: 'Baqaa', nameAr: 'بقعاء', regionId: 8 },
  { name: 'Al Ghazalah', nameAr: 'الغزالة', regionId: 8 },
  { name: 'Al Shinan', nameAr: 'الشنان', regionId: 8 },
  { name: 'Al Hait', nameAr: 'الحائط', regionId: 8 },
  { name: 'Ash Shamli', nameAr: 'الشملي', regionId: 8 },
  { name: 'Muwaqaq', nameAr: 'موقق', regionId: 8 },
  { name: 'Al Salimi', nameAr: 'السليمي', regionId: 8 },

  // منطقة الحدود الشمالية
  { name: 'Arar', nameAr: 'عرعر', regionId: 9 },
  { name: 'Rafha', nameAr: 'رفحاء', regionId: 9 },
  { name: 'Turaif', nameAr: 'طريف', regionId: 9 },
  { name: 'Al Uwayqilah', nameAr: 'العويقيلة', regionId: 9 },

  // منطقة جازان
  { name: 'Jazan', nameAr: 'جازان', regionId: 10 },
  { name: 'Sabya', nameAr: 'صبيا', regionId: 10 },
  { name: 'Abu Arish', nameAr: 'أبو عريش', regionId: 10 },
  { name: 'Samtah', nameAr: 'صامطة', regionId: 10 },
  { name: 'Ahad Al Masarihah', nameAr: 'أحد المسارحة', regionId: 10 },
  { name: 'Al Darb', nameAr: 'الدرب', regionId: 10 },
  { name: 'Al Aridhah', nameAr: 'العارضة', regionId: 10 },
  { name: 'Al Dayer', nameAr: 'الدائر', regionId: 10 },
  { name: 'Farasan', nameAr: 'فرسان', regionId: 10 },
  { name: 'Al Rayth', nameAr: 'الريث', regionId: 10 },

  // منطقة نجران
  { name: 'Najran', nameAr: 'نجران', regionId: 11 },
  { name: 'Sharurah', nameAr: 'شرورة', regionId: 11 },
  { name: 'Hubuna', nameAr: 'حبونا', regionId: 11 },
  { name: 'Badr Al Janub', nameAr: 'بدر الجنوب', regionId: 11 },
  { name: 'Yadmah', nameAr: 'يدمة', regionId: 11 },
  { name: 'Thar', nameAr: 'ثار', regionId: 11 },
  { name: 'Khubash', nameAr: 'خباش', regionId: 11 },

  // منطقة الباحة
  { name: 'Al Bahah', nameAr: 'الباحة', regionId: 12 },
  { name: 'Baljurashi', nameAr: 'بلجرشي', regionId: 12 },
  { name: 'Al Mandaq', nameAr: 'المندق', regionId: 12 },
  { name: 'Al Makhwah', nameAr: 'المخواة', regionId: 12 },
  { name: 'Al Qura', nameAr: 'القرى', regionId: 12 },
  { name: 'Qilwah', nameAr: 'قلوة', regionId: 12 },
  { name: 'Al Aqiq', nameAr: 'العقيق', regionId: 12 },
  { name: 'Ghamid Al Zinad', nameAr: 'غامد الزناد', regionId: 12 },
  { name: 'Bani Hasan', nameAr: 'بني حسن', regionId: 12 },

  // منطقة الجوف
  { name: 'Sakaka', nameAr: 'سكاكا', regionId: 13 },
  { name: 'Qurayyat', nameAr: 'القريات', regionId: 13 },
  { name: 'Dumat Al Jandal', nameAr: 'دومة الجندل', regionId: 13 },
  { name: 'Tabarjal', nameAr: 'طبرجل', regionId: 13 },
  { name: 'Al Hadithah', nameAr: 'الحديثة', regionId: 13 },
];

// وظيفة لزرع بيانات المناطق
async function seedRegions() {
  try {
    console.log('Seeding regions...');
    // تحقق من وجود بيانات المناطق
    const existingRegions = await db.select().from(saudiRegionsTable);
    
    if (existingRegions.length > 0) {
      console.log(`Regions already exist in the database (${existingRegions.length} records)`);
      return existingRegions;
    }

    // إضافة المناطق إلى قاعدة البيانات
    const insertedRegions = await db.insert(saudiRegionsTable).values(regionsData).returning();
    console.log(`Inserted ${insertedRegions.length} regions`);
    return insertedRegions;
  } catch (error) {
    console.error('Error seeding regions:', error);
    throw error;
  }
}

// وظيفة لزرع بيانات المدن
async function seedCities() {
  try {
    console.log('Seeding cities...');
    // تحقق من وجود بيانات المدن
    const existingCities = await db.select().from(saudiCitiesTable);
    
    if (existingCities.length > 0) {
      console.log(`Cities already exist in the database (${existingCities.length} records)`);
      return existingCities;
    }

    // إضافة المدن إلى قاعدة البيانات
    const insertedCities = await db.insert(saudiCitiesTable).values(citiesData).returning();
    console.log(`Inserted ${insertedCities.length} cities`);
    return insertedCities;
  } catch (error) {
    console.error('Error seeding cities:', error);
    throw error;
  }
}

// تنفيذ عملية زرع البيانات
async function seedData() {
  try {
    await seedRegions();
    await seedCities();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
seedData();