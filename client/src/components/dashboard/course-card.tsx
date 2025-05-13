import { Course } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: Course;
  onAction?: () => void;
  actionLabel?: string;
  enrollmentCount?: number;
}

const statusColors = {
  'قيد التسجيل': 'bg-yellow-100 text-yellow-800',
  'مكتملة التسجيل': 'bg-blue-100 text-blue-800',
  'قيد التنفيذ': 'bg-green-100 text-green-800',
  'معلقة': 'bg-orange-100 text-orange-800',
  'منتهية': 'bg-gray-100 text-gray-800',
  'ملغاة': 'bg-red-100 text-red-800'
} as const;

export default function CourseCard({ course, onAction, actionLabel, enrollmentCount = 0 }: CourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle>{course.title}</CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[course.status as keyof typeof statusColors]}`}>
            {course.status}
          </span>
        </div>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} ساعة</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{enrollmentCount} / {course.capacity} متدرب</span>
            </div>
          </div>
          {actionLabel && onAction && (
            <Button onClick={onAction} className="w-full">
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}