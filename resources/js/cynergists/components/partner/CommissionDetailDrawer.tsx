import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    HelpCircle,
    Loader2,
    User,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    payout_id: string | null;
    customer_id: string | null;
    product_name: string | null;
    notes: string | null;
    customer?: { name: string; company: string | null } | null;
}

interface CommissionDetailDrawerProps {
    commission: Commission | null;
    isOpen: boolean;
    onClose: () => void;
    partnerId: string;
    onUpdate?: () => void;
}

const statusConfig: Record<
    string,
    { label: string; icon: React.ComponentType<any>; className: string }
> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    earned: {
        label: 'Earned',
        icon: CheckCircle2,
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    payable: {
        label: 'Payable',
        icon: Wallet,
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    paid: {
        label: 'Paid',
        icon: CheckCircle2,
        className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    clawed_back: {
        label: 'Clawed Back',
        icon: AlertTriangle,
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    disputed: {
        label: 'Disputed',
        icon: HelpCircle,
        className:
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    },
};

export function CommissionDetailDrawer({
    commission,
    isOpen,
    onClose,
    partnerId,
    onUpdate,
}: CommissionDetailDrawerProps) {
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDetails, setDisputeDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const handleDispute = async () => {
        if (!commission || !disputeReason) {
            toast.error('Please provide a reason for the dispute');
            return;
        }

        setSubmitting(true);
        try {
            // Create dispute record
            const { data: dispute, error: disputeError } = await supabase
                .from('disputes')
                .insert({
                    partner_id: partnerId,
                    commission_id: commission.id,
                    reason: disputeReason,
                    details: disputeDetails || null,
                    prior_commission_status: commission.status,
                    status: 'open',
                })
                .select()
                .single();

            if (disputeError) throw disputeError;

            // Update commission status to disputed
            const { error: commissionError } = await supabase
                .from('partner_commissions')
                .update({ status: 'disputed' })
                .eq('id', commission.id);

            if (commissionError) throw commissionError;

            // Create support ticket
            const { error: ticketError } = await supabase
                .from('partner_tickets')
                .insert({
                    partner_id: partnerId,
                    subject: `Commission Dispute: ${commission.customer?.name || 'Customer'}`,
                    message: `Dispute Reason: ${disputeReason}\n\nDetails: ${disputeDetails || 'None provided'}\n\nCommission ID: ${commission.id}\nAmount: ${formatCurrency(commission.net_amount)}`,
                    category: 'commission',
                    commission_id: commission.id,
                    status: 'open',
                });

            if (ticketError) {
                console.error('Failed to create ticket:', ticketError);
            }

            toast.success(
                "Dispute submitted. We'll review and get back to you.",
            );
            setDisputeOpen(false);
            setDisputeReason('');
            setDisputeDetails('');
            onUpdate?.();
            onClose();
        } catch (error) {
            console.error('Error creating dispute:', error);
            toast.error('Failed to submit dispute');
        } finally {
            setSubmitting(false);
        }
    };

    if (!commission) return null;

    const statusInfo = statusConfig[commission.status] || statusConfig.pending;
    const StatusIcon = statusInfo.icon;
    const canDispute = ['pending', 'earned', 'payable', 'clawed_back'].includes(
        commission.status,
    );

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Commission Details
                        </SheetTitle>
                        <Badge className={statusInfo.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                        </Badge>
                    </SheetHeader>

                    <ScrollArea className="-mx-6 flex-1 px-6">
                        <div className="space-y-6 pb-6">
                            {/* Amount */}
                            <div className="rounded-lg bg-muted/30 py-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Commission Amount
                                </p>
                                <p className="text-3xl font-bold text-primary">
                                    {formatCurrency(commission.net_amount)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {Math.round(
                                        commission.commission_rate * 100,
                                    )}
                                    % of{' '}
                                    {formatCurrency(commission.gross_amount)}
                                </p>
                            </div>

                            <Separator />

                            {/* Customer Info */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Customer
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {commission.customer?.name || '—'}
                                        </span>
                                    </div>
                                    {commission.customer?.company && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {commission.customer.company}
                                            </span>
                                        </div>
                                    )}
                                    {commission.product_name && (
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {commission.product_name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Timeline */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Timeline
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Earned
                                        </span>
                                        <span>
                                            {commission.earned_at
                                                ? format(
                                                      new Date(
                                                          commission.earned_at,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : format(
                                                      new Date(
                                                          commission.created_at,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Clawback Until
                                        </span>
                                        <span
                                            className={
                                                commission.clawback_eligible_until &&
                                                new Date(
                                                    commission.clawback_eligible_until,
                                                ) > new Date()
                                                    ? 'text-yellow-600'
                                                    : ''
                                            }
                                        >
                                            {commission.clawback_eligible_until
                                                ? format(
                                                      new Date(
                                                          commission.clawback_eligible_until,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Payable At
                                        </span>
                                        <span>
                                            {commission.payable_at
                                                ? format(
                                                      new Date(
                                                          commission.payable_at,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Paid At
                                        </span>
                                        <span
                                            className={
                                                commission.paid_at
                                                    ? 'text-green-600'
                                                    : ''
                                            }
                                        >
                                            {commission.paid_at
                                                ? format(
                                                      new Date(
                                                          commission.paid_at,
                                                      ),
                                                      'MMM d, yyyy',
                                                  )
                                                : '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {commission.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground">
                                            Notes
                                        </h4>
                                        <p className="text-sm">
                                            {commission.notes}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Dispute Button */}
                            {canDispute && (
                                <>
                                    <Separator />
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                                        onClick={() => setDisputeOpen(true)}
                                    >
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Dispute This Commission
                                    </Button>
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Dispute Dialog */}
            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dispute Commission</DialogTitle>
                        <DialogDescription>
                            Explain why you believe this commission is
                            incorrect. We'll review and respond within 2
                            business days.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason *</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Incorrect rate, wrong customer attribution"
                                value={disputeReason}
                                onChange={(e) =>
                                    setDisputeReason(e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="details">Additional Details</Label>
                            <Textarea
                                id="details"
                                placeholder="Provide any additional context or evidence..."
                                value={disputeDetails}
                                onChange={(e) =>
                                    setDisputeDetails(e.target.value)
                                }
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setDisputeOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDispute}
                                disabled={submitting || !disputeReason}
                            >
                                {submitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Dispute
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
