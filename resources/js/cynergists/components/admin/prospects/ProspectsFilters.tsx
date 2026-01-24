import { X } from "lucide-react";
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

interface ProspectsFiltersProps {
  activeFilters: Record<string, string>;
  onFilterChange: (column: string, value: string) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "cold", label: "Cold" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
];

const SDR_SET_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export function ProspectsFilters({
  activeFilters,
  onFilterChange,
  onClearFilters,
}: ProspectsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-3 w-3 mr-1" />
          Clear all
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

        {/* Company filter */}
        <div className="space-y-1">
          <Label className="text-xs">Company</Label>
          <Input
            placeholder="Filter by company..."
            value={activeFilters.company || ""}
            onChange={(e) => onFilterChange("company", e.target.value)}
          />
        </div>

        {/* Services filter */}
        <div className="space-y-1">
          <Label className="text-xs">Services</Label>
          <Input
            placeholder="Filter by services..."
            value={activeFilters.services || ""}
            onChange={(e) => onFilterChange("services", e.target.value)}
          />
        </div>

        {/* Source filter */}
        <div className="space-y-1">
          <Label className="text-xs">Source</Label>
          <Input
            placeholder="Filter by source..."
            value={activeFilters.lead_source || ""}
            onChange={(e) => onFilterChange("lead_source", e.target.value)}
          />
        </div>

        {/* Sales filter */}
        <div className="space-y-1">
          <Label className="text-xs">Sales</Label>
          <Input
            placeholder="Filter by sales..."
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

        {/* SDR Set filter */}
        <div className="space-y-1">
          <Label className="text-xs">SDR Set</Label>
          <Select
            value={activeFilters.sdr_set || "all"}
            onValueChange={(value) => onFilterChange("sdr_set", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SDR Set" />
            </SelectTrigger>
            <SelectContent>
              {SDR_SET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>
      </ScrollArea>
    </div>
  );
}