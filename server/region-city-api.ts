import { Router } from 'express';
import { eq } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { db } from './db';

// إنشاء راوتر جديد للمناطق والمدن
export const regionCityRouter = Router();

// الحصول على جميع المناطق
regionCityRouter.get('/regions', async (req, res) => {
  try {
    const regions = await db
      .select()
      .from(schema.saudiRegionsTable)
      .orderBy(schema.saudiRegionsTable.nameAr);
    
    res.json(regions);
  } catch (error) {
    console.error('خطأ في جلب المناطق:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب المناطق' });
  }
});

// الحصول على المدن في منطقة محددة
regionCityRouter.get('/cities/:regionId', async (req, res) => {
  try {
    const regionId = parseInt(req.params.regionId);
    
    if (isNaN(regionId)) {
      return res.status(400).json({ message: 'معرف المنطقة غير صالح' });
    }
    
    console.log(`طلب المدن للمنطقة: ${regionId}`);
    
    const cities = await db
      .select()
      .from(schema.saudiCitiesTable)
      .where(eq(schema.saudiCitiesTable.regionId, regionId))
      .orderBy(schema.saudiCitiesTable.nameAr);
    
    console.log(`تم العثور على ${cities.length} مدينة للمنطقة ${regionId}`);
    
    return res.json(cities);
  } catch (error) {
    console.error('خطأ في جلب المدن:', error);
    return res.status(500).json({ message: 'حدث خطأ في جلب المدن' });
  }
});