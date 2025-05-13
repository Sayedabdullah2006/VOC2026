import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  MapPin,
  Phone,
  Globe,
  Mail,
  Search,
  Filter,
  List,
  Grid2X2,
  ExternalLink,
  Info,
  Map,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";
import ModernHeaderHome from "@/components/layout/modern-header-home";
import Footer from "@/components/layout/footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// بيانات المراكز المعتمدة
const testCentersData = [
  {
    id: 1,
    name: "معهد المتقدم للتدريب الرياضي",
    shortName: "معهد المتقدم للتدريب الرياضي",
    region: "الرياض",
    city: "الرياض",
    district: "العليا",
    phone: "0123456789",
    website: "https://tivi.edu.sa/",
    email: "k.farouq@ifmi.com.sa"
  },
  {
    id: 2,
    name: "معهد منظومة التعلم المقدم للنقل وتأهيل السائقين",
    shortName: "معهد منظومة التعلم المقدم للنقل وتأهيل السائقين",
    region: "المدينة",
    city: "المدينة",
    district: "المنطقة الشرقية",
    phone: "0123456789",
    website: "https://meli.edu.sa/",
    email: "dtc@meli.edu.sa"
  },
  {
    id: 3,
    name: "معهد إشراقات للتدريب المهني",
    shortName: "معهد إشراقات للتدريب المهني",
    region: "الرياض",
    city: "الرياض",
    district: "النزهة",
    phone: "0123456789",
    website: "https://www.eshraqat.com.sa/",
    email: "m.jezani@hotmail.com"
  },
  {
    id: 4,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الدمام",
    district: "العنود",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 5,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الدمام",
    district: "الفيصلية",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 6,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الدمام",
    district: "الفيصلية",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 7,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الدمام",
    district: "الراكة",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 8,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الخبر",
    district: "العقربية",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 9,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الرياض",
    city: "الرياض",
    district: "العليا",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 10,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الشرقية",
    city: "الخبر",
    district: "العقربية",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 11,
    name: "معهد المهارات المتخصصة للتدريب المهني",
    shortName: "معهد شبه العالي للتدريب المهني",
    region: "مكة",
    city: "مكة",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 12,
    name: "معهد المهارات المتخصصة للتدريب المهني",
    shortName: "معهد شبه العالي للتدريب المهني",
    region: "الرياض",
    city: "الرياض",
    district: "الروضة",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 13,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "الشمالية",
    city: "حائل",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 14,
    name: "معهد المطورون للتدريب المهني",
    shortName: "معهد المطورون للتدريب المهني",
    region: "الرياض",
    city: "الرياض",
    district: "العليا",
    phone: "0123456789",
    website: "https://www.saudi-skills.com/",
    email: "ahd.khalaf2009@yahoo.com"
  },
  {
    id: 15,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "مكة",
    city: "جدة",
    district: "المروة",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 16,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الجنوبية",
    city: "جيزان",
    district: "الروضة محي الدين",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 17,
    name: "معهد أركان المعرفة للتدريب المهني",
    shortName: "المعرفة المهنية",
    region: "الجنوبية",
    city: "نجران",
    district: "الفهد",
    phone: "0123456789",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 18,
    name: "معهد التدريب الصناعي للأمن الصناعي",
    shortName: "معهد التدريب الصناعي للأمن الصناعي",
    region: "الشرق",
    city: "الخبر",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://www.sai.edu.sa/",
    email: "dhaferbishr@gmail.com"
  },
  {
    id: 19,
    name: "معهد الإنتاجية بالدمام للتدريب المهني",
    shortName: "معهد الإنتاجية بالدمام للتدريب المهني",
    region: "الشرق",
    city: "الدمام",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://salla.sa/dpi.com",
    email: "dpinstitu@gmail.com"
  },
  {
    id: 20,
    name: "معهد مقياس للتدريب النظري والعملي ",
    shortName: "معهد مقياس للتدريب المهني",
    region: "جدة",
    city: "جدة",
    district: "الحمدانية",
    phone: "0123456789",
    website: "https://miqyas.edu.sa/",
    email: "info@miqyas.edu.sa"
  },
  {
    id: 21,
    name: "المعهد الفني للتدريب الصناعي",
    shortName: "معهد الفاو - للتدريب المهني السائقين",
    region: "الشرقي",
    city: "الدمام",
    district: "الشمال الغربي",
    phone: "0123456789",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 22,
    name: "المعهد الفني للتدريب الصناعي",
    shortName: "معهد الفاو - للتدريب المهني السائقين",
    region: "الجنوبية",
    city: "أبها الجديد",
    district: "الروابي",
    phone: "0123456789",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 23,
    name: "المعهد الفني للتدريب الصناعي",
    shortName: "معهد الفاو - للتدريب المهني السائقين",
    region: "الجنوبية",
    city: "أبها الجديد",
    district: "الأندلس",
    phone: "0123456789",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 24,
    name: "المعهد الفني للتدريب الصناعي",
    shortName: "المعهد الوطني للتدريب الصناعي",
    region: "الغربي الجديدة",
    city: "مكة",
    district: "المروج",
    phone: "0123456789",
    website: "https://nationalinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 25,
    name: "المعهد الفني للتدريب الصناعي",
    shortName: "المعهد الوطني للتدريب الصناعي",
    region: "تبوك",
    city: "الوجهة",
    district: "الربوة",
    phone: "0123456789",
    website: "https://nationalinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 26,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "معهد شبة العالي للتدريب المهني",
    region: "الدمام",
    city: "الدمام",
    district: "الأنوار",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 27,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "معهد شبة العالي للتدريب المهني",
    region: "هيئة المدن",
    city: "نيو الرياض",
    district: "الروضة",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 28,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "معهد شبة العالي للتدريب المهني",
    region: "هيئة المدن",
    city: "نيو الرياض",
    district: "الخليج",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 29,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "معهد شبة العالي للتدريب المهني",
    region: "هيئة المدن",
    city: "نيوم",
    district: "الروضة",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 30,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "معهد شبة العالي للتدريب المهني",
    region: "هيئة المدن",
    city: "نيوم",
    district: "العروبة",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 31,
    name: "معهد المهارات المتخصصة للتدريب المهني السائقين",
    shortName: "المهارات التدريبية للتدريب المهني سائق متدربين",
    region: "هيئة المدن",
    city: "نيوم",
    district: "العروبة",
    phone: "0123456789",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 32,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "الشمال",
    city: "حائل",
    district: "العزيز",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 33,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "الشمال",
    city: "سكاكا",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 34,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "الشمال",
    city: "سكاكا",
    district: "النهضة",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 35,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "حفر",
    city: "حفر",
    district: "الصناعية الثانية",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 36,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "الشمالية الجديدة",
    city: "الشمالية الجديدة",
    district: "الحمراء",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 37,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "عرعر",
    city: "عرعر",
    district: "العزيزية",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 38,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "عرعر",
    city: "رفحاء",
    district: "الأمل",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 39,
    name: "معهد المساندة للتدريب المهني",
    shortName: "معهد المساندة للتدريب المهني",
    region: "تبوك",
    city: "تبوك",
    district: "الفيصلية",
    phone: "0123456789",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 40,
    name: "معهد التميز للدراسات المهني للسائقين",
    shortName: "المعهد الذهبي للدراسات المهني للسائقين",
    region: "الشرقي",
    city: "الدمام",
    district: "النهضة",
    phone: "0123456789",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 41,
    name: "معهد التميز للدراسات المهني للسائقين",
    shortName: "المعهد الذهبي للدراسات المهني للسائقين",
    region: "الجنوبية",
    city: "أبها الجديد",
    district: "الفردوس",
    phone: "0123456789",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 42,
    name: "معهد التميز للدراسات المهني للسائقين",
    shortName: "المعهد الذهبي للدراسات المهني للسائقين",
    region: "الجنوبية",
    city: "أبها الجديد",
    district: "الربيع",
    phone: "0123456789",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 43,
    name: "معهد التميز للدراسات المهني للسائقين",
    shortName: "المعهد الذهبي للدراسات المهني للسائقين",
    region: "تبوك",
    city: "تبوك",
    district: "الفيصلية",
    phone: "0123456789",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 44,
    name: "معهد التميز للدراسات المهني للسائقين",
    shortName: "المعهد الذهبي للدراسات المهني للسائقين",
    region: "عرعر",
    city: "رفحاء",
    district: "الشعلة",
    phone: "0123456789",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 45,
    name: "معهد يلو للتدريب المهني",
    shortName: "يلو اكاديمي",
    region: "الشرقي",
    city: "الدمام",
    district: "الفردوس",
    phone: "0123456789",
    website: "https://yelo-academy.com/",
    email: "m.aljohani@yeloacademy.com"
  },
  {
    id: 46,
    name: "معهد المطورون للتدريب المهني السائقين",
    shortName: "معهد المطورون للتدريب المهني السائقين",
    region: "الرياض",
    city: "الرياض",
    district: "النسيم",
    phone: "0123456789",
    website: "https://www.saudi-skills.com/",
    email: "ahd.khalaf2009@yahoo.com"
  },
  {
    id: 47,
    name: "أكاديمية الموارد البشرية المهنية",
    shortName: "معهد الترخيصات المهنية للتدريب المهني وتأهيل الكوادر المهنية",
    region: "الشرقي",
    city: "الدمام",
    district: "الفيصلية",
    phone: "0123456789",
    website: "https://ihracademy.com/",
    email: "falah@ihr.sa"
  },
  {
    id: 48,
    name: "معهد العلوم المهني للتدريب المهني",
    shortName: "معهد العلوم المهني",
    region: "الشرقي",
    city: "الدمام",
    district: "العليا",
    phone: "0123456789",
    website: "https://bgitd.com/",
    email: "info@bgitd.com"
  },
  {
    id: 49,
    name: "معهد مداد العلم للتدريب المهني",
    shortName: "معهد مداد العلم للتدريب المهني",
    region: "الشرقي",
    city: "الدمام",
    district: "العليا",
    phone: "0123456789",
    website: "https://medadal-elim.com/",
    email: "nawaf.almotairi@medadal-elim.com"
  }
];

const TestCentersSearch = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "grouped">("cards");

  // استخراج القيم الفريدة للمناطق والمدن والأحياء
  const uniqueRegions = useMemo(() => {
    const regions = Array.from(new Set(testCentersData.map(center => center.region)));
    return regions.sort();
  }, []);

  const uniqueCities = useMemo(() => {
    const cities = Array.from(
      new Set(
        testCentersData
          .filter(center => selectedRegion === "all" || center.region === selectedRegion)
          .map(center => center.city)
      )
    );
    return cities.sort();
  }, [selectedRegion]);

  const uniqueDistricts = useMemo(() => {
    const districts = Array.from(
      new Set(
        testCentersData
          .filter(
            center =>
              (selectedRegion === "all" || center.region === selectedRegion) &&
              (selectedCity === "all" || center.city === selectedCity)
          )
          .map(center => center.district)
      )
    );
    return districts.sort();
  }, [selectedRegion, selectedCity]);

  // تصفية المراكز بناءً على معايير البحث
  const filteredCenters = useMemo(() => {
    return testCentersData.filter(center => {
      const matchesSearch = searchQuery
        ? center.name.includes(searchQuery) ||
          center.shortName.includes(searchQuery)
        : true;
      
      const matchesRegion = selectedRegion === "all" ? true : center.region === selectedRegion;
      const matchesCity = selectedCity === "all" ? true : center.city === selectedCity;
      const matchesDistrict = selectedDistrict === "all" ? true : center.district === selectedDistrict;

      return matchesSearch && matchesRegion && matchesCity && matchesDistrict;
    });
  }, [searchQuery, selectedRegion, selectedCity, selectedDistrict]);

  // تجميع المراكز حسب الاسم
  const groupedCenters = useMemo(() => {
    const groups: Record<string, typeof testCentersData> = {};
    
    filteredCenters.forEach(center => {
      if (!groups[center.name]) {
        groups[center.name] = [];
      }
      groups[center.name].push(center);
    });
    
    return Object.entries(groups);
  }, [filteredCenters]);

  // إعادة تعيين فلتر المدينة والحي عند تغيير المنطقة
  useEffect(() => {
    setSelectedCity("all");
    setSelectedDistrict("all");
  }, [selectedRegion]);

  // إعادة تعيين فلتر الحي عند تغيير المدينة
  useEffect(() => {
    setSelectedDistrict("all");
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Modern Header (same as homepage) */}
      <ModernHeaderHome className="z-50" />
      
      {/* Page Header Section */}
      <div className="pt-24 pb-32 bg-gradient-to-l from-[#0C7D99] to-[#0D9C65] relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-10 bg-pattern-dots"></div>
        <div className="absolute bottom-0 right-0 w-full h-20 bg-white/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">مراكز التدريب المعتمدة</h1>
            <p className="text-white/80 text-lg mb-8">
              استعرض قائمة بمراكز التدريب المعتمدة من الهيئة العامة للنقل في المملكة العربية السعودية
            </p>
            
            <div className="relative w-full max-w-xl bg-white p-1 rounded-full shadow-xl">
              <Input
                placeholder="ابحث عن مركز تدريب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 pl-4 rounded-full border-0 text-right"
                dir="rtl"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-primary" />
              </span>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 96L48 90.7C96 85 192 75 288 69.3C384 64 480 64 576 74.7C672 85 768 107 864 101.3C960 96 1056 64 1152 48C1248 32 1344 32 1392 32H1440V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V96Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Filter and Results Section */}
      <div className="container mx-auto px-4 -mt-10 pb-16">
        <AnimatedGradientBorder
          gradient="modern"
          intensity="low"
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="bg-card rounded-2xl overflow-hidden">
            {/* Filter Section */}
            <div className="p-6 border-b">
              <div className="flex flex-wrap justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center flex-row-reverse">
                  <Filter className="h-5 w-5 ml-2 text-primary" />
                  خيارات البحث
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRegion("all");
                      setSelectedCity("all");
                      setSelectedDistrict("all");
                    }}
                    className="text-sm mr-2"
                  >
                    مسح الفلتر
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2"
                  >
                    {isFilterOpen ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                  </Button>
                </div>
              </div>

              {/* Filter Options */}
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                >
                  <div>
                    <label className="text-sm font-medium mb-1 block text-right">المنطقة</label>
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger className="bg-card/60 border border-border/50">
                        <SelectValue placeholder="اختر المنطقة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المناطق</SelectItem>
                        {uniqueRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block text-right">المدينة</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="bg-card/60 border border-border/50">
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المدن</SelectItem>
                        {uniqueCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block text-right">الحي</label>
                    <Select
                      value={selectedDistrict}
                      onValueChange={setSelectedDistrict}
                    >
                      <SelectTrigger className="bg-card/60 border border-border/50">
                        <SelectValue placeholder="اختر الحي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأحياء</SelectItem>
                        {uniqueDistricts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Results Section */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <div className="w-full md:w-auto mb-4 md:mb-0">
                  {/* View Switcher */}
                  <div className="flex items-center gap-2 justify-end md:justify-start border border-border/30 p-1 rounded-lg bg-background/50 w-fit">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === "cards" ? "secondary" : "ghost"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => setViewMode("cards")}
                          >
                            <Grid2X2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>عرض بطاقات</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => setViewMode("list")}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>عرض قائمة</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === "grouped" ? "secondary" : "ghost"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => setViewMode("grouped")}
                          >
                            <Map className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>تجميع حسب المراكز</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold flex items-center text-primary">
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-sm ml-2">
                    {filteredCenters.length}
                  </span>
                  مراكز التدريب
                  <Building className="h-5 w-5 mr-2" />
                </h3>
              </div>

              {filteredCenters.length > 0 ? (
                <div>
                  {/* Card View */}
                  {viewMode === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCenters.map((center) => (
                        <motion.div
                          key={center.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full border border-border/40">
                            <div className="h-2 bg-gradient-to-l from-[#0C7D99] to-[#0D9C65] group-hover:h-3 transition-all"></div>
                            <CardContent className="p-6">
                              <h3 className="font-bold text-xl mb-4 text-primary text-right">
                                {center.name}
                              </h3>
                              
                              <div className="space-y-4 text-sm text-right mb-4">
                                <div className="flex items-start gap-3 flex-row-reverse bg-muted/30 p-3 rounded-lg">
                                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                                  <div className="text-right">
                                    <div className="font-medium text-base">{center.region} - {center.city}</div>
                                    <div className="text-muted-foreground">{center.district}</div>
                                  </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-3">
                                  {center.phone && (
                                    <div className="flex items-center gap-3 flex-row-reverse bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                      <Phone className="h-5 w-5 text-primary shrink-0" />
                                      <a
                                        href={`tel:${center.phone}`}
                                        className="hover:text-primary transition-colors"
                                      >
                                        {center.phone}
                                      </a>
                                    </div>
                                  )}

                                  {center.email && (
                                    <div className="flex items-center gap-3 flex-row-reverse bg-muted/20 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                      <Mail className="h-5 w-5 text-primary shrink-0" />
                                      <a
                                        href={`mailto:${center.email}`}
                                        className="hover:text-primary transition-colors truncate"
                                      >
                                        {center.email}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {center.website && (
                                <div className="mt-5 pt-4 border-t border-border/30 text-center">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full flex flex-row-reverse justify-center bg-gradient-to-l from-[#0C7D99] to-[#0D9C65] hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(center.website, "_blank")}
                                  >
                                    <Globe className="h-4 w-4 mr-0 ml-2" />
                                    زيارة الموقع الإلكتروني
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="text-right w-[300px]">اسم المركز</TableHead>
                            <TableHead className="text-right">المنطقة</TableHead>
                            <TableHead className="text-right">المدينة</TableHead>
                            <TableHead className="text-right">الحي</TableHead>
                            <TableHead className="text-right">جهات الاتصال</TableHead>
                            <TableHead className="text-center w-[100px]">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCenters.map((center) => (
                            <TableRow key={center.id} className="hover:bg-muted/10">
                              <TableCell className="font-medium text-right">
                                {center.name}
                              </TableCell>
                              <TableCell className="text-right">{center.region}</TableCell>
                              <TableCell className="text-right">{center.city}</TableCell>
                              <TableCell className="text-right">{center.district}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col gap-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-primary" />
                                    <a href={`tel:${center.phone}`} className="hover:text-primary">
                                      {center.phone}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-primary" />
                                    <a href={`mailto:${center.email}`} className="hover:text-primary">
                                      {center.email}
                                    </a>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a
                                          href={center.website}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-muted p-1.5 rounded-md hover:bg-primary/10 transition-colors"
                                        >
                                          <ExternalLink className="h-4 w-4 text-primary" />
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>زيارة الموقع الإلكتروني</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 rounded-md hover:bg-primary/10"
                                          onClick={() => {
                                            toast({
                                              title: "تم فتح التفاصيل",
                                              description: `تم فتح تفاصيل ${center.name}`,
                                            });
                                          }}
                                        >
                                          <Info className="h-4 w-4 text-primary" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>عرض التفاصيل</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Grouped View */}
                  {viewMode === "grouped" && (
                    <div className="space-y-6">
                      {groupedCenters.map(([centerName, locations]) => (
                        <div key={centerName} className="border rounded-lg overflow-hidden bg-card">
                          <div className="bg-primary/5 p-4 border-b">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                              <Building className="h-5 w-5" />
                              {centerName}
                              <span className="text-xs bg-primary/10 rounded-full px-2 py-0.5 text-primary mr-2">
                                {locations.length} {locations.length === 1 ? 'فرع' : 'فروع'}
                              </span>
                            </h3>
                          </div>
                          <div className="p-0">
                            <Table>
                              <TableHeader className="bg-muted/10">
                                <TableRow>
                                  <TableHead className="text-right">المنطقة</TableHead>
                                  <TableHead className="text-right">المدينة</TableHead>
                                  <TableHead className="text-right">الحي</TableHead>
                                  <TableHead className="text-right">جهة الاتصال</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {locations.map((location) => (
                                  <TableRow key={location.id} className="hover:bg-muted/10">
                                    <TableCell className="text-right font-medium">
                                      {location.region}
                                    </TableCell>
                                    <TableCell className="text-right">{location.city}</TableCell>
                                    <TableCell className="text-right">{location.district}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center gap-3 justify-end">
                                        <a 
                                          href={`tel:${location.phone}`} 
                                          className="flex items-center gap-1 hover:text-primary transition-colors text-xs"
                                        >
                                          <Phone className="h-3 w-3" />
                                          {location.phone}
                                        </a>
                                        <a 
                                          href={location.website} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="flex items-center gap-1 hover:text-primary transition-colors text-xs"
                                        >
                                          <Globe className="h-3 w-3" />
                                          الموقع
                                        </a>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-24 bg-muted/20 rounded-xl">
                  <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h3 className="text-xl font-medium mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    جرّب تغيير معايير البحث أو الفلتر لعرض المزيد من النتائج، أو تأكد من صحة المعلومات المدخلة
                  </p>
                </div>
              )}
            </div>
          </div>
        </AnimatedGradientBorder>
      </div>

      {/* Information Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-muted/30 rounded-2xl p-8 text-right">
          <h3 className="text-2xl font-bold mb-4 text-primary">معلومات عن مراكز التدريب</h3>
          <p className="mb-4 text-muted-foreground">
            توفر الهيئة العامة للنقل مجموعة من مراكز التدريب المعتمدة في مختلف مناطق ومدن المملكة. هذه المراكز متخصصة في تقديم خدمات تدريبية متميزة للسائقين المحترفين وفق أفضل المعايير العالمية.
          </p>
          <p className="text-muted-foreground">
            يمكنك استخدام أدوات البحث والفلترة للعثور على المركز المناسب في منطقتك، والاطلاع على بيانات التواصل الخاصة به.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TestCentersSearch;