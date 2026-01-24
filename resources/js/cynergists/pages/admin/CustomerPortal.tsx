import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import { Map, Plug, HelpCircle, Lightbulb, Eye, Users, Loader2, Search, Filter, Settings2, X, UserPlus, RefreshCw, Save } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useClientViewPreferences } from "@/hooks/useClientViewPreferences";
import { useClients, type Client } from "@/hooks/useAdminQueries";
import { ClientsTable } from "@/components/admin/clients/ClientsTable";
import { ClientsFilters } from "@/components/admin/clients/ClientsFilters";
import { ClientsViewSettings } from "@/components/admin/clients/ClientsViewSettings";
import { ClientContactCard } from "@/components/admin/clients/ClientContactCard";
import { ClientsMetricsSummary } from "@/components/admin/clients/ClientsMetricsSummary";
import { SaveViewDialog } from "@/components/admin/SaveViewDialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

const managementCards = [
  {
    title: "Tenant Management",
    description: "Manage customer portal instances",
    icon: Users,
    href: "/admin/client-portal/tenants",
    color: "text-primary",
  },
  {
    title: "Roadmap",
    description: "Configure roadmap items",
    icon: Map,
    href: "/admin/client-portal/roadmap",
    color: "text-orange-500",
  },
  {
    title: "Integrations",
    description: "Set available integrations",
    icon: Plug,
    href: "/admin/client-portal/integrations",
    color: "text-purple-500",
  },
  {
    title: "FAQs",
    description: "Edit support FAQ content",
    icon: HelpCircle,
    href: "/admin/client-portal/faqs",
    color: "text-green-500",
  },
  {
    title: "Suggestions",
    description: "Review agent ideas",
    icon: Lightbulb,
    href: "/admin/client-portal/suggestions",
    color: "text-yellow-500",
  },
  {
    title: "Preview",
    description: "View as customer",
    icon: Eye,
    href: "/portal",
    color: "text-cyan-500",
    external: true,
  },
];

export default function CustomerPortal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  } = useClientViewPreferences();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isSyncingGHL, setIsSyncingGHL] = useState(false);
  const [isSyncingSquare, setIsSyncingSquare] = useState(false);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

  const handleGHLSync = async () => {
    setIsSyncingGHL(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to sync GHL data",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-ghl-contacts', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { dryRun: false },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "GHL Sync Complete",
        description: `Updated ${data.clientsUpdated} clients and ${data.prospectsUpdated} prospects.`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    } catch (err) {
      console.error("GHL sync error:", err);
      toast({
        title: "Sync Failed",
        description: err instanceof Error ? err.message : "Failed to sync GHL data",
        variant: "destructive",
      });
    } finally {
      setIsSyncingGHL(false);
    }
  };

  const handleSquareSync = async () => {
    setIsSyncingSquare(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to sync Square data",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-square-clients', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Square Sync Complete",
        description: `Synced ${data.syncedCount} clients from Square.`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
    } catch (err) {
      console.error("Square sync error:", err);
      toast({
        title: "Sync Failed",
        description: err instanceof Error ? err.message : "Failed to sync Square data",
        variant: "destructive",
      });
    } finally {
      setIsSyncingSquare(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useClients({
    page,
    limit: preferences.rowsPerPage,
    sortColumn: preferences.sortColumn,
    sortDirection: preferences.sortDirection,
    search: debouncedSearch,
    filters: preferences.activeFilters,
  });

  const clients = data?.clients || [];
  const total = data?.total || 0;
  const activeCount = data?.activeCount || 0;
  const totalPages = data?.totalPages || 0;
  const summary = data?.summary || null;

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsContactCardOpen(true);
  };

  const handleContactCardClose = () => {
    setIsContactCardOpen(false);
    setSelectedClient(null);
  };

  const handleClientUpdated = async () => {
    await queryClient.refetchQueries({ queryKey: ["admin", "clients"] });
  };

  const handleSort = (column: string) => {
    const newDirection = 
      preferences.sortColumn === column && preferences.sortDirection === 'asc' 
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

  const activeFilterCount = Object.keys(preferences.activeFilters).length;

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
        <title>Client Portal | Admin</title>
      </Helmet>

      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Sticky Header Section */}
        <div className="flex-shrink-0 p-6 pb-4 space-y-4 bg-background">
          {/* Page Title and Quick Links */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
              <p className="text-sm text-muted-foreground">
                Manage clients and configure portal content
              </p>
            </div>
          </div>

          {/* Management Cards - Horizontal */}
          <div className="flex flex-wrap gap-2">
            {managementCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  {card.title}
                </Button>
              </Link>
            ))}
          </div>

          {/* Metrics Summary */}
          <ClientsMetricsSummary 
            summary={summary} 
            loading={isLoading} 
            hasActiveFilters={activeFilterCount > 0 || debouncedSearch.length > 0}
          />

          {/* Clients Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Clients</h2>
                <p className="text-sm text-muted-foreground">
                  {activeCount} Active Clients
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
                  placeholder="Search clients..."
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
                  <ClientsFilters
                    activeFilters={preferences.activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </PopoverContent>
              </Popover>

              {/* View Settings */}
              <Popover open={isViewSettingsOpen} onOpenChange={setIsViewSettingsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <ClientsViewSettings
                    columnOrder={preferences.columnOrder}
                    hiddenColumns={preferences.hiddenColumns}
                    savedViews={preferences.savedViews}
                    activeViewName={preferences.activeViewName}
                    defaultViewName={preferences.defaultViewName}
                    onColumnOrderChange={setColumnOrder}
                    onToggleColumn={toggleColumnVisibility}
                    onLoadView={loadView}
                    onDeleteView={deleteView}
                    onSetDefaultView={setDefaultView}
                    onResetToDefault={resetToDefault}
                  />
                </PopoverContent>
              </Popover>

              {/* Square Sync */}
              <Button 
                variant="outline" 
                onClick={handleSquareSync}
                disabled={isSyncingSquare}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingSquare ? 'animate-spin' : ''}`} />
                {isSyncingSquare ? 'Syncing...' : 'Sync Square'}
              </Button>

              {/* GHL Sync */}
              <Button 
                variant="outline" 
                onClick={handleGHLSync}
                disabled={isSyncingGHL}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingGHL ? 'animate-spin' : ''}`} />
                {isSyncingGHL ? 'Syncing...' : 'Sync GHL'}
              </Button>

              {/* Add Client */}
              <Button onClick={() => {
                setSelectedClient(null);
                setIsContactCardOpen(true);
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {Object.entries(preferences.activeFilters).map(([column, value]) => (
                <Button
                  key={column}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFilterChange(column, "")}
                  className="h-6 text-xs"
                >
                  {column}: {value}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-6 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 overflow-hidden px-6">
          <div className="border rounded-lg h-full overflow-auto">
            <ClientsTable
              clients={clients}
              loading={isLoading}
              columnOrder={preferences.columnOrder}
              hiddenColumns={preferences.hiddenColumns}
              columnWidths={preferences.columnWidths}
              sortColumn={preferences.sortColumn}
              sortDirection={preferences.sortDirection}
              onSort={handleSort}
              onClientClick={handleClientClick}
              onColumnResize={setColumnWidth}
              onColumnReorder={setColumnOrder}
              onClientUpdated={handleClientUpdated}
            />
          </div>
        </div>

        {/* Sticky Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={preferences.rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
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
                Showing {((page - 1) * preferences.rowsPerPage) + 1} - {Math.min(page * preferences.rowsPerPage, total)} of {total}
              </span>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Contact Card Sheet */}
      <Sheet open={isContactCardOpen} onOpenChange={setIsContactCardOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Client Details</SheetTitle>
          </SheetHeader>
          {selectedClient && (
            <ClientContactCard
              client={selectedClient}
              onClose={handleContactCardClose}
              onUpdated={handleClientUpdated}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Save View Dialog */}
      <SaveViewDialog
        open={isSaveViewOpen}
        onOpenChange={setIsSaveViewOpen}
        onSave={saveView}
        existingViewNames={preferences.savedViews.map(v => v.name)}
      />
    </>
  );
}
