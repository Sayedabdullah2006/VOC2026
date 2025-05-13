import { Router } from "express";
import { 
  getApplicationsStats, 
  getUsersStats, 
  getTrainingCentersStats, 
  getTestingCentersStats 
} from "./stats";

const router = Router();

// إضافة مسارات الإحصائيات
router.get("/api/applications/stats", async (req, res) => {
  try {
    const stats = await getApplicationsStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching applications stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إحصائيات الطلبات" });
  }
});

router.get("/api/users/stats", async (req, res) => {
  try {
    const stats = await getUsersStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching users stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إحصائيات المستخدمين" });
  }
});

router.get("/api/training-centers/stats", async (req, res) => {
  try {
    const stats = await getTrainingCentersStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching training centers stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إحصائيات مراكز التدريب" });
  }
});

router.get("/api/testing-centers/stats", async (req, res) => {
  try {
    const stats = await getTestingCentersStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching testing centers stats:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب إحصائيات مراكز الاختبار" });
  }
});

export default router;
