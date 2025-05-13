import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { AnimatedBackgroundPattern } from "@/components/ui/animated-background-pattern";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";

interface ModernDashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
  variant?: "default" | "gradient" | "pattern";
}

export function ModernDashboardHeader({
  heading,
  text,
  children,
  badge,
  icon = <LayoutDashboard className="h-5 w-5" />,
  variant = "default",
}: ModernDashboardHeaderProps) {
  
  // Gradient variant
  if (variant === "gradient") {
    return (
      <div className="mb-8">
        <AnimatedGradientBorder
          intensity="default"
          animationDuration={12}
          borderRadius="0.75rem"
          className="p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary"
              >
                {icon}
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                {text && <p className="text-muted-foreground">{text}</p>}
                {badge && (
                  <div className="flex items-center mt-1 text-xs text-primary-foreground">
                    <div className="bg-primary px-2 py-0.5 rounded-md flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {badge}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </AnimatedGradientBorder>
      </div>
    );
  }
  
  // Pattern variant
  if (variant === "pattern") {
    return (
      <div className="relative mb-8">
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <AnimatedBackgroundPattern 
            variant="dots" 
            opacity={0.05} 
            density="medium" 
          />
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-xl overflow-hidden border border-accent/10 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary"
              >
                {icon}
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                {text && <p className="text-muted-foreground">{text}</p>}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Default variant
  return (
    <div className="relative mb-8">
      {/* Background pattern */}
      <AnimatedBackgroundPattern 
        variant="dots" 
        opacity={0.05} 
        density="medium" 
        direction="random"
      />
      
      {/* Main header container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-gradient-to-br from-background via-background to-background/80",
          "shadow-sm backdrop-blur-[2px] border border-accent/10 p-6"
        )}
      >
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="h-11 w-11 rounded-lg border border-border bg-primary/5 flex items-center justify-center text-primary"
                >
                  {icon}
                </motion.div>
                
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                  {badge && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center mt-1 text-xs text-primary"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {badge}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {text && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-muted-foreground mt-1 max-w-3xl"
                >
                  {text}
                </motion.p>
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="shrink-0"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}