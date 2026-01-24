import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientsFiltersProps {
  activeFilters: Record<string, string>;
  onFilterChange: (column: string, value: string) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past Due" },
  { value: "terminated", label: "Terminated" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "one-time", label: "One-Time" },
];

export function ClientsFilters({
  activeFilters,
  onFilterChange,
  onClearFilters,
}: ClientsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-3">
        {/* Status filter */}
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={activeFilters.status || "all"}
            onValueChange={(value) => onFilterChange("status", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Type filter */}
        <div className="space-y-1">
          <Label className="text-xs">Payment Type</Label>
          <Select
            value={activeFilters.payment_type || "all"}
            onValueChange={(value) => onFilterChange("payment_type", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company filter */}
        <div className="space-y-1">
          <Label className="text-xs">Company</Label>
          <Input
            placeholder="Filter by company..."
            value={activeFilters.company || ""}
            onChange={(e) => onFilterChange("company", e.target.value)}
          />
        </div>

        {/* Sales Rep filter */}
        <div className="space-y-1">
          <Label className="text-xs">Sales Rep</Label>
          <Input
            placeholder="Filter by sales rep..."
            value={activeFilters.sales_rep || ""}
            onChange={(e) => onFilterChange("sales_rep", e.target.value)}
          />
        </div>

        {/* Partner filter */}
        <div className="space-y-1">
          <Label className="text-xs">Partner</Label>
          <Input
            placeholder="Filter by partner..."
            value={activeFilters.partner_name || ""}
            onChange={(e) => onFilterChange("partner_name", e.target.value)}
          />
        </div>

        {/* Tags filter */}
        <div className="space-y-1">
          <Label className="text-xs">Tag</Label>
          <Input
            placeholder="Filter by tag..."
            value={activeFilters.tags || ""}
            onChange={(e) => onFilterChange("tags", e.target.value)}
          />
        </div>
        </div>
      </ScrollArea>
    </div>
  );
}
