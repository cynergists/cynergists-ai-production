import { useState, useEffect } from "react";
import { usePartnerContext } from "@/contexts/PartnerContext";
import { 
  DollarSign, 
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Commission {
  id: string;
  gross_amount: number;
  net_amount: number;
  commission_rate: number;
  status: string;
  clawback_eligible_until: string | null;
  earned_at: string | null;
  payable_at: string | null;
  paid_at: string | null;
  created_at: string;
  deal_id: string | null;
  payment_id: string | null;
  customer_id: string | null;
  customer?: { name: string; company: string | null } | null;
}

const statusConfig: Record<string, { label: string; icon: React.ComponentType<any>; className: string; description: string }> = {
  pending: { 
    label: "Pending", 
    icon: Clock, 
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    description: "In clawback window"
  },
  earned: { 
    label: "Earned", 
    icon: CheckCircle2, 
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Clawback window passed"
  },
  payable: { 
    label: "Payable", 
    icon: Wallet, 
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    description: "Ready for next payout"
  },
  paid: { 
    label: "Paid", 
    icon: CheckCircle2, 
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    description: "Commission paid out"
  },
  clawed_back: { 
    label: "Clawed Back", 
    icon: AlertTriangle, 
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    description: "Refund within 30 days"
  },
  disputed: { 
    label: "Disputed", 
    icon: HelpCircle, 
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    description: "Under review"
  },
};

export default function PartnerCommissions() {
  const { partner } = usePartnerContext();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCommissions();
  }, [partner?.id]);

  const fetchCommissions = async () => {
    if (!partner?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('partner_commissions')
        .select(`
          *,
          customer:clients!partner_commissions_customer_id_fkey(name, company)
        `)
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions((data as unknown) as Commission[] || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast({
        title: "Error",
        description: "Failed to load commissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const filteredCommissions = commissions.filter((commission) => {
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    const matchesSearch = !searchQuery || 
      commission.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.customer?.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate summary stats
  const pendingAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.net_amount, 0);
  const earnedAmount = commissions
    .filter(c => c.status === 'earned')
    .reduce((sum, c) => sum + c.net_amount, 0);
  const payableAmount = commissions
    .filter(c => c.status === 'payable')
    .reduce((sum, c) => sum + c.net_amount, 0);
  const paidAmount = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.net_amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Commissions</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings from referred deals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">In 30-day clawback window</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(earnedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to be batched</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(payableAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">In next payout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Your rate: <span className="font-semibold text-foreground">{Math.round((partner?.commission_rate || 0.2) * 100)}%</span>
              </p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="payable">Payable</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="clawed_back">Clawed Back</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            {filteredCommissions.length} commission{filteredCommissions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No commissions yet</h3>
              <p className="text-muted-foreground">
                You'll earn commissions when your referred deals close and payments are captured.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Earned</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Basis</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payable At</TableHead>
                  <TableHead>Clawback Until</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => {
                  const statusInfo = statusConfig[commission.status] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  const isClawbackActive = commission.clawback_eligible_until && 
                    new Date(commission.clawback_eligible_until) > new Date();
                  
                  return (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <span className="text-sm">
                          {commission.earned_at 
                            ? format(new Date(commission.earned_at), 'MMM d, yyyy')
                            : format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commission.customer?.name || '-'}</div>
                          {commission.customer?.company && (
                            <div className="text-xs text-muted-foreground">{commission.customer.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground">
                          {formatCurrency(commission.gross_amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm">
                          {Math.round(commission.commission_rate * 100)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(commission.net_amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {commission.payable_at ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(commission.payable_at), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {commission.clawback_eligible_until ? (
                          <span className={`text-sm ${isClawbackActive ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {format(new Date(commission.clawback_eligible_until), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {commission.paid_at ? (
                          <span className="text-sm text-emerald-600">
                            {format(new Date(commission.paid_at), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">30-Day Clawback Window</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Commissions remain in "earned" status for 30 days after payment capture. 
                  If a refund occurs during this period, the commission is clawed back.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Monthly Payouts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Commissions earned by the 15th are paid on the 1st of the following month. 
                  Commissions earned after the 15th are paid the month after.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
