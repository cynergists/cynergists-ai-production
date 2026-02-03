import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
    AlertCircle,
    Ban,
    CheckCircle2,
    Clock,
    Loader2,
    Play,
    RefreshCw,
    Search,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Payout {
    id: string;
    partner_id: string;
    batch_date: string;
    payout_date?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    total_amount: number;
    commission_count: number;
    status: string;
    external_payout_id?: string | null;
    failure_reason?: string | null;
    paid_at: string | null;
    created_at: string;
    partner?: {
        first_name: string | null;
        last_name: string | null;
        company_name: string | null;
        payout_provider: string | null;
        payout_last4: string | null;
    } | null;
}

interface PayoutItem {
    id: string;
    commission_id: string;
    amount: number;
    commission?: {
        earned_at: string | null;
        status: string;
        customer_id: string | null;
    };
}

const statusConfig: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    scheduled: { label: 'Scheduled', variant: 'secondary', icon: Clock },
    ready: { label: 'Ready', variant: 'default', icon: AlertCircle },
    processing: { label: 'Processing', variant: 'outline', icon: Loader2 },
    paid: { label: 'Paid', variant: 'default', icon: CheckCircle2 },
    failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
    canceled: { label: 'Canceled', variant: 'outline', icon: Ban },
};

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [payoutItems, setPayoutItems] = useState<PayoutItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('partner_payouts')
                .select(
                    `
          *,
          partner:partners(first_name, last_name, company_name, payout_provider, payout_last4)
        `,
                )
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayouts((data as Payout[]) || []);
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const fetchPayoutItems = async (payoutId: string) => {
        setLoadingItems(true);
        try {
            // payout_items table may not be in generated types yet, use raw query
            const { data, error } = await supabase
                .from('partner_commissions')
                .select(
                    'id, payout_id, net_amount, earned_at, status, customer_id',
                )
                .eq('payout_id', payoutId);

            if (error) throw error;

            // Map commissions to payout items format
            const items: PayoutItem[] = (data || []).map((c) => ({
                id: c.id,
                commission_id: c.id,
                amount: c.net_amount,
                commission: {
                    earned_at: c.earned_at,
                    status: c.status,
                    customer_id: c.customer_id,
                },
            }));
            setPayoutItems(items);
        } catch (error) {
            console.error('Error fetching payout items:', error);
            toast.error('Failed to load payout items');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleSelectPayout = (payout: Payout) => {
        setSelectedPayout(payout);
        fetchPayoutItems(payout.id);
    };

    const handleReconcile = async (payoutId: string) => {
        setActionLoading(`reconcile-${payoutId}`);
        try {
            const { data, error } = await supabase.rpc('reconcile_payout', {
                p_payout_id: payoutId,
            });
            if (error) throw error;

            const result = data as { removed_count?: number } | null;
            toast.success(
                `Reconciled: removed ${result?.removed_count || 0} commissions`,
            );
            fetchPayouts();
            if (selectedPayout?.id === payoutId) {
                fetchPayoutItems(payoutId);
            }
        } catch (error) {
            console.error('Error reconciling payout:', error);
            toast.error('Failed to reconcile payout');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkReady = async (payoutId: string) => {
        setActionLoading(`ready-${payoutId}`);
        try {
            const { error } = await supabase
                .from('partner_payouts')
                .update({ status: 'ready' })
                .eq('id', payoutId);

            if (error) throw error;
            toast.success('Payout marked as ready');
            fetchPayouts();
        } catch (error) {
            console.error('Error marking ready:', error);
            toast.error('Failed to mark payout as ready');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExecute = async (payoutId: string) => {
        setActionLoading(`execute-${payoutId}`);
        try {
            // Set to processing first
            const { error: updateError } = await supabase
                .from('partner_payouts')
                .update({ status: 'processing' })
                .eq('id', payoutId);

            if (updateError) throw updateError;

            toast.info(
                "Payout is now processing. Use 'Mark Paid' after completing transfer.",
            );
            fetchPayouts();
        } catch (error) {
            console.error('Error executing payout:', error);
            toast.error('Failed to execute payout');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkPaid = async (payoutId: string) => {
        setActionLoading(`paid-${payoutId}`);
        try {
            const { data, error } = await supabase.rpc('mark_payout_paid', {
                p_payout_id: payoutId,
            });
            if (error) throw error;

            if (data) {
                toast.success('Payout marked as paid, commissions updated');
            } else {
                toast.error('Failed to mark payout as paid');
            }
            fetchPayouts();
        } catch (error) {
            console.error('Error marking paid:', error);
            toast.error('Failed to mark payout as paid');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (payoutId: string) => {
        setActionLoading(`cancel-${payoutId}`);
        try {
            const { data, error } = await supabase.rpc('cancel_payout', {
                p_payout_id: payoutId,
            });
            if (error) throw error;

            if (data) {
                toast.success('Payout canceled, commissions released');
            } else {
                toast.error('Cannot cancel this payout');
            }
            fetchPayouts();
            if (selectedPayout?.id === payoutId) {
                setSelectedPayout(null);
            }
        } catch (error) {
            console.error('Error canceling payout:', error);
            toast.error('Failed to cancel payout');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredPayouts = payouts.filter((payout) => {
        const matchesSearch =
            search === '' ||
            payout.partner?.first_name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            payout.partner?.last_name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            payout.partner?.company_name
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || payout.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || {
            label: status,
            variant: 'outline' as const,
            icon: Clock,
        };
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Payouts
                    </h1>
                    <p className="text-muted-foreground">
                        Manage partner payout batches and execution
                    </p>
                </div>
                <Button onClick={fetchPayouts} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by partner..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Statuses
                                </SelectItem>
                                <SelectItem value="scheduled">
                                    Scheduled
                                </SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="processing">
                                    Processing
                                </SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="canceled">
                                    Canceled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Payouts Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-4 p-6">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Payout Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Commissions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Paid At</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayouts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No payouts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayouts.map((payout) => (
                                        <TableRow
                                            key={payout.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                handleSelectPayout(payout)
                                            }
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            payout.partner
                                                                ?.first_name
                                                        }{' '}
                                                        {
                                                            payout.partner
                                                                ?.last_name
                                                        }
                                                    </p>
                                                    {payout.partner
                                                        ?.company_name && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                payout.partner
                                                                    .company_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payout.payout_date
                                                    ? format(
                                                          new Date(
                                                              payout.payout_date,
                                                          ),
                                                          'MMM d, yyyy',
                                                      )
                                                    : format(
                                                          new Date(
                                                              payout.batch_date,
                                                          ),
                                                          'MMM d, yyyy',
                                                      )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(
                                                    payout.total_amount,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {payout.commission_count}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(payout.status)}
                                            </TableCell>
                                            <TableCell>
                                                {payout.paid_at
                                                    ? format(
                                                          new Date(
                                                              payout.paid_at,
                                                          ),
                                                          'MMM d, yyyy HH:mm',
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div
                                                    className="flex justify-end gap-2"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {[
                                                        'scheduled',
                                                        'ready',
                                                    ].includes(
                                                        payout.status,
                                                    ) && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleReconcile(
                                                                        payout.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    `reconcile-${payout.id}`
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                `reconcile-${payout.id}` ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            {payout.status ===
                                                                'scheduled' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        handleMarkReady(
                                                                            payout.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `ready-${payout.id}`
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                    `ready-${payout.id}` ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        'Ready'
                                                                    )}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleExecute(
                                                                        payout.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    `execute-${payout.id}`
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                `execute-${payout.id}` ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Play className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </>
                                                    )}
                                                    {payout.status ===
                                                        'processing' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleMarkPaid(
                                                                    payout.id,
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                `paid-${payout.id}`
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `paid-${payout.id}` ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                                            )}
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                    {![
                                                        'paid',
                                                        'canceled',
                                                    ].includes(
                                                        payout.status,
                                                    ) && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleCancel(
                                                                    payout.id,
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                `cancel-${payout.id}`
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `cancel-${payout.id}` ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Ban className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Payout Detail Drawer */}
            <Sheet
                open={!!selectedPayout}
                onOpenChange={() => setSelectedPayout(null)}
            >
                <SheetContent className="w-[500px] sm:max-w-[500px]">
                    {selectedPayout && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Payout Details</SheetTitle>
                                <SheetDescription>
                                    {selectedPayout.partner?.first_name}{' '}
                                    {selectedPayout.partner?.last_name}
                                    {selectedPayout.partner?.company_name &&
                                        ` • ${selectedPayout.partner.company_name}`}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-muted p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Total Amount
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(
                                                selectedPayout.total_amount,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-muted p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Status
                                        </p>
                                        <div className="mt-1">
                                            {getStatusBadge(
                                                selectedPayout.status,
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Payout Date
                                        </span>
                                        <span>
                                            {selectedPayout.payout_date
                                                ? format(
                                                      new Date(
                                                          selectedPayout.payout_date,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Period
                                        </span>
                                        <span>
                                            {selectedPayout.period_start &&
                                            selectedPayout.period_end
                                                ? `${format(new Date(selectedPayout.period_start), 'MMM d')} - ${format(new Date(selectedPayout.period_end), 'MMM d, yyyy')}`
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Payout Method
                                        </span>
                                        <span>
                                            {selectedPayout.partner
                                                ?.payout_provider === 'manual'
                                                ? 'Manual'
                                                : 'Direct Deposit'}
                                            {selectedPayout.partner
                                                ?.payout_last4 &&
                                                ` (****${selectedPayout.partner.payout_last4})`}
                                        </span>
                                    </div>
                                    {selectedPayout.failure_reason && (
                                        <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                                            <p className="font-medium">
                                                Failure Reason
                                            </p>
                                            <p className="text-sm">
                                                {selectedPayout.failure_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Commission Items */}
                                <div>
                                    <h4 className="mb-3 font-medium">
                                        Included Commissions (
                                        {payoutItems.length})
                                    </h4>
                                    {loadingItems ? (
                                        <div className="space-y-2">
                                            {[...Array(3)].map((_, i) => (
                                                <Skeleton
                                                    key={i}
                                                    className="h-10 w-full"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-h-[300px] divide-y overflow-y-auto rounded-lg border">
                                            {payoutItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {item.commission
                                                                ?.earned_at
                                                                ? format(
                                                                      new Date(
                                                                          item
                                                                              .commission
                                                                              .earned_at,
                                                                      ),
                                                                      'MMM d, yyyy',
                                                                  )
                                                                : 'Unknown date'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.commission
                                                                ?.status ||
                                                                'Unknown status'}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">
                                                        {formatCurrency(
                                                            item.amount,
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
