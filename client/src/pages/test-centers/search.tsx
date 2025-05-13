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

// بيانات المراكز المعتمدة من الملف المرفق
const testCentersData = [
  {
    id: 1,
    name: "معهد الرؤية العالمية للتدريب",
    shortName: "معهد الرؤية العالمية للتدريب",
    region: "مكة المكرمة",
    city: "جدة",
    district: "النهضة",
    status: "معتمد",
    phone: "",
    website: "https://tivi.edu.sa/",
    email: "k.farouq@ifmi.com.sa"
  },
  {
    id: 2,
    name: "معهد لوجستيات الشرق الأوسط العالي للتدريب",
    shortName: "معهد لوجستيات الشرق الأوسط العالي للتدريب",
    region: "الشرقيه",
    city: "الدمام",
    district: "الشاطئ الغربي",
    status: "معتمد",
    phone: "",
    website: "https://meli.edu.sa/",
    email: "dtc@meli.edu.sa"
  },
  {
    id: 3,
    name: "شركة اشراقات المملكة للتدريب",
    shortName: "شركة اشراقات المملكة للتدريب",
    region: "مكة المكرمة",
    city: "جدة",
    district: "الصفا",
    status: "معتمد",
    phone: "",
    website: "https://www.eshraqat.com.sa/",
    email: "m.jezani@hotmail.com"
  },
  {
    id: 4,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "الربيع",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 5,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "البطحاء",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 6,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "السويدي",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 7,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "النسيم",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 8,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الرياض",
    city: "الخرج",
    district: "المنتزه",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 9,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "مكة المكرمة",
    city: "الطائف",
    district: "الربيع",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 10,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "القصيم",
    city: "بريدة",
    district: "المنتزه",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 11,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الشرقيه",
    city: "حفر الباطن",
    district: "المحمدية",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 12,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "حائل",
    city: "حائل",
    district: "النقرة",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 13,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "جازان",
    city: "جازان",
    district: "الروضة",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 14,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "عسير",
    city: "خميس مشيط",
    district: "الفتح",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 15,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "تبوك",
    city: "تبوك",
    district: "الورود",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 16,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الشرقيه",
    city: "الجبيل",
    district: "ميناء الملك فهد",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 17,
    name: "الأركان للتدريب",
    shortName: "الأركان للتدريب",
    region: "الشرقيه",
    city: "الأحساء",
    district: "الهفوف",
    status: "معتمد",
    phone: "",
    website: "https://www.alarkkan.net/",
    email: "nezar@alarkkan.net"
  },
  {
    id: 18,
    name: "المعهد السعودي الأمريكي العالي",
    shortName: "المعهد السعودي الأمريكي العالي",
    region: "نجران",
    city: "نجران",
    district: "الفيصلية",
    status: "معتمد",
    phone: "",
    website: "https://www.sai.edu.sa/",
    email: "dhaferbishr@gmail.com"
  },
  {
    id: 19,
    name: "معهد المحترفون الرقمي العالي للتدريب",
    shortName: "معهد المحترفون الرقمي العالي للتدريب",
    region: "نجران",
    city: "نجران",
    district: "الفيصلية",
    status: "معتمد",
    phone: "",
    website: "https://salla.sa/dpi.com",
    email: "dpinstitu@gmail.com"
  },
  {
    id: 20,
    name: "معهد مقايس المعرفة العالي للتدريب",
    shortName: "معهد مقايس المعرفة العالي للتدريب",
    region: "حائل",
    city: "حائل",
    district: "الجامعيين",
    status: "معتمد",
    phone: "",
    website: "https://miqyas.edu.sa/",
    email: "info@miqyas.edu.sa"
  },
  {
    id: 21,
    name: "معهد الفاو - المتقدم العالي للتدريب",
    shortName: "معهد الفاو - المتقدم العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "النسيم الشرقي",
    status: "معتمد",
    phone: "",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 22,
    name: "معهد الفاو - المتقدم العالي للتدريب",
    shortName: "معهد الفاو - المتقدم العالي للتدريب",
    region: "الشرقيه",
    city: "حفر الباطن",
    district: "العزيزية",
    status: "معتمد",
    phone: "",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 23,
    name: "معهد الفاو - المتقدم العالي للتدريب",
    shortName: "معهد الفاو - المتقدم العالي للتدريب",
    region: "الشرقيه",
    city: "حفر الباطن",
    district: "التلال",
    status: "معتمد",
    phone: "",
    website: "http://www.alfaoinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 24,
    name: "المعهد الأهلي العالي للتدريب",
    shortName: "المعهد الأهلي العالي للتدريب",
    region: "الحدود الشمالية",
    city: "عرعر",
    district: "المطار",
    status: "معتمد",
    phone: "",
    website: "https://nationalinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 25,
    name: "المعهد الأهلي العالي للتدريب",
    shortName: "المعهد الأهلي العالي للتدريب",
    region: "الجوف",
    city: "القريات",
    district: "حصيدة",
    status: "معتمد",
    phone: "",
    website: "https://nationalinst.com/",
    email: "faris@ararhni.com"
  },
  {
    id: 26,
    name: "معهد جدة الدولي العالي للتدريب",
    shortName: "معهد جدة الدولي العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "الربوة",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 27,
    name: "معهد جدة الدولي العالي للتدريب",
    shortName: "معهد جدة الدولي العالي للتدريب",
    region: "مكة المكرمة",
    city: "مكة المكرمة",
    district: "الزاهر",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 28,
    name: "معهد جدة الدولي العالي للتدريب",
    shortName: "معهد جدة الدولي العالي للتدريب",
    region: "مكة المكرمة",
    city: "مكة المكرمة",
    district: "الشوقية",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 29,
    name: "معهد جدة الدولي العالي للتدريب",
    shortName: "معهد جدة الدولي العالي للتدريب",
    region: "مكة المكرمة",
    city: "جدة",
    district: "الحمراء",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 30,
    name: "معهد جدة الدولي العالي للتدريب",
    shortName: "معهد جدة الدولي العالي للتدريب",
    region: "مكة المكرمة",
    city: "جدة",
    district: "الصفاء",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 31,
    name: "المركز البريطاني الدولي لتعليم اللغة الإنجليزية",
    shortName: "المركز البريطاني الدولي لتعليم اللغة الإنجليزية",
    region: "مكة المكرمة",
    city: "جدة",
    district: "الرويس",
    status: "معتمد",
    phone: "",
    website: "https://www.mharat.edu.sa/",
    email: "ahmedz@mharat.com.sa"
  },
  {
    id: 32,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "العقيق",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 33,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "الرياض",
    city: "الخرج",
    district: "الخالدية",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 34,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "القصيم",
    city: "بريدة",
    district: "الصفراء",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 35,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "حائل",
    city: "حائل",
    district: "المنتزة الغربي",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 36,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "المدينة المنورة",
    city: "المدينة المنورة",
    district: "سلطانة",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 37,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "تبوك",
    city: "تبوك",
    district: "الصالحية",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 38,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "عسير",
    city: "خميس مشيط",
    district: "الدوحة",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 39,
    name: "معهد المساندة العالي للتدريب",
    shortName: "معهد المساندة العالي للتدريب",
    region: "الجوف",
    city: "سكاكا",
    district: "المحمدية",
    status: "معتمد",
    phone: "",
    website: "https://www.almosanadah.edu.sa/",
    email: "almosanadah.hail@gmail.com"
  },
  {
    id: 40,
    name: "المعهد السعودي المتخصص العالي للتدريب",
    shortName: "المعهد السعودي المتخصص العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "الحمراء",
    status: "معتمد",
    phone: "",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 41,
    name: "المعهد السعودي المتخصص العالي للتدريب",
    shortName: "المعهد السعودي المتخصص العالي للتدريب",
    region: "الشرقيه",
    city: "حفر الباطن",
    district: "المصيف",
    status: "معتمد",
    phone: "",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 42,
    name: "المعهد السعودي المتخصص العالي للتدريب",
    shortName: "المعهد السعودي المتخصص العالي للتدريب",
    region: "الشرقيه",
    city: "حفر الباطن",
    district: "الواحة",
    status: "معتمد",
    phone: "",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 43,
    name: "المعهد السعودي المتخصص العالي للتدريب",
    shortName: "المعهد السعودي المتخصص العالي للتدريب",
    region: "الجوف",
    city: "سكاكا",
    district: "العزيزية",
    status: "معتمد",
    phone: "",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 44,
    name: "المعهد السعودي المتخصص العالي للتدريب",
    shortName: "المعهد السعودي المتخصص العالي للتدريب",
    region: "عسير",
    city: "خميس مشيط",
    district: "الظرفة",
    status: "معتمد",
    phone: "",
    website: "https://sstli.com/",
    email: "saudi_institute@sstli.com"
  },
  {
    id: 45,
    name: "يلو أكاديمي",
    shortName: "يلو أكاديمي",
    region: "الرياض",
    city: "الرياض",
    district: "الياسمين",
    status: "معتمد",
    phone: "",
    website: "https://yelo-academy.com/",
    email: "m.aljohani@yeloacademy.com"
  },
  {
    id: 46,
    name: "معهد مهارات السعودية العالي للتدريب",
    shortName: "معهد مهارات السعودية العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "العليا",
    status: "معتمد",
    phone: "",
    website: "https://www.saudi-skills.com/",
    email: "ahd.khalaf2009@yahoo.com"
  },
  {
    id: 47,
    name: "معهد الأكاديمية الدولية المتخصصة لتدريب وتنمية الموارد البشرية",
    shortName: "معهد الأكاديمية الدولية المتخصصة لتدريب وتنمية الموارد البشرية",
    region: "الرياض",
    city: "الرياض",
    district: "الحمراء",
    status: "معتمد",
    phone: "",
    website: "https://ihracademy.com/",
    email: "falah@ihr.sa"
  },
  {
    id: 48,
    name: "معهد البيان العالي للتدريب",
    shortName: "معهد البيان العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "الخليج",
    status: "معتمد",
    phone: "",
    website: "https://bgitd.com/",
    email: "info@bgitd.com"
  },
  {
    id: 49,
    name: "معهد مداد العلم العالي للتدريب",
    shortName: "معهد مداد العلم العالي للتدريب",
    region: "الرياض",
    city: "الرياض",
    district: "الضباط",
    status: "معتمد",
    phone: "",
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
      {/* Header space for global header */}
      
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
                                    <span>زيارة الموقع الإلكتروني</span>
                                    <ExternalLink className="h-4 w-4 mr-2" />
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
                    <div className="border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">اسم المركز</TableHead>
                            <TableHead className="text-right">المنطقة</TableHead>
                            <TableHead className="text-right">المدينة</TableHead>
                            <TableHead className="text-right">الحي</TableHead>
                            <TableHead className="text-right">التواصل</TableHead>
                            <TableHead className="text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCenters.map((center) => (
                            <TableRow key={center.id}>
                              <TableCell className="font-medium text-right">
                                {center.name}
                              </TableCell>
                              <TableCell className="text-right">{center.region}</TableCell>
                              <TableCell className="text-right">{center.city}</TableCell>
                              <TableCell className="text-right">{center.district}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  {center.phone && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <a href={`tel:${center.phone}`}>
                                            <Button size="icon" variant="ghost">
                                              <Phone className="h-4 w-4" />
                                            </Button>
                                          </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p dir="ltr">{center.phone}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {center.email && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <a href={`mailto:${center.email}`}>
                                            <Button size="icon" variant="ghost">
                                              <Mail className="h-4 w-4" />
                                            </Button>
                                          </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p dir="ltr">{center.email}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {center.website && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex flex-row-reverse items-center gap-1"
                                    onClick={() => window.open(center.website, "_blank")}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    <span>الموقع</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Grouped View */}
                  {viewMode === "grouped" && (
                    <div className="space-y-8">
                      {groupedCenters.map(([centerName, branches], index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-2xl font-bold text-primary mb-4 text-right">
                                {centerName}
                              </h3>
                              
                              <div className="border rounded-xl overflow-hidden mt-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-right">المنطقة</TableHead>
                                      <TableHead className="text-right">المدينة</TableHead>
                                      <TableHead className="text-right">الحي</TableHead>
                                      <TableHead className="text-right">معلومات التواصل</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {branches.map((branch) => (
                                      <TableRow key={branch.id}>
                                        <TableCell className="text-right">{branch.region}</TableCell>
                                        <TableCell className="text-right">{branch.city}</TableCell>
                                        <TableCell className="text-right">{branch.district}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex flex-col gap-2">
                                            {branch.phone && (
                                              <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-[#0C7D99]" />
                                                <a href={`tel:${branch.phone}`} className="hover:text-primary">
                                                  {branch.phone}
                                                </a>
                                              </div>
                                            )}
                                            {branch.email && (
                                              <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-[#0D9C65]" />
                                                <a href={`mailto:${branch.email}`} className="hover:text-primary truncate">
                                                  {branch.email}
                                                </a>
                                              </div>
                                            )}
                                            {branch.website && (
                                              <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-[#0C7D99]" />
                                                <a
                                                  href={branch.website}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="hover:text-primary truncate"
                                                >
                                                  {branch.website}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    لم يتم العثور على مراكز تدريب تطابق معايير البحث. يرجى تعديل معايير البحث وإعادة المحاولة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </AnimatedGradientBorder>
        
        {/* About Test Centers */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground">عن مراكز التدريب المعتمدة</h2>
          <p className="mb-4 text-muted-foreground">
            توفر الهيئة العامة للنقل مجموعة من مراكز التدريب المعتمدة في مختلف مناطق ومدن المملكة. هذه المراكز متخصصة في تقديم خدمات تدريبية متميزة للسائقين المحترفين وفق أفضل المعايير العالمية.
          </p>
          <p className="text-muted-foreground">
            يمكنك استخدام أدوات البحث والفلترة للعثور على المركز المناسب في منطقتك، والاطلاع على بيانات التواصل الخاصة به.
          </p>
        </div>
      </div>

      {/* Footer is now managed globally */}
    </div>
  );
};

export default TestCentersSearch;