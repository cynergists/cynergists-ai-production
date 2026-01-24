import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Loader2, Search, RefreshCw, Eye, Copy, ExternalLink, Wallet, 
  DollarSign, CreditCard, Building2, AlertCircle, TrendingUp, Download, User, FlaskConical, CalendarIcon
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CenteredDash } from "@/components/admin/CenteredDash";
import { cn } from "@/lib/utils";

type DatePreset = "all" | "today" | "this_week" | "this_month" | "this_year" | "last_week" | "last_month" | "last_year" | "last_7" | "last_30" | "last_90" | "last_365" | "custom";

const datePresets: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_week", label: "Last Week" },
  { value: "last_month", label: "Last Month" },
  { value: "last_year", label: "Last Year" },
  { value: "last_7", label: "Last 7 Days" },
  { value: "last_30", label: "Last 30 Days" },
  { value: "last_90", label: "Last 90 Days" },
  { value: "last_365", label: "Last 365 Days" },
  { value: "custom", label: "Custom Range" },
];

function getDateRangeFromPreset(preset: DatePreset): { from: Date | undefined; to: Date | undefined } {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "this_week":
      return { from: startOfWeek(now, { weekStartsOn: 0 }), to: endOfWeek(now, { weekStartsOn: 0 }) };
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "this_year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "last_week":
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
      return { from: lastWeekStart, to: endOfWeek(lastWeekStart, { weekStartsOn: 0 }) };
    case "last_month":
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      return { from: lastMonthStart, to: endOfMonth(lastMonthStart) };
    case "last_year":
      const lastYearStart = startOfYear(subYears(now, 1));
      return { from: lastYearStart, to: endOfYear(lastYearStart) };
    case "last_7":
      return { from: subDays(now, 7), to: now };
    case "last_30":
      return { from: subDays(now, 30), to: now };
    case "last_90":
      return { from: subDays(now, 90), to: now };
    case "last_365":
      return { from: subDays(now, 365), to: now };
    case "all":
    default:
      return { from: undefined, to: undefined };
  }
}

interface Payment {
  id: string;
  square_payment_id: string;
  square_customer_id: string | null;
  square_order_id: string | null;
  client_id: string | null;
  partner_id: string | null;
  deal_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured_at: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  created_at: string;
  raw_json: any;
  client?: {
    name: string;
    email: string | null;
  } | null;
  partner?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface PaymentsSummary {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  completedCount: number;
  totalCount: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  captured: { label: "Completed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  failed: { label: "Failed", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  refunded: { label: "Refunded", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  partial_refund: { label: "Partial Refund", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [testMode, setTestMode] = useState(false);
  const queryClient = useQueryClient();

  // Compute active date range
  const activeDateRange = useMemo(() => {
    if (datePreset === "custom") {
      return { from: customDateRange?.from, to: customDateRange?.to };
    }
    return getDateRangeFromPreset(datePreset);
  }, [datePreset, customDateRange]);

  // Load test mode setting from payment_settings
  useEffect(() => {
    const loadTestMode = async () => {
      const { data } = await supabase
        .from("payment_settings")
        .select("payment_mode, test_mode")
        .limit(1)
        .single();
      if (data) {
        // Check both payment_mode and test_mode for backwards compatibility
        setTestMode(data.payment_mode === "sandbox" || data.test_mode === true);
      }
    };
    loadTestMode();
  }, []);

  // Toggle test mode mutation - updates payment_settings.payment_mode
  const testModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from("payment_settings")
        .update({ 
          payment_mode: enabled ? "sandbox" : "production",
          test_mode: enabled,
          updated_at: new Date().toISOString()
        })
        .eq("id", "7b0efa71-e474-4b62-b9f6-309e51488b02"); // Use the known settings row ID
      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      setTestMode(enabled);
      toast.success(enabled ? "Test mode enabled - all payments will use Square Sandbox" : "Live mode enabled - payments will be processed for real");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment mode: ${error.message}`);
    },
  });

  // Fetch payments from database with client lookup
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["payments-from-db"],
    queryFn: async () => {
      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(500);

      if (paymentsError) throw paymentsError;

      // Get unique client IDs that are not null
      const clientIds = [...new Set(payments?.filter(p => p.client_id).map(p => p.client_id))];
      const partnerIds = [...new Set(payments?.filter(p => p.partner_id).map(p => p.partner_id))];

      // Fetch clients if there are any
      let clientsMap: Record<string, { name: string; email: string | null }> = {};
      if (clientIds.length > 0) {
        const { data: clients } = await supabase
          .from("clients")
          .select("id, name, email")
          .in("id", clientIds);
        
        if (clients) {
          clients.forEach(c => {
            clientsMap[c.id] = { name: c.name, email: c.email };
          });
        }
      }

      // Fetch partners if there are any
      let partnersMap: Record<string, { first_name: string; last_name: string }> = {};
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from("partners")
          .select("id, first_name, last_name")
          .in("id", partnerIds);
        
        if (partners) {
          partners.forEach(p => {
            partnersMap[p.id] = { first_name: p.first_name || '', last_name: p.last_name || '' };
          });
        }
      }

      // Merge data
      const enrichedPayments = payments?.map(p => ({
        ...p,
        client: p.client_id ? clientsMap[p.client_id] || null : null,
        partner: p.partner_id ? partnersMap[p.partner_id] || null : null,
      })) || [];

      // Calculate summary
      const captured = enrichedPayments.filter(p => p.status === "captured" || p.status === "partial_refund");
      const totalRevenue = captured.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalRefunds = enrichedPayments.reduce((sum, p) => sum + (p.refund_amount || 0), 0);

      return {
        payments: enrichedPayments as Payment[],
        summary: {
          totalRevenue,
          totalRefunds,
          netRevenue: totalRevenue - totalRefunds,
          completedCount: captured.length,
          totalCount: enrichedPayments.length,
        } as PaymentsSummary,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-square-payments", {
        body: { days_back: 90 },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced.inserted} new, ${data.synced.updated} updated payments`);
      queryClient.invalidateQueries({ queryKey: ["payments-from-db"] });
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const payments = data?.payments || [];
  const summary = data?.summary;

  const filteredPayments = payments.filter((p) => {
    // Status filter
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    
    // Date filter
    if (activeDateRange.from || activeDateRange.to) {
      const paymentDate = p.captured_at ? new Date(p.captured_at) : null;
      if (!paymentDate) return false;
      if (activeDateRange.from && paymentDate < activeDateRange.from) return false;
      if (activeDateRange.to && paymentDate > endOfDay(activeDateRange.to)) return false;
    }
    
    // Search filter
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      p.square_payment_id?.toLowerCase().includes(search) ||
      p.client?.name?.toLowerCase().includes(search) ||
      p.client?.email?.toLowerCase().includes(search) ||
      p.square_customer_id?.includes(search)
    );
  });

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getSourceDisplay = (payment: Payment) => {
    const rawJson = payment.raw_json;
    if (rawJson?.card_details?.card) {
      const card = rawJson.card_details.card;
      return `${card.card_brand || 'Card'} •••• ${card.last_4 || ''}`;
    }
    if (rawJson?.bank_account_details?.bank_name) {
      return rawJson.bank_account_details.bank_name;
    }
    if (rawJson?.source_type === "BANK_ACCOUNT") return "ACH";
    if (rawJson?.source_type === "CARD") return "Card";
    return rawJson?.source_type || "—";
  };

  const getSourceIcon = (payment: Payment) => {
    const sourceType = payment.raw_json?.source_type;
    if (sourceType === "BANK_ACCOUNT") return <Building2 className="h-4 w-4 text-muted-foreground" />;
    return <CreditCard className="h-4 w-4 text-muted-foreground" />;
  };

  // Get buyer info from Square raw_json as fallback
  const getBuyerDisplay = (payment: Payment) => {
    // First try linked client
    if (payment.client?.name) {
      return {
        name: payment.client.name,
        email: payment.client.email || undefined,
      };
    }
    
    // Fall back to Square data
    const rawJson = payment.raw_json;
    if (rawJson) {
      const billingAddress = rawJson.billing_address;
      const buyerEmail = rawJson.buyer_email_address;
      const customerName = rawJson._customer_name;
      const customerCompany = rawJson._customer_company;
      
      // 1. Try enriched customer name from Square Customer API
      if (customerName) {
        return { name: customerName, email: buyerEmail };
      }
      
      // 2. Try company name from Square Customer API
      if (customerCompany) {
        return { name: customerCompany, email: buyerEmail };
      }
      
      // 3. Try billing address name
      if (billingAddress?.first_name || billingAddress?.last_name) {
        const name = [billingAddress.first_name, billingAddress.last_name].filter(Boolean).join(" ");
        return { name, email: buyerEmail };
      }
      
      // 4. Show full email as identifier if nothing else
      if (buyerEmail) {
        return { name: buyerEmail, email: undefined };
      }
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold">Error Loading Payments</h3>
              <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Transactions | Admin</title>
      </Helmet>

      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4 space-y-4 bg-background">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
              <p className="text-sm text-muted-foreground">
                {payments.length} transactions stored
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Test Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-muted/50">
                <FlaskConical className={`h-4 w-4 ${testMode ? "text-amber-500" : "text-muted-foreground"}`} />
                <Label htmlFor="test-mode" className="text-sm font-medium cursor-pointer">
                  Test Mode
                </Label>
                <Switch
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={(checked) => testModeMutation.mutate(checked)}
                  disabled={testModeMutation.isPending}
                />
                {testMode && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    Sandbox
                  </Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => syncMutation.mutate()} 
                disabled={syncMutation.isPending}
              >
                <Download className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                {syncMutation.isPending ? "Syncing..." : "Sync from Square"}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{summary.completedCount}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">Gross Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(summary.netRevenue)}</p>
                      <p className="text-sm text-muted-foreground">Net Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalRefunds)}</p>
                      <p className="text-sm text-muted-foreground">Refunds</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by payment ID, client name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Date Range Filter */}
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
              <SelectTrigger className="w-[160px]">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {datePresets.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Picker (shown when custom is selected) */}
            {datePreset === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange?.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "M/d/yy")} - {format(customDateRange.to, "M/d/yy")}
                        </>
                      ) : (
                        format(customDateRange.from, "M/d/yy")
                      )
                    ) : (
                      <span className="text-muted-foreground">Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="captured">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partial_refund">Partial Refund</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden px-6">
          {payments.length === 0 ? (
            <Card className="border-amber-500/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Payments Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  Click "Sync from Square" to pull your payment history, or configure Square webhooks for automatic updates.
                </p>
                <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                  <Download className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg h-full overflow-auto">
              <table className="w-full caption-bottom text-sm" style={{ tableLayout: "fixed", minWidth: "1000px" }}>
                <thead className="[&_tr]:border-b sticky top-0 z-10 bg-background">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: "180px" }}>Client</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: "160px" }}>Date</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground" style={{ width: "110px" }}>Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground" style={{ width: "120px" }}>Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: "140px" }}>Source</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground" style={{ width: "140px" }}>Partner</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground" style={{ width: "100px" }}>Refund</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground" style={{ width: "70px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        {searchQuery || statusFilter !== "all" ? "No payments match your filters" : "No payments found"}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          {(() => {
                            const buyer = getBuyerDisplay(payment);
                            if (buyer) {
                              return (
                                <div>
                                  <div className="font-medium truncate">{buyer.name}</div>
                                  {buyer.email && <div className="text-xs text-muted-foreground truncate">{buyer.email}</div>}
                                </div>
                              );
                            }
                            return <CenteredDash />;
                          })()}
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          {payment.captured_at ? format(new Date(payment.captured_at), "MMM d, yyyy HH:mm") : "—"}
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Badge className={statusConfig[payment.status]?.className || "bg-muted"}>
                            {statusConfig[payment.status]?.label || payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(payment)}
                            <span className="text-sm truncate">{getSourceDisplay(payment)}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {payment.partner ? (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{payment.partner.first_name} {payment.partner.last_name}</span>
                            </div>
                          ) : (
                            <CenteredDash />
                          )}
                        </td>
                        <td className="p-4 align-middle text-center">
                          {payment.refund_amount ? (
                            <span className="text-destructive font-medium">
                              -{formatCurrency(payment.refund_amount, payment.currency)}
                            </span>
                          ) : (
                            <CenteredDash />
                          )}
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Payment ID:</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-mono text-xs break-all">{selectedPayment.square_payment_id}</span>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-5 w-5 shrink-0"
                                          onClick={() => copyToClipboard(selectedPayment.square_payment_id)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>
                                      <div>
                                        <Badge className={statusConfig[selectedPayment.status]?.className}>
                                          {statusConfig[selectedPayment.status]?.label || selectedPayment.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Amount:</span>
                                      <div className="font-medium text-lg">
                                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Source:</span>
                                      <div>{getSourceDisplay(selectedPayment)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Captured:</span>
                                      <div>{selectedPayment.captured_at ? format(new Date(selectedPayment.captured_at), "MMM d, yyyy HH:mm:ss") : "—"}</div>
                                    </div>
                                    {selectedPayment.client && (
                                      <div>
                                        <span className="text-muted-foreground">Client:</span>
                                        <div>{selectedPayment.client.name}</div>
                                      </div>
                                    )}
                                    {selectedPayment.partner && (
                                      <div>
                                        <span className="text-muted-foreground">Partner:</span>
                                        <div>{selectedPayment.partner.first_name} {selectedPayment.partner.last_name}</div>
                                      </div>
                                    )}
                                    {selectedPayment.refund_amount && (
                                      <div>
                                        <span className="text-muted-foreground">Refund:</span>
                                        <div className="text-destructive font-medium">
                                          -{formatCurrency(selectedPayment.refund_amount, selectedPayment.currency)}
                                        </div>
                                      </div>
                                    )}
                                    {selectedPayment.square_order_id && (
                                      <div>
                                        <span className="text-muted-foreground">Order ID:</span>
                                        <div className="font-mono text-xs">{selectedPayment.square_order_id}</div>
                                      </div>
                                    )}
                                  </div>
                                  {selectedPayment.raw_json?.receipt_url && (
                                    <Button variant="outline" className="w-full" asChild>
                                      <a href={selectedPayment.raw_json.receipt_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Receipt
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sticky Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredPayments.length} of {payments.length} payments
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
