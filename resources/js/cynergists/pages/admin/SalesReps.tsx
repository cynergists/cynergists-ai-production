import { useState } from "react";
import { Helmet } from "react-helmet";
import { Loader2, Search, Filter, Settings2, Plus, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSalesReps, type SalesRep } from "@/hooks/useSalesRepsList";
import { useSalesRepViewPreferences } from "@/hooks/useSalesRepViewPreferences";
import { SalesRepsTable } from "@/components/admin/sales-reps/SalesRepsTable";
import { SalesRepContactCard } from "@/components/admin/sales-reps/SalesRepContactCard";
import { SalesRepsMetricsSummary } from "@/components/admin/sales-reps/SalesRepsMetricsSummary";
import { SaveViewDialog } from "@/components/admin/SaveViewDialog";


export default function SalesReps() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const {
    preferences,
    loading: prefsLoading,
    saveView,
    loadView,
    resetToDefault,
  } = useSalesRepViewPreferences();

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useSalesReps({
    page,
    limit,
    sortColumn,
    sortDirection,
    search: debouncedSearch,
    filters,
  });

  const salesReps = data?.salesReps || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const summary = data?.summary || null;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handleRepClick = (rep: SalesRep) => {
    setSelectedRep(rep);
    setIsAddingNew(false);
    setIsContactCardOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRep(null);
    setIsAddingNew(true);
    setIsContactCardOpen(true);
  };

  const handleCloseContactCard = () => {
    setIsContactCardOpen(false);
    setSelectedRep(null);
    setIsAddingNew(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  const handleSaveView = (name: string, setAsDefault: boolean) => {
    const success = saveView(name, true);
    if (success && setAsDefault) {
      // The saveView already handles setting as active
    }
  };

  const activeFilterCount = Object.keys(filters).length;

  if (prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sales | Admin</title>
      </Helmet>

      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Sticky Header Section */}
        <div className="flex-shrink-0 p-6 pb-4 space-y-4 bg-background">
          {/* Metrics Summary */}
          <SalesRepsMetricsSummary summary={summary} loading={isLoading} />

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sales</h1>
                <p className="text-sm text-muted-foreground">
                  {total} total sales reps
                </p>
              </div>
              
              {/* View Links */}
              <div className="flex items-center gap-1 border-l pl-6">
                <Button
                  variant={preferences.activeViewName === null ? "secondary" : "ghost"}
                  size="sm"
                  onClick={resetToDefault}
                  className="text-sm"
                >
                  All
                </Button>
                {preferences.savedViews.map((view) => (
                  <Button
                    key={view.name}
                    variant={preferences.activeViewName === view.name ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => loadView(view.name)}
                    className="text-sm"
                  >
                    {view.name}
                  </Button>
                ))}
                {preferences.savedViews.length < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSaveViewOpen(true)}
                    className="text-sm text-muted-foreground"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save View
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reps..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              {/* Filters */}
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filters</h4>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filters.status || ""}
                        onValueChange={(value) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {activeFilterCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="w-full"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Add New */}
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sales Rep
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => (
                <Button
                  key={key}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFilterChange(key, "")}
                  className="h-6 text-xs"
                >
                  {key}: {value}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="border rounded-lg h-full overflow-auto">
            <SalesRepsTable
              salesReps={salesReps}
              loading={isLoading}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRepClick={handleRepClick}
            />
          </div>
        </div>

        {/* Sticky Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-4">
                Showing {Math.min((page - 1) * limit + 1, total)} -{" "}
                {Math.min(page * limit, total)} of {total}
              </span>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page + i - 2;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <SalesRepContactCard
        rep={selectedRep}
        isNew={isAddingNew}
        open={isContactCardOpen}
        onClose={handleCloseContactCard}
      />

      <SaveViewDialog
        open={isSaveViewOpen}
        onOpenChange={setIsSaveViewOpen}
        onSave={handleSaveView}
        existingViewNames={preferences.savedViews.map(v => v.name)}
      />
    </>
  );
}
