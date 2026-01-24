import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const CheckoutProgress = ({ currentStep, totalSteps, stepTitles }: CheckoutProgressProps) => {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={stepNumber}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/30",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground border border-border"
                )}
                title={stepTitles[i]}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step labels - hidden on mobile, shown on larger screens */}
      <div className="hidden lg:flex justify-between mt-4">
        {stepTitles.map((title, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "text-xs text-center max-w-[100px]",
                (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgress;
