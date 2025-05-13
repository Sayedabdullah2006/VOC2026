import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  gradient?: "primary" | "modern" | "blue" | "green" | "purple" | "rainbow";
  intensity?: "low" | "default" | "high";
  variant?: "default" | "card" | "glow";
  className?: string;
  containerClassName?: string;
  borderRadius?: string;
  borderWidth?: string;
  animate?: boolean;
}

export function AnimatedGradientBorder({
  children,
  gradient = "primary",
  intensity = "default",
  variant = "default",
  className = "",
  containerClassName = "",
  borderRadius = "rounded-xl",
  borderWidth = "border-[1px]",
  animate = true,
}: AnimatedGradientBorderProps) {
  // Gradient mapping
  const gradientMap = {
    primary: "from-primary via-primary-light to-primary",
    modern: "from-primary via-primary-dark to-primary-light",
    blue: "from-blue-500 via-blue-300 to-blue-600",
    green: "from-green-400 via-green-300 to-green-500",
    purple: "from-purple-600 via-purple-400 to-purple-700",
    rainbow: "from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
  };

  // Intensity mapping
  const intensityMap = {
    low: {
      blur: "blur-sm",
      opacity: "opacity-30",
      glow: "shadow-sm",
    },
    default: {
      blur: "blur-md",
      opacity: "opacity-50",
      glow: "shadow-md",
    },
    high: {
      blur: "blur-lg",
      opacity: "opacity-70",
      glow: "shadow-lg",
    },
  };

  // Variant mapping
  const variantMap = {
    default: "",
    card: "shadow-md",
    glow: `${intensityMap[intensity].glow} shadow-primary/30`,
  };

  // Animation settings
  const animationProps = animate
    ? {
        animate: {
          backgroundPosition: ["0% 0%", "100% 100%"],
        },
        transition: {
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "linear",
        },
      }
    : {};

  return (
    <div className={cn("relative", containerClassName)}>
      <motion.div
        className={cn(
          "absolute -inset-[1px] rounded-xl",
          borderRadius,
          `bg-gradient-to-r ${gradientMap[gradient]}`,
          intensityMap[intensity].blur,
          intensityMap[intensity].opacity,
          "bg-[length:200%_200%]"
        )}
        {...animationProps}
      />
      <div
        className={cn(
          "relative",
          borderRadius,
          borderWidth,
          "border-transparent bg-white dark:bg-black",
          variantMap[variant],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}