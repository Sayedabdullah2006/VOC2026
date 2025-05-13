import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ModernCardProps {
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  header?: ReactNode;
  footer?: ReactNode;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  glassmorphism?: boolean;
  borderGradient?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  header,
  footer,
  hover = true,
  glow = false,
  glowColor = "var(--primary)",
  glassmorphism = false,
  borderGradient = false,
  shadow = "md",
}) => {
  // Card shadow classes
  const getShadowClass = () => {
    switch (shadow) {
      case "none": return "";
      case "sm": return "shadow-sm";
      case "lg": return "shadow-lg";
      case "md":
      default: return "shadow-md";
    }
  };

  // Hover effect animation
  const hoverAnimation = hover
    ? {
        whileHover: {
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        },
      }
    : {};

  // Glow effect style
  const glowStyle = glow
    ? {
        boxShadow: `0 0 15px 2px ${glowColor}`,
      }
    : {};

  // Glassmorphism effect classes
  const glassmorphismClasses = glassmorphism
    ? "bg-background/80 backdrop-blur-sm border-white/20"
    : "bg-background";

  // Border gradient
  const borderGradientClasses = borderGradient
    ? "border-transparent bg-gradient-to-br from-primary/20 to-secondary/20 p-[1px]"
    : "border border-border";

  // Create card base
  const CardBase = borderGradient ? (
    <div className={cn("rounded-xl", borderGradientClasses)}>
      <motion.div
        className={cn(
          "rounded-[calc(0.75rem-1px)] overflow-hidden",
          glassmorphismClasses,
          getShadowClass(),
          className
        )}
        style={glowStyle}
        {...hoverAnimation}
      >
        {header && <CardHeader className={headerClassName}>{header}</CardHeader>}
        <CardContent className={cn("pt-0", !header && "pt-6", contentClassName)}>
          {children}
        </CardContent>
        {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
      </motion.div>
    </div>
  ) : (
    <motion.div
      className={cn(
        "rounded-xl overflow-hidden",
        glassmorphismClasses,
        getShadowClass(),
        className
      )}
      style={glowStyle}
      {...hoverAnimation}
    >
      {header && <CardHeader className={headerClassName}>{header}</CardHeader>}
      <CardContent className={cn("pt-0", !header && "pt-6", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className={footerClassName}>{footer}</CardFooter>}
    </motion.div>
  );

  return CardBase;
};