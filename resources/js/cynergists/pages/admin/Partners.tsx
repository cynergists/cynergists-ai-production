import { PartnerDrawer } from '@/components/admin/partners/PartnerDrawer';
import { PartnersMetricsSummary } from '@/components/admin/partners/PartnersMetricsSummary';
import { PartnersTable } from '@/components/admin/partners/PartnersTable';
import { SaveViewDialog } from '@/components/admin/SaveViewDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Partner } from '@/hooks/usePartnersList';
import { usePartnersList } from '@/hooks/usePartnersList';
import { usePartnerViewPreferences } from '@/hooks/usePartnerViewPreferences';
import { Link } from '@inertiajs/react';
import {
    ExternalLink,
    Filter,
    Loader2,
    Save,
    Search,
    UserPlus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

export default function Partners() {
    const {
        partners,
        loading,
        error,
        summary,
        refetch,
        createPartner,
        updatePartner,
        deletePartner,
        mutating,
    } = usePartnersList();

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(
        null,
    );
    const [drawerOpen, setDrawerOpen] = useState(false);

    const {
        preferences,
        loading: prefsLoading,
        saveView,
        loadView,
        resetToDefault,
    } = usePartnerViewPreferences();

    // Debounce search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    };

    // Filter and sort partners
    const processedPartners = useMemo(() => {
        let result = [...partners];

        // Apply search filter
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            result = result.filter((partner) => {
                const fullName =
                    `${partner.first_name || ''} ${partner.last_name || ''}`.toLowerCase();
                return (
                    fullName.includes(query) ||
                    partner.email.toLowerCase().includes(query) ||
                    (partner.company_name?.toLowerCase().includes(query) ??
                        false)
                );
            });
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter(
                (partner) => partner.partner_status === filters.status,
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let aVal: string | number | null = null;
            let bVal: string | number | null = null;

            switch (sortColumn) {
                case 'name':
                    aVal =
                        `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
                    bVal =
                        `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
                    break;
                case 'company_name':
                    aVal = (a.company_name || '').toLowerCase();
                    bVal = (b.company_name || '').toLowerCase();
                    break;
                case 'partner_status':
                    aVal = a.partner_status;
                    bVal = b.partner_status;
                    break;
                case 'referrals_given':
                    aVal = a.referrals_given || 0;
                    bVal = b.referrals_given || 0;
                    break;
                case 'revenue_generated':
                    aVal = a.revenue_generated || 0;
                    bVal = b.revenue_generated || 0;
                    break;
                case 'created_at':
                    aVal = new Date(a.created_at).getTime();
                    bVal = new Date(b.created_at).getTime();
                    break;
                default:
                    return 0;
            }

            if (aVal === null || bVal === null) return 0;
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [partners, debouncedSearch, filters, sortColumn, sortDirection]);

    const total = processedPartners.length;
    const totalPages = Math.ceil(total / rowsPerPage);
    const paginatedPartners = processedPartners.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage,
    );

    const handleSort = (column: string) => {
        const newDirection =
            sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    const handlePartnerClick = (partner: Partner) => {
        setSelectedPartner(partner);
        setDrawerOpen(true);
    };

    const handleAddPartner = () => {
        setSelectedPartner(null);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedPartner(null);
    };

    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(parseInt(value));
        setPage(1);
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

    const handleSaveView = (name: string, setAsDefault: boolean) => {
        const success = saveView(name);
        if (success && setAsDefault) {
            // The saveView already handles setting as active
        }
    };

    const activeFilterCount = Object.keys(filters).length;

    if ((loading && partners.length === 0) || prefsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Partners | Admin</title>
            </Helmet>

            <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
                {/* Sticky Header Section */}
                <div className="flex-shrink-0 space-y-4 bg-background p-6 pb-4">
                    {/* Metrics Summary */}
                    <PartnersMetricsSummary summary={summary} />

                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Partners
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {total} total partners
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
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search partners..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    className="w-64 pl-9"
                                />
                            </div>

                            {/* Filters */}
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
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Filters</h4>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={filters.status || ''}
                                                onValueChange={(value) =>
                                                    handleFilterChange(
                                                        'status',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="suspended">
                                                        Suspended
                                                    </SelectItem>
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

                            {/* View Partner Portal Button */}
                            <Button variant="outline" asChild>
                                <Link href="/partner">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Partner Portal
                                </Link>
                            </Button>

                            {/* Add Partner Button */}
                            <Button onClick={handleAddPartner}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Partner
                            </Button>
                        </div>
                    </div>

                    {/* Active filters display */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Active filters:
                            </span>
                            {Object.entries(filters).map(([key, value]) => (
                                <Button
                                    key={key}
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleFilterChange(key, '')}
                                    className="h-6 text-xs"
                                >
                                    {key}: {value}
                                    <X className="ml-1 h-3 w-3" />
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
                    <div className="h-full overflow-auto rounded-lg border">
                        {error ? (
                            <div className="py-8 text-center text-destructive">
                                <p>Error loading partners: {error}</p>
                                <Button
                                    onClick={refetch}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <PartnersTable
                                partners={paginatedPartners}
                                loading={loading}
                                sortColumn={sortColumn}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                                onPartnerClick={handlePartnerClick}
                            />
                        )}
                    </div>
                </div>

                {/* Sticky Pagination Footer */}
                <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Rows per page:
                            </span>
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
                            <span className="ml-4 text-sm text-muted-foreground">
                                Showing{' '}
                                {Math.min((page - 1) * rowsPerPage + 1, total)}{' '}
                                - {Math.min(page * rowsPerPage, total)} of{' '}
                                {total}
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

            {/* Partner Drawer */}
            <PartnerDrawer
                partner={selectedPartner}
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSave={createPartner}
                onUpdate={updatePartner}
                onDelete={deletePartner}
                saving={mutating}
            />

            <SaveViewDialog
                open={isSaveViewOpen}
                onOpenChange={setIsSaveViewOpen}
                onSave={handleSaveView}
                existingViewNames={preferences.savedViews.map((v) => v.name)}
            />
        </>
    );
}
