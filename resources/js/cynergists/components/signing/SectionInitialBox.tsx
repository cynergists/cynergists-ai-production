import { forwardRef } from "react";
import { CheckCircle } from "lucide-react";

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
  ({ sectionNumber, sectionTitle, summary, initials, font, onClick, isActive }, ref) => {
    const isComplete = initials && initials.length > 0;

    return (
      <div
        ref={ref}
        className={`border rounded-lg p-5 transition-all ${
          isActive
            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
            : isComplete
            ? "border-green-500/50 bg-green-500/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-2">
              Section {sectionNumber}: {sectionTitle}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="flex-shrink-0">
            {isComplete ? (
              <div className="flex items-center gap-2">
                <div
                  className={`w-20 h-14 border-2 border-green-500 rounded-lg flex items-center justify-center bg-green-500/10 ${font || ""}`}
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
                className={`w-20 h-14 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 animate-pulse"
                    : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                }`}
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Initial
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SectionInitialBox.displayName = "SectionInitialBox";

export default SectionInitialBox;
