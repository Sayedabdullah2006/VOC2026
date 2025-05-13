import React from "react";
import { Separator } from "@/components/ui/separator";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatedGradientBorder } from "@/components/ui/animated-gradient-border";

interface ModernHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  variant?: "default" | "fancy" | "minimal" | "gradient" | "modern";
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ModernHeader({
  heading,
  text,
  children,
  variant = "modern",
  badge,
  icon = <LayoutDashboard className="h-5 w-5" />,
  className,
}: ModernHeaderProps) {
  // Gradient border variant
  if (variant === "gradient") {
    return (
      <div className={cn("mb-8", className)}>
        <AnimatedGradientBorder 
          gradient="modern"
          intensity="high"
          variant="card"
          containerClassName="w-full"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
                <div className="grid gap-1">
                  <motion.h1 
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {heading}
                  </motion.h1>
                  {text && (
                    <motion.p 
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {text}
                    </motion.p>
                  )}
                  {badge && (
                    <motion.div 
                      className="flex items-center mt-1 text-xs text-primary-foreground"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="bg-primary px-2 py-0.5 rounded-md flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {badge}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                {children}
              </div>
            </div>
          </div>
        </AnimatedGradientBorder>
      </div>
    );
  }

  // Minimal clean variant
  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col gap-4 mb-8", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
              {text && <p className="text-muted-foreground text-sm">{text}</p>}
            </div>
          </div>
          <div className="shrink-0">
            {children}
          </div>
        </div>
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        >
          <Separator className="transition-all duration-500" />
        </motion.div>
      </div>
    );
  }

  // Fancy modern variant with layers
  if (variant === "fancy") {
    return (
      <div className={cn("relative mb-8", className)}>
        {/* Background decorative elements */}
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[200px] h-[200px] rounded-full bg-blue-500/5 blur-3xl opacity-40 pointer-events-none" />
        
        {/* Main header with glass effect */}
        <div className="relative backdrop-blur-sm rounded-2xl overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40 z-0" />
          
          <div className="relative p-8 z-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1 text-right">
                <div className="flex items-center gap-4 mb-3 flex-row-reverse">
                  <motion.div 
                    className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {icon}
                  </motion.div>
                  
                  <div>
                    <motion.h1 
                      className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {heading}
                    </motion.h1>
                    
                    {badge && (
                      <motion.div 
                        className="flex items-center mt-2 text-xs flex-row-reverse"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center font-medium">
                          <Sparkles className="h-3 w-3 ml-2" />
                          {badge}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {text && (
                  <motion.p 
                    className="text-muted-foreground max-w-3xl ml-16 text-lg text-right"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {text}
                  </motion.p>
                )}
              </div>
              
              <div className="shrink-0">
                {children}
              </div>
            </div>
          </div>
          
          {/* Bottom decorative gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
      </div>
    );
  }

  // Modern header (default variant)
  return (
    <div className={cn("relative mb-8", className)}>
      {/* Main header container */}
      <motion.div
        className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-gradient-to-br from-background via-background to-background/80",
          "shadow-sm border border-border/50 p-6 group"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 text-right">
              <div className="flex items-center gap-3 mb-2 flex-row-reverse">
                <motion.div 
                  className="h-11 w-11 rounded-lg border border-border bg-primary/5 flex items-center justify-center text-primary"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.div>
                
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                  {badge && (
                    <div className="flex items-center mt-1 text-xs text-primary flex-row-reverse">
                      <Sparkles className="h-3 w-3 ml-1" />
                      {badge}
                    </div>
                  )}
                </div>
              </div>
              
              {text && (
                <p className="text-muted-foreground mt-1 max-w-3xl text-right">
                  {text}
                </p>
              )}
            </div>
            
            <div className="shrink-0">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ModernHeader;