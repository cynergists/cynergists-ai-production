/**
 * ClientPaymentsDialog
 *
 * A dialog showing payment history for a specific client.
 * Matches payments via client_id, square_customer_id, or email.
 */

import { CenteredDash } from '@/components/admin/CenteredDash';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CreditCard, Loader2, Receipt } from 'lucide-react';

interface Payment {
    id: string;
    amount: number;
    status: string;
    captured_at: string | null;
    refunded_at: string | null;
    refund_amount: number | null;
    square_payment_id: string;
    currency: string;
    raw_json: Record<string, unknown>;
}

interface ClientPaymentsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    clientName: string;
    clientEmail?: string | null;
    squareCustomerId?: string | null;
}

export function ClientPaymentsDialog({
    isOpen,
    onClose,
    clientId,
    clientName,
    clientEmail,
    squareCustomerId,
}: ClientPaymentsDialogProps) {
    // Fetch payments for this client using multiple matching strategies
    const { data: payments, isLoading } = useQuery({
        queryKey: ['client-payments', clientId, squareCustomerId, clientEmail],
        queryFn: async () => {
            // Build conditions for matching
            const conditions: string[] = [];

            // Always include client_id match
            conditions.push(`client_id.eq.${clientId}`);

            // Add square_customer_id match if available
            if (squareCustomerId) {
                conditions.push(`square_customer_id.eq.${squareCustomerId}`);
            }

            // Fetch payments matching client_id or square_customer_id
            const { data: directMatches, error } = await supabase
                .from('payments')
                .select('*')
                .or(conditions.join(','))
                .order('captured_at', { ascending: false });

            if (error) {
                console.error('Error fetching client payments:', error);
                throw error;
            }

            let allPayments = directMatches || [];
            const existingIds = new Set(allPayments.map((p) => p.id));

            // Also match by email in raw_json if we have a client email
            if (clientEmail) {
                const { data: allPaymentsForEmail } = await supabase
                    .from('payments')
                    .select('*')
                    .order('captured_at', { ascending: false });

                if (allPaymentsForEmail) {
                    // Add payments that match email but aren't already in the list
                    const emailMatches = allPaymentsForEmail.filter((p) => {
                        if (existingIds.has(p.id)) return false;
                        const rawJson = p.raw_json as Record<
                            string,
                            unknown
                        > | null;
                        const buyerEmail = rawJson?.buyer_email_address as
                            | string
                            | undefined;
                        return (
                            buyerEmail &&
                            buyerEmail.toLowerCase() ===
                                clientEmail.toLowerCase()
                        );
                    });
                    allPayments = [...allPayments, ...emailMatches];
                }
            }

            // Sort by captured_at descending
            allPayments.sort((a, b) => {
                const dateA = a.captured_at
                    ? new Date(a.captured_at).getTime()
                    : 0;
                const dateB = b.captured_at
                    ? new Date(b.captured_at).getTime()
                    : 0;
                return dateB - dateA;
            });

            return allPayments as Payment[];
        },
        enabled: isOpen,
    });

    const formatAmount = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const getStatusBadge = (payment: Payment) => {
        if (payment.status === 'captured') {
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Captured
                </Badge>
            );
        }
        if (payment.status === 'refunded') {
            return <Badge variant="destructive">Refunded</Badge>;
        }
        if (payment.status === 'failed') {
            return <Badge variant="destructive">Failed</Badge>;
        }
        if (payment.status === 'partial_refund') {
            return (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Partial Refund
                </Badge>
            );
        }
        return <Badge variant="outline">{payment.status}</Badge>;
    };

    const totalPayments =
        payments
            ?.filter((p) => p.status === 'captured')
            .reduce((sum, p) => sum + p.amount, 0) || 0;
    const paymentCount = payments?.length || 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payments for {clientName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !payments || payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Receipt className="mb-4 h-12 w-12 opacity-50" />
                            <p>No payments found for this client</p>
                            <p className="text-sm">
                                Payments will appear here once synced from
                                Square
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="mb-4 flex items-center gap-6 rounded-lg bg-muted/50 p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Payments
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {paymentCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Captured
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatAmount(totalPayments)}
                                    </p>
                                </div>
                            </div>

                            {/* Payments Table */}
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Refund</TableHead>
                                            <TableHead>Payment ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {payment.captured_at ? (
                                                        format(
                                                            new Date(
                                                                payment.captured_at,
                                                            ),
                                                            'MMM d, yyyy h:mm a',
                                                        )
                                                    ) : (
                                                        <CenteredDash />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatAmount(
                                                        payment.amount,
                                                        payment.currency,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment)}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.refund_amount ? (
                                                        formatAmount(
                                                            payment.refund_amount,
                                                            payment.currency,
                                                        )
                                                    ) : (
                                                        <CenteredDash />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {payment.square_payment_id?.slice(
                                                        0,
                                                        12,
                                                    )}
                                                    ...
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end border-t pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
