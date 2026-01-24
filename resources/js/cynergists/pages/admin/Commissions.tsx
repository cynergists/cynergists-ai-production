import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
  HelpCircle,
  Ban,
  Eye,
  Edit,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Commission {
  id: string;
  partner_id: string;
  customer_id: string | null;
  deal_id: string | null;
  payment_id: string | null;
  gross_amount: number;
  net_amount: number;
  commission_rate: number;
  status: string;
  earned_at: string | null;
  payable_at: string | null;
  paid_at: string | null;
  clawback_eligible_until: string | null;
  notes: string | null;
  created_at: string;
  partner?: { first_name: string; last_name: string } | null;
  customer?: { name: string; company: string | null } | null;
}

const statusConfig: Record<string, { label: string; icon: React.ComponentType<any>; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  earned: { label: "Earned", icon: CheckCircle2, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  payable: { label: "Payable", icon: Wallet, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  paid: { label: "Paid", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  clawed_back: { label: "Clawed Back", icon: AlertTriangle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  disputed: { label: "Disputed", icon: HelpCircle, className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default function AdminCommissions() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);

  const { data: commissions, isLoading, refetch } = useQuery({
    queryKey: ['admin-commissions', statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('partner_commissions')
        .select(`
          *,
          partner:partners!partner_commissions_partner_id_fkey(first_name, last_name),
          customer:clients!partner_commissions_customer_id_fkey(name, company)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Type assertion since we know the shape
      return (data as unknown) as Commission[];
    },
  });

  const markDisputedMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('partner_commissions')
        .update({ 
          status: 'disputed',
          notes: (selectedCommission?.notes || '') + `\n[${format(new Date(), 'yyyy-MM-dd HH:mm')}] DISPUTED: ${reason}`
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Commission marked as disputed');
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      setShowDisputeDialog(false);
      setDisputeReason('');
    },
    onError: (error) => {
      toast.error('Failed to mark as disputed: ' + error.message);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { error } = await supabase
        .from('partner_commissions')
        .update({ 
          notes: (selectedCommission?.notes || '') + `\n[${format(new Date(), 'yyyy-MM-dd HH:mm')}] NOTE: ${note}`
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note added');
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      setShowNoteDialog(false);
      setAdminNote('');
    },
    onError: (error) => {
      toast.error('Failed to add note: ' + error.message);
    },
  });

  const adjustAmountMutation = useMutation({
    mutationFn: async ({ id, newAmount, reason }: { id: string; newAmount: number; reason: string }) => {
      const { error } = await supabase
        .from('partner_commissions')
        .update({ 
          net_amount: newAmount,
          notes: (selectedCommission?.notes || '') + `\n[${format(new Date(), 'yyyy-MM-dd HH:mm')}] ADJUSTED: $${selectedCommission?.net_amount} -> $${newAmount}. Reason: ${reason}`
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Commission adjusted');
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      setShowAdjustDialog(false);
      setAdjustAmount('');
      setAdjustReason('');
    },
    onError: (error) => {
      toast.error('Failed to adjust commission: ' + error.message);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const filteredCommissions = commissions?.filter((c) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const partnerName = `${c.partner?.first_name || ''} ${c.partner?.last_name || ''}`.toLowerCase();
    const customerName = c.customer?.name?.toLowerCase() || '';
    const customerCompany = c.customer?.company?.toLowerCase() || '';
    return partnerName.includes(search) || customerName.includes(search) || customerCompany.includes(search);
  }) || [];

  // Calculate summary stats
  const stats = {
    earned: filteredCommissions.filter(c => c.status === 'earned').reduce((sum, c) => sum + c.net_amount, 0),
    payable: filteredCommissions.filter(c => c.status === 'payable').reduce((sum, c) => sum + c.net_amount, 0),
    paid: filteredCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.net_amount, 0),
    clawedBack: filteredCommissions.filter(c => c.status === 'clawed_back').length,
    disputed: filteredCommissions.filter(c => c.status === 'disputed').length,
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Commissions | Admin</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Commissions Management
          </h1>
          <p className="text-muted-foreground">View and manage partner commissions</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.earned)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.payable)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clawed Back</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.clawedBack}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disputed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.disputed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by partner or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="payable">Payable</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="clawed_back">Clawed Back</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Commissions</CardTitle>
          <CardDescription>{filteredCommissions.length} commissions found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No commissions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Earned</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Basis</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payable At</TableHead>
                  <TableHead>Clawback Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => {
                  const statusInfo = statusConfig[commission.status] || statusConfig.earned;
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={commission.id}>
                      <TableCell className="text-sm">
                        {commission.earned_at ? format(new Date(commission.earned_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {commission.partner ? `${commission.partner.first_name} ${commission.partner.last_name}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commission.customer?.name || '-'}</div>
                          {commission.customer?.company && (
                            <div className="text-xs text-muted-foreground">{commission.customer.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(commission.gross_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(commission.commission_rate * 100)}%
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(commission.net_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {commission.payable_at ? format(new Date(commission.payable_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {commission.clawback_eligible_until ? format(new Date(commission.clawback_eligible_until), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {commission.notes && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Commission Notes</DialogTitle>
                                </DialogHeader>
                                <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded max-h-[400px] overflow-auto">
                                  {commission.notes}
                                </pre>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCommission(commission);
                              setShowNoteDialog(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {commission.status !== 'disputed' && commission.status !== 'clawed_back' && commission.status !== 'paid' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCommission(commission);
                                  setAdjustAmount(commission.net_amount.toString());
                                  setShowAdjustDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCommission(commission);
                                  setShowDisputeDialog(true);
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Commission as Disputed</DialogTitle>
            <DialogDescription>
              This will flag the commission for review. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for dispute</Label>
              <Textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Enter the reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedCommission && markDisputedMutation.mutate({ id: selectedCommission.id, reason: disputeReason })}
              disabled={!disputeReason || markDisputedMutation.isPending}
            >
              {markDisputedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Mark Disputed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Note</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter your note..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedCommission && addNoteMutation.mutate({ id: selectedCommission.id, note: adminNote })}
              disabled={!adminNote || addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Amount Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Commission Amount</DialogTitle>
            <DialogDescription>
              Current amount: {selectedCommission && formatCurrency(selectedCommission.net_amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Reason for adjustment</Label>
              <Textarea
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Enter the reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedCommission && adjustAmountMutation.mutate({ 
                id: selectedCommission.id, 
                newAmount: parseFloat(adjustAmount), 
                reason: adjustReason 
              })}
              disabled={!adjustAmount || !adjustReason || adjustAmountMutation.isPending}
            >
              {adjustAmountMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
