import React from "react";
import { Separator } from "@/components/ui/separator";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  variant?: "default" | "modern" | "minimal" | "gradient";
  badge?: string;
  icon?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
  variant = "modern",
  badge,
  icon = <LayoutDashboard className="h-5 w-5" />,
}: DashboardHeaderProps) {
  
  // Default minimal header for backward compatibility
  if (variant === "default") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
            {text && <p className="text-muted-foreground">{text}</p>}
          </div>
          {children}
        </div>
        <Separator />
      </div>
    );
  }

  // Minimal modern header
  if (variant === "minimal") {
    return (
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 hover:scale-110">
              {icon}
            </div>
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
              {text && <p className="text-muted-foreground text-sm">{text}</p>}
            </div>
          </div>
          <div className="shrink-0">
            {children}
          </div>
        </div>
        <Separator className="transition-all duration-500" />
      </div>
    );
  }

  // Gradient border variant
  if (variant === "gradient") {
    return (
      <div className="mb-8">
        <div className="relative p-[1px] rounded-xl overflow-hidden group transition-all duration-300 hover:p-[2px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/40 opacity-70 rounded-xl"></div>
          <div className="relative bg-background rounded-lg p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 hover:scale-110">
                  {icon}
                </div>
                <div className="grid gap-1">
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
              <div className="shrink-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern header (default variant)
  return (
    <div className="relative mb-8">
      {/* Main header container */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden transition-transform duration-300 hover:translate-y-[-2px]",
          "bg-gradient-to-br from-background via-background to-background/80",
          "shadow-sm border border-accent/10 p-6 group"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-11 w-11 rounded-lg border border-border bg-primary/5 flex items-center justify-center text-primary transition-all duration-300 hover:scale-110 hover:rotate-3">
                  {icon}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                  {badge && (
                    <div className="flex items-center mt-1 text-xs text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {badge}
                    </div>
                  )}
                </div>
              </div>
              
              {text && (
                <p className="text-muted-foreground mt-1 max-w-3xl">
                  {text}
                </p>
              )}
            </div>
            
            <div className="shrink-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}