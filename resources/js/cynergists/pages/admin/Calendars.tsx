import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Plus, Loader2, Filter, X } from 'lucide-react';
import { Input } from '@cy/components/ui/input';
import { Button } from '@cy/components/ui/button';
import { Label } from '@cy/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@cy/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@cy/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cy/components/ui/select';
import { CalendarsMetricsSummary } from '@cy/components/admin/calendars/CalendarsMetricsSummary';
import { CalendarsTable } from '@cy/components/admin/calendars/CalendarsTable';
import { CalendarDrawer } from '@cy/components/admin/calendars/CalendarDrawer';
import { CreateCalendarForm } from '@cy/components/admin/calendars/CreateCalendarForm';

import { useCalendarViewPreferences } from '@cy/hooks/useCalendarViewPreferences';
import {
  useCalendarsList,
  useCreateCalendar,
  useUpdateCalendar,
  useDeleteCalendar,
  type Calendar,
  type CalendarFormData,
} from '@cy/hooks/useCalendarsList';

export default function Calendars() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('calendar_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  

  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const {
    columnWidths,
    setColumnWidth,
    visibleColumns,
    isLoading: prefsLoading,
  } = useCalendarViewPreferences();

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  };

  const apiFilters = {
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.calendar_type && filters.calendar_type !== 'all' && { calendar_type: filters.calendar_type }),
  };

  const { data, isLoading } = useCalendarsList({
    search: debouncedSearch,
    sortColumn,
    sortDirection,
    page,
    pageSize: rowsPerPage,
    filters: apiFilters,
  });

  const createCalendar = useCreateCalendar();
  const updateCalendar = useUpdateCalendar();
  const deleteCalendar = useDeleteCalendar();

  const calendars = data?.calendars || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / rowsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCalendarClick = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setDrawerOpen(true);
  };

  const handleInlineUpdate = (id: string, field: string, value: string) => {
    updateCalendar.mutate({ id, [field]: value });
  };

  const handleCreate = (data: CalendarFormData) => {
    createCalendar.mutate(data);
  };

  const handleUpdate = (id: string, data: Partial<CalendarFormData>) => {
    updateCalendar.mutate({ id, ...data });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this calendar?')) {
      deleteCalendar.mutate(id);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      if (!value || value === 'all') {
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
    setRowsPerPage(parseInt(value));
    setPage(1);
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
        <title>Calendars | Admin</title>
      </Helmet>

      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Sticky Header Section */}
        <div className="flex-shrink-0 p-6 pb-4 space-y-4 bg-background">
          {/* Metrics Summary */}
          <CalendarsMetricsSummary calendars={calendars} />

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Calendars</h1>
                <p className="text-sm text-muted-foreground">
                  {total} total calendars
                </p>
              </div>
              
              {/* View Links */}
              <div className="flex items-center gap-1 border-l pl-6">
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-sm"
                >
                  All
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calendars..."
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
                        value={filters.status || "all"}
                        onValueChange={(value) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={filters.calendar_type || "all"}
                        onValueChange={(value) => handleFilterChange("calendar_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="shared">Shared</SelectItem>
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

              {/* Create Calendar */}
              <Button onClick={() => setCreateFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Calendar
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
            <CalendarsTable
              calendars={calendars}
              loading={isLoading}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onCalendarClick={handleCalendarClick}
              onUpdate={handleInlineUpdate}
              onDelete={handleDelete}
              visibleColumns={visibleColumns}
              columnWidths={columnWidths}
              onColumnWidthChange={setColumnWidth}
            />
          </div>
        </div>

        {/* Sticky Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={rowsPerPage.toString()}
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
                Showing {Math.min((page - 1) * rowsPerPage + 1, total)} -{" "}
                {Math.min(page * rowsPerPage, total)} of {total}
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

      {/* Drawer */}
      <CalendarDrawer
        calendar={selectedCalendar}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCalendar(null);
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Create Form */}
      <CreateCalendarForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreate}
      />

    </>
  );
}
