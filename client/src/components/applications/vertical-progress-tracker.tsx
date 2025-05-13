import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
}

interface VerticalProgressTrackerProps {
  steps: ProgressStep[];
  className?: string;
}

export function VerticalProgressTracker({ steps, className }: VerticalProgressTrackerProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">مراحل الطلب</h3>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex mb-8 last:mb-0 relative">
              {/* خط العملية العمودي */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-3.5 top-7 bottom-0 w-0.5",
                    {
                      "bg-green-500": step.status === "completed",
                      "bg-orange-500": step.status === "current",
                      "bg-gray-200": step.status === "pending",
                      "bg-red-500": step.status === "rejected",
                    }
                  )}
                />
              )}

              {/* رمز حالة المرحلة */}
              <div className="ml-4 flex items-start">
                <div className="relative z-10">
                  {step.status === "completed" && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  {step.status === "current" && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 border-2 border-orange-400">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                  {step.status === "pending" && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-400 border border-gray-300">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                    </div>
                  )}
                  {step.status === "rejected" && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600">
                      <XCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* معلومات المرحلة */}
              <div className="flex-1">
                <h4 className={cn(
                    "font-medium mb-1",
                    {
                      "text-green-700": step.status === "completed",
                      "text-orange-700": step.status === "current",
                      "text-gray-600": step.status === "pending",
                      "text-red-700": step.status === "rejected",
                    }
                  )}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-sm text-gray-500">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}