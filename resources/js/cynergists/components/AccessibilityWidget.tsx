import { Button } from '@/components/ui/button';
import { Accessibility, Eye, Focus, Minus, Plus, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

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
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        if (reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }, [reducedMotion]);

    useEffect(() => {
        if (focusHighlight) {
            document.documentElement.classList.add('focus-highlight');
        } else {
            document.documentElement.classList.remove('focus-highlight');
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
                    className="animate-fade-in absolute bottom-16 left-0 w-72 rounded-lg border border-border/30 bg-background/95 p-4 shadow-xl backdrop-blur-sm"
                    role="dialog"
                    aria-label="Accessibility options"
                >
                    <h3 className="mb-4 text-sm font-semibold text-foreground">
                        Accessibility Options
                    </h3>

                    {/* Text Size */}
                    <div className="mb-4">
                        <label className="mb-2 block text-xs text-muted-foreground">
                            Text Size: {fontSize}%
                        </label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setFontSize(Math.max(75, fontSize - 10))
                                }
                                aria-label="Decrease text size"
                                className="h-8 w-8 p-0"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${((fontSize - 75) / 75) * 100}%`,
                                    }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setFontSize(Math.min(150, fontSize + 10))
                                }
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
                            className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors ${
                                highContrast
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-muted'
                            }`}
                            aria-pressed={highContrast}
                        >
                            <Eye className="h-4 w-4" />
                            <span>High Contrast</span>
                        </button>

                        <button
                            onClick={() => setReducedMotion(!reducedMotion)}
                            className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors ${
                                reducedMotion
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-muted'
                            }`}
                            aria-pressed={reducedMotion}
                        >
                            <Zap className="h-4 w-4" />
                            <span>Reduce Motion</span>
                        </button>

                        <button
                            onClick={() => setFocusHighlight(!focusHighlight)}
                            className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors ${
                                focusHighlight
                                    ? 'bg-primary/20 text-primary'
                                    : 'hover:bg-muted'
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
                        className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                        Reset All
                    </Button>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border/20 bg-background/60 shadow-lg transition-all hover:scale-105 hover:bg-background/80"
                aria-label={
                    isOpen
                        ? 'Close accessibility options'
                        : 'Open accessibility options'
                }
                aria-expanded={isOpen}
            >
                <Accessibility className="h-5 w-5 text-muted-foreground" />
            </button>
        </div>
    );
};

export default AccessibilityWidget;
