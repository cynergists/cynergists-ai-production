import { ProspectContactCard } from '@/components/admin/prospects/ProspectContactCard';
import { ProspectsFilters } from '@/components/admin/prospects/ProspectsFilters';
import { ProspectsMetricsSummary } from '@/components/admin/prospects/ProspectsMetricsSummary';
import { ProspectsTable } from '@/components/admin/prospects/ProspectsTable';
import { ProspectsViewSettings } from '@/components/admin/prospects/ProspectsViewSettings';
import { SaveViewDialog } from '@/components/admin/SaveViewDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useProspectsList, type Prospect } from '@/hooks/useProspectsList';
import { useProspectViewPreferences } from '@/hooks/useProspectViewPreferences';
import {
    Filter,
    Loader2,
    Save,
    Search,
    Settings2,
    UserPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

export default function Prospects() {
    const {
        preferences,
        loading: prefsLoading,
        setSort,
        setFilter,
        clearFilters,
        setRowsPerPage,
        setColumnOrder,
        setColumnWidth,
        toggleColumnVisibility,
        saveView,
        loadView,
        deleteView,
        setDefaultView,
        resetToDefault,
    } = useProspectViewPreferences();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
        null,
    );
    const [isContactCardOpen, setIsContactCardOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
    const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    };

    const { prospects, total, totalPages, loading, summary, refetch } =
        useProspectsList({
            page,
            limit: preferences.rowsPerPage,
            sortColumn: preferences.sortColumn,
            sortDirection: preferences.sortDirection,
            search: debouncedSearch,
            filters: preferences.activeFilters,
        });

    const handleProspectClick = (prospect: Prospect) => {
        setSelectedProspect(prospect);
        setIsCreating(false);
        setIsContactCardOpen(true);
    };

    const handleContactCardClose = () => {
        setIsContactCardOpen(false);
        setSelectedProspect(null);
        setIsCreating(false);
    };

    const handleProspectUpdated = () => {
        refetch();
    };

    const handleSort = (column: string) => {
        const newDirection =
            preferences.sortColumn === column &&
            preferences.sortDirection === 'asc'
                ? 'desc'
                : 'asc';
        setSort(column, newDirection);
        setPage(1);
    };

    const handleFilterChange = (column: string, value: string) => {
        setFilter(column, value);
        setPage(1);
    };

    const handleClearFilters = () => {
        clearFilters();
        setPage(1);
    };

    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(parseInt(value));
        setPage(1);
    };

    const handleAddProspect = () => {
        setSelectedProspect(null);
        setIsCreating(true);
        setIsContactCardOpen(true);
    };

    const activeFilterCount = Object.keys(preferences.activeFilters).length;

    if (prefsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Prospects | Admin</title>
            </Helmet>

            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
                <div className="flex-shrink-0 space-y-4 bg-background p-6 pb-4">
                    <ProspectsMetricsSummary
                        summary={summary}
                        loading={loading}
                        hasActiveFilters={
                            activeFilterCount > 0 || debouncedSearch.length > 0
                        }
                    />

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Prospects
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {total} total prospects
                                </p>
                            </div>

                            {/* View Links */}
                            <div className="flex items-center gap-1 border-l pl-6">
                                <Button
                                    variant={
                                        preferences.activeViewName === null
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    onClick={resetToDefault}
                                    className="text-sm"
                                >
                                    All
                                </Button>
                                {preferences.savedViews.map((view) => (
                                    <Button
                                        key={view.name}
                                        variant={
                                            preferences.activeViewName ===
                                            view.name
                                                ? 'secondary'
                                                : 'ghost'
                                        }
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
                                        <Save className="mr-1 h-3 w-3" />
                                        Save View
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search prospects..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    className="w-64 pl-9"
                                />
                            </div>

                            <Popover
                                open={isFiltersOpen}
                                onOpenChange={setIsFiltersOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="relative"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <ProspectsFilters
                                        activeFilters={
                                            preferences.activeFilters
                                        }
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={handleClearFilters}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover
                                open={isViewSettingsOpen}
                                onOpenChange={setIsViewSettingsOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Columns
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <ProspectsViewSettings
                                        columnOrder={preferences.columnOrder}
                                        hiddenColumns={
                                            preferences.hiddenColumns
                                        }
                                        savedViews={preferences.savedViews}
                                        activeViewName={
                                            preferences.activeViewName
                                        }
                                        onColumnOrderChange={setColumnOrder}
                                        onToggleColumn={toggleColumnVisibility}
                                        onLoadView={loadView}
                                        onDeleteView={deleteView}
                                        onResetToDefault={resetToDefault}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button onClick={handleAddProspect}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Prospect
                            </Button>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Active filters:
                            </span>
                            {Object.entries(preferences.activeFilters).map(
                                ([column, value]) => (
                                    <Button
                                        key={column}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            handleFilterChange(column, '')
                                        }
                                        className="h-6 text-xs"
                                    >
                                        {column}: {value}
                                        <X className="ml-1 h-3 w-3" />
                                    </Button>
                                ),
                            )}
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

                <div className="flex-1 overflow-hidden px-6">
                    <div className="h-full overflow-auto rounded-lg border">
                        <ProspectsTable
                            prospects={prospects}
                            loading={loading}
                            columnOrder={preferences.columnOrder}
                            hiddenColumns={preferences.hiddenColumns}
                            columnWidths={preferences.columnWidths}
                            sortColumn={preferences.sortColumn}
                            sortDirection={preferences.sortDirection}
                            onSort={handleSort}
                            onProspectClick={handleProspectClick}
                            onColumnResize={setColumnWidth}
                            onColumnReorder={setColumnOrder}
                            onProspectUpdated={refetch}
                        />
                    </div>
                </div>

                <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Rows per page:
                            </span>
                            <Select
                                value={preferences.rowsPerPage.toString()}
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
                            <span className="ml-4 text-sm text-muted-foreground">
                                Showing{' '}
                                {(page - 1) * preferences.rowsPerPage + 1} -{' '}
                                {Math.min(
                                    page * preferences.rowsPerPage,
                                    total,
                                )}{' '}
                                of {total}
                            </span>
                        </div>

                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                            className={
                                                page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>
                                    {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
                                            const pageNum =
                                                page <= 3
                                                    ? i + 1
                                                    : page + i - 2;
                                            if (
                                                pageNum < 1 ||
                                                pageNum > totalPages
                                            )
                                                return null;
                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        onClick={() =>
                                                            setPage(pageNum)
                                                        }
                                                        isActive={
                                                            page === pageNum
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        },
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(totalPages, p + 1),
                                                )
                                            }
                                            className={
                                                page === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : 'cursor-pointer'
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <Sheet open={isContactCardOpen} onOpenChange={setIsContactCardOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {isCreating ? 'Add Prospect' : 'Prospect Details'}
                        </SheetTitle>
                    </SheetHeader>
                    <ProspectContactCard
                        prospect={selectedProspect}
                        onClose={handleContactCardClose}
                        onUpdated={handleProspectUpdated}
                        isCreating={isCreating}
                    />
                </SheetContent>
            </Sheet>

            {/* Save View Dialog */}
            <SaveViewDialog
                open={isSaveViewOpen}
                onOpenChange={setIsSaveViewOpen}
                existingViewNames={preferences.savedViews.map((v) => v.name)}
                onSave={(name, setAsDefault) => {
                    const success = saveView(name);
                    if (success && setAsDefault) {
                        setDefaultView(name);
                    }
                }}
            />
        </>
    );
}
