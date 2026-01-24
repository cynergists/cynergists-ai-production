import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, setAsDefault: boolean) => void;
  existingViewNames: string[];
  defaultName?: string;
}

export function SaveViewDialog({
  open,
  onOpenChange,
  onSave,
  existingViewNames,
  defaultName = "",
}: SaveViewDialogProps) {
  const [viewName, setViewName] = useState(defaultName);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setViewName(defaultName);
      setSetAsDefault(false);
      setError("");
    }
  }, [open, defaultName]);

  const handleSave = () => {
    const trimmedName = viewName.trim();
    
    if (!trimmedName) {
      setError("Please enter a name for the view");
      return;
    }

    if (existingViewNames.includes(trimmedName) && trimmedName !== defaultName) {
      setError("A view with this name already exists");
      return;
    }

    onSave(trimmedName, setAsDefault);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Custom View</DialogTitle>
          <DialogDescription>
            Give your view a name to save your current column settings, filters, and sort order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="view-name">View Name</Label>
            <Input
              id="view-name"
              value={viewName}
              onChange={(e) => {
                setViewName(e.target.value);
                setError("");
              }}
              placeholder="Enter view name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="set-default"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(checked === true)}
            />
            <Label htmlFor="set-default" className="text-sm font-normal cursor-pointer">
              Set as default view (loads automatically)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save View</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
