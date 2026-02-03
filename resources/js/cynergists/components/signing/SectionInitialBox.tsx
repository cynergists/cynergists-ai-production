import { CheckCircle } from 'lucide-react';
import { forwardRef } from 'react';

interface SectionInitialBoxProps {
    sectionNumber: number;
    sectionTitle: string;
    summary: string;
    initials: string | null;
    font: string | null;
    onClick: () => void;
    isActive: boolean;
}

const SectionInitialBox = forwardRef<HTMLDivElement, SectionInitialBoxProps>(
    (
        {
            sectionNumber,
            sectionTitle,
            summary,
            initials,
            font,
            onClick,
            isActive,
        },
        ref,
    ) => {
        const isComplete = initials && initials.length > 0;

        return (
            <div
                ref={ref}
                className={`rounded-lg border p-5 transition-all ${
                    isActive
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : isComplete
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border hover:border-primary/50'
                }`}
            >
                <div className="flex gap-4">
                    <div className="flex-1">
                        <h3 className="mb-2 text-base font-semibold">
                            Section {sectionNumber}: {sectionTitle}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {summary}
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        {isComplete ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-14 w-20 items-center justify-center rounded-lg border-2 border-green-500 bg-green-500/10 ${font || ''}`}
                                >
                                    <span className="text-xl text-green-700 dark:text-green-400">
                                        {initials}
                                    </span>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                        ) : (
                            <button
                                onClick={onClick}
                                className={`flex h-14 w-20 items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                                    isActive
                                        ? 'animate-pulse border-primary bg-primary/10'
                                        : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
                                }`}
                            >
                                <span className="text-xs tracking-wide text-muted-foreground uppercase">
                                    Initial
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

SectionInitialBox.displayName = 'SectionInitialBox';

export default SectionInitialBox;
