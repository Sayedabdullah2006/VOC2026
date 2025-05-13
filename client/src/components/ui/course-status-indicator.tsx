import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CourseStatus, type CourseStatusType } from "@shared/schema";

interface CourseStatusIndicatorProps {
  status: CourseStatusType;
  className?: string;
}

const statusConfig: Record<CourseStatusType, {
  emoji: string;
  color: string;
  animation: {
    scale?: number[];
    rotate?: number[];
    opacity?: number[];
    transition: {
      repeat?: number;
      duration: number;
    };
  };
}> = {
  [CourseStatus.SCHEDULED]: {
    emoji: '📅',
    color: 'bg-blue-100 text-blue-800',
    animation: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 2 }
    }
  },
  [CourseStatus.IN_PROGRESS]: {
    emoji: '🎯',
    color: 'bg-green-100 text-green-800',
    animation: {
      scale: [1, 1.2, 1],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  },
  [CourseStatus.COMPLETED]: {
    emoji: '✅',
    color: 'bg-purple-100 text-purple-800',
    animation: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    }
  },
  [CourseStatus.CANCELLED]: {
    emoji: '❌',
    color: 'bg-red-100 text-red-800',
    animation: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.3 }
    }
  }
};

export function CourseStatusIndicator({ status, className }: CourseStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "px-2 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1",
          config.color,
          className
        )}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          ...config.animation
        }}
      >
        <span>{config.emoji}</span>
        <span>{status}</span>
      </motion.div>
    </AnimatePresence>
  );
}