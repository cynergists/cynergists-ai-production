import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Wallet, 
  Calendar, 
  DollarSign, 
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { router } from "@inertiajs/react";

interface Payout {
  id: string;
  batch_date: string;
  payout_date?: string | null;
  total_amount: number;
  commission_count: number;
  status: string;
  paid_at: string | null;
  external_payout_id?: string | null;
}

interface PayoutCommission {
  id: string;
  net_amount: number;
  earned_at: string | null;
  customer_name: string | null;
  product_name: string | null;
}

interface ReportRun {
  id: string;
  pdf_url: string | null;
  csv_commissions_url: string | null;
  csv_payouts_url: string | null;
}

interface PayoutDetailDrawerProps {
  payout: Payout | null;
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ComponentType<any> }> = {
  scheduled: { label: "Scheduled", variant: "secondary", icon: Clock },
  ready: { label: "Ready", variant: "default", icon: AlertCircle },
  processing: { label: "Processing", variant: "outline", icon: Clock },
  paid: { label: "Paid", variant: "default", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  canceled: { label: "Canceled", variant: "outline", icon: XCircle },
};

export function PayoutDetailDrawer({ payout, isOpen, onClose, partnerId }: PayoutDetailDrawerProps) {
  const [commissions, setCommissions] = useState<PayoutCommission[]>([]);
  const [reports, setReports] = useState<ReportRun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payout && isOpen) {
      fetchPayoutDetails();
    }
  }, [payout, isOpen]);

  const fetchPayoutDetails = async () => {
    if (!payout) return;
    setLoading(true);
    try {
      // Fetch commissions in this payout
      const { data: commData } = await supabase
        .from("partner_commissions")
        .select(`
          id,
          net_amount,
          earned_at,
          product_name,
          customer:clients!partner_commissions_customer_id_fkey(name)
        `)
        .eq("payout_id", payout.id)
        .order("earned_at", { ascending: false });

      setCommissions((commData || []).map(c => ({
        id: c.id,
        net_amount: c.net_amount,
        earned_at: c.earned_at,
        customer_name: (c.customer as any)?.name || null,
        product_name: c.product_name,
      })));

      // Fetch any related reports (that cover this payout date)
      const payoutDate = payout.payout_date || payout.batch_date;
      const { data: reportData } = await supabase
        .from("report_runs")
        .select("id, pdf_url, csv_commissions_url, csv_payouts_url")
        .eq("partner_id", partnerId)
        .lte("period_start", payoutDate)
        .gte("period_end", payoutDate)
        .eq("status", "emailed")
        .limit(3);

      setReports((reportData || []) as unknown as ReportRun[]);
    } catch (error) {
      console.error("Error fetching payout details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const handleContactSupport = () => {
    router.visit("/partner/tickets?subject=Payout%20Issue&category=payout");
    onClose();
  };

  if (!payout) return null;

  const statusInfo = statusConfig[payout.status] || statusConfig.scheduled;
  const StatusIcon = statusInfo.icon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payout Details
          </SheetTitle>
          <Badge variant={statusInfo.variant} className="w-fit">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Amount Summary */}
            <div className="text-center py-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(payout.total_amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {payout.commission_count} commission{payout.commission_count !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Failed Payout Warning */}
            {payout.status === "failed" && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Payout Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      There was an issue processing this payout. Please contact support to resolve.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleContactSupport}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Dates */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Dates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Payout Date
                  </span>
                  <span>
                    {payout.payout_date 
                      ? format(new Date(payout.payout_date), "MMM d, yyyy")
                      : format(new Date(payout.batch_date), "MMM d, yyyy")}
                  </span>
                </div>
                {payout.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Paid At
                    </span>
                    <span className="text-green-600">
                      {format(new Date(payout.paid_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                )}
                {payout.external_payout_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reference ID</span>
                    <span className="font-mono text-xs">{payout.external_payout_id}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Commissions Included */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Commissions Included ({commissions.length})
              </h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : commissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No commission details available
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Earned</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.customer_name || c.product_name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {c.earned_at ? format(new Date(c.earned_at), "MMM d") : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(c.net_amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Related Reports */}
            {reports.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Related Reports
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reports.map((report) => (
                      <div key={report.id} className="flex gap-2">
                        {report.pdf_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={report.pdf_url} target="_blank" rel="noopener">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                        {report.csv_commissions_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={report.csv_commissions_url} target="_blank" rel="noopener">
                              <Download className="h-4 w-4 mr-1" />
                              CSV
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
