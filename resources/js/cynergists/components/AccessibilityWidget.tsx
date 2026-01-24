import { useState, useEffect } from "react";
import { Accessibility, Plus, Minus, Eye, Zap, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusHighlight, setFocusHighlight] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (focusHighlight) {
      document.documentElement.classList.add("focus-highlight");
    } else {
      document.documentElement.classList.remove("focus-highlight");
    }
  }, [focusHighlight]);

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setReducedMotion(false);
    setFocusHighlight(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen && (
        <div
          className="absolute bottom-16 left-0 w-72 bg-background/95 backdrop-blur-sm border border-border/30 rounded-lg p-4 shadow-xl animate-fade-in"
          role="dialog"
          aria-label="Accessibility options"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Accessibility Options</h3>
          
          {/* Text Size */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">Text Size: {fontSize}%</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.max(75, fontSize - 10))}
                aria-label="Decrease text size"
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((fontSize - 75) / 75) * 100}%` }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                aria-label="Increase text size"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors ${
                highContrast ? "bg-primary/20 text-primary" : "hover:bg-muted"
              }`}
              aria-pressed={highContrast}
            >
              <Eye className="h-4 w-4" />
              <span>High Contrast</span>
            </button>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors ${
                reducedMotion ? "bg-primary/20 text-primary" : "hover:bg-muted"
              }`}
              aria-pressed={reducedMotion}
            >
              <Zap className="h-4 w-4" />
              <span>Reduce Motion</span>
            </button>

            <button
              onClick={() => setFocusHighlight(!focusHighlight)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors ${
                focusHighlight ? "bg-primary/20 text-primary" : "hover:bg-muted"
              }`}
              aria-pressed={focusHighlight}
            >
              <Focus className="h-4 w-4" />
              <span>Focus Highlight</span>
            </button>
          </div>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset All
          </Button>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-background/60 hover:bg-background/80 border border-border/20 flex items-center justify-center transition-all hover:scale-105 shadow-lg"
        aria-label={isOpen ? "Close accessibility options" : "Open accessibility options"}
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default AccessibilityWidget;
