import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckoutProgressProps {
    currentStep: number;
    totalSteps: number;
    stepTitles: string[];
}

const CheckoutProgress = ({
    currentStep,
    totalSteps,
    stepTitles,
}: CheckoutProgressProps) => {
    return (
        <div className="w-full">
            {/* Progress bar */}
            <div className="relative">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{
                            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Step indicators */}
                <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between">
                    {Array.from({ length: totalSteps }, (_, i) => {
                        const stepNumber = i + 1;
                        const isCompleted = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;

                        return (
                            <div
                                key={stepNumber}
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                                    isCompleted &&
                                        'bg-primary text-primary-foreground',
                                    isCurrent &&
                                        'bg-primary text-primary-foreground ring-4 ring-primary/30',
                                    !isCompleted &&
                                        !isCurrent &&
                                        'border border-border bg-muted text-muted-foreground',
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
            <div className="mt-4 hidden justify-between lg:flex">
                {stepTitles.map((title, i) => {
                    const stepNumber = i + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div
                            key={i}
                            className={cn(
                                'max-w-[100px] text-center text-xs',
                                isCompleted || isCurrent
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
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
