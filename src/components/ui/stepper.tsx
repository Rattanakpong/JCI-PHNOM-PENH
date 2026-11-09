import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {steps.map((label, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isComplete && "bg-brand-teal text-brand-navy",
                isActive && "bg-brand-blue text-white",
                !isComplete && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={cn(
                "hidden whitespace-nowrap text-xs font-medium sm:inline",
                isActive ? "text-brand-navy" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  isComplete ? "bg-brand-teal" : "bg-muted"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
