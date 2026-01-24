import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface InitialsFontPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (initials: string, font: string) => void;
  defaultInitials: string;
  sectionTitle: string;
}

const CURSIVE_FONTS = [
  { name: "Dancing Script", className: "font-dancing" },
  { name: "Great Vibes", className: "font-great-vibes" },
  { name: "Pacifico", className: "font-pacifico" },
  { name: "Satisfy", className: "font-satisfy" },
];

const InitialsFontPicker = ({
  isOpen,
  onClose,
  onConfirm,
  defaultInitials,
  sectionTitle,
}: InitialsFontPickerProps) => {
  const [initials, setInitials] = useState(defaultInitials);
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0].className);

  useEffect(() => {
    if (isOpen) {
      setInitials(defaultInitials);
    }
  }, [isOpen, defaultInitials]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (initials.trim().length > 0) {
      onConfirm(initials.toUpperCase(), selectedFont);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Initial Section</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">{sectionTitle}</p>

          <div className="space-y-2">
            <Label htmlFor="initials-input">Your Initials</Label>
            <Input
              id="initials-input"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              placeholder="Enter your initials"
              className="text-center text-2xl uppercase tracking-widest"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>Choose a Style</Label>
            <div className="grid grid-cols-2 gap-3">
              {CURSIVE_FONTS.map((font) => (
                <button
                  key={font.className}
                  onClick={() => setSelectedFont(font.className)}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedFont === font.className
                      ? "border-primary bg-primary/10 ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className={`text-3xl ${font.className}`}>
                    {initials || "AB"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={initials.trim().length === 0}
          >
            Confirm Initial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InitialsFontPicker;
