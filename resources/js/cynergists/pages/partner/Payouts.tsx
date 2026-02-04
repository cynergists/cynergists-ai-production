import { ActivationChecklist } from '@/components/partner/ActivationChecklist';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Lock,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Payout {
    id: string;
    batch_date: string;
    payout_date?: string | null;
    total_amount: number;
    commission_count: number;
    status: string;
    paid_at: string | null;
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
    processing: { label: 'Processing', variant: 'outline', icon: Clock },
    paid: { label: 'Paid', variant: 'default', icon: CheckCircle2 },
    failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
    canceled: { label: 'Canceled', variant: 'outline', icon: XCircle },
};

export default function PartnerPayouts() {
    const { partner, status } = usePartnerContext();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [upcomingPayout, setUpcomingPayout] = useState<Payout | null>(null);

    useEffect(() => {
        if (status === 'active' && partner?.id) {
            fetchPayouts();
        } else {
            setLoading(false);
        }
    }, [partner?.id, status]);

    const fetchPayouts = async () => {
        try {
            const { data, error } = await supabase
                .from('partner_payouts')
                .select(
                    'id, batch_date, total_amount, commission_count, status, paid_at',
                )
                .eq('partner_id', partner.id)
                .order('batch_date', { ascending: false });

            if (error) throw error;

            // Map to Payout interface - payout_date may not exist yet in types
            const payoutData: Payout[] = (data || []).map((p) => ({
                ...p,
                payout_date:
                    (p as unknown as { payout_date?: string }).payout_date ||
                    null,
            }));

            setPayouts(payoutData);

            // Find next upcoming payout
            const upcoming = payoutData.find((p) =>
                ['scheduled', 'ready'].includes(p.status),
            );
            setUpcomingPayout(upcoming || null);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (payoutStatus: string) => {
        const config = statusConfig[payoutStatus] || {
            label: payoutStatus,
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

    if (status !== 'active') {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
                <Card className="max-w-2xl">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-center">
                            Payouts Locked
                        </CardTitle>
                        <CardDescription className="text-center">
                            Complete the activation checklist to access payout
                            management.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ActivationChecklist items={[]} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
            <p className="text-muted-foreground">
                View your payout method and payout history.
            </p>

            {/* Payout Method Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payout Method
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">
                                {partner.payout_provider === 'manual'
                                    ? 'Manual Transfer'
                                    : 'Direct Deposit'}
                            </p>
                            {partner.payout_last4 && (
                                <p className="text-sm text-muted-foreground">
                                    Account ending in {partner.payout_last4}
                                </p>
                            )}
                            {partner.payout_status === 'verified' ? (
                                <Badge variant="default" className="mt-2 gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified
                                </Badge>
                            ) : (
                                <Badge
                                    variant="secondary"
                                    className="mt-2 gap-1"
                                >
                                    <Clock className="h-3 w-3" />
                                    Pending Verification
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Pending Change Notice */}
                    {partner.pending_payout_last4 &&
                        partner.payout_change_active_after && (
                            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                                <p className="text-sm font-medium text-amber-600">
                                    Pending Payout Method Change
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    New account ending in{' '}
                                    {partner.pending_payout_last4} will be
                                    active after{' '}
                                    {format(
                                        new Date(
                                            partner.payout_change_active_after,
                                        ),
                                        "MMM d, yyyy 'at' h:mm a",
                                    )}
                                </p>
                                {!partner.payout_change_confirmed && (
                                    <p className="mt-1 text-sm text-amber-600">
                                        ⚠️ Please confirm via email link
                                    </p>
                                )}
                            </div>
                        )}
                </CardContent>
            </Card>

            {/* Upcoming Payout */}
            {upcomingPayout && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Upcoming Payout
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Amount
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        upcomingPayout.total_amount,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Commissions
                                </p>
                                <p className="text-2xl font-bold">
                                    {upcomingPayout.commission_count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Payout Date
                                </p>
                                <p className="text-2xl font-bold">
                                    {upcomingPayout.payout_date
                                        ? format(
                                              new Date(
                                                  upcomingPayout.payout_date,
                                              ),
                                              'MMM d',
                                          )
                                        : format(
                                              new Date(
                                                  upcomingPayout.batch_date,
                                              ),
                                              'MMM d',
                                          )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payout History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payout History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="space-y-4 p-6">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="p-12 text-center">
                            <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No payouts yet
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your first payout will appear here after
                                commissions are earned and processed.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payout Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Commissions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Paid At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((payout) => (
                                    <TableRow key={payout.id}>
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
                                                      new Date(payout.paid_at),
                                                      'MMM d, yyyy',
                                                  )
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
