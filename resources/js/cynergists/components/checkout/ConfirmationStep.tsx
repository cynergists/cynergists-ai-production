import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { CheckoutData, TransactionData } from '@/pages/Checkout';
import {
    AlertCircle,
    Building,
    Calendar,
    Check,
    Clock,
    Copy,
    CreditCard,
    FileText,
    Mail,
    Receipt,
} from 'lucide-react';

interface ConfirmationStepProps {
    checkoutData: CheckoutData;
    transactionData?: TransactionData;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(date);
};

const ConfirmationStep = ({
    checkoutData,
    transactionData,
}: ConfirmationStepProps) => {
    const { toast } = useToast();
    const displayPlanName =
        checkoutData.planName.charAt(0).toUpperCase() +
        checkoutData.planName.slice(1);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied!',
            description: `${label} copied to clipboard`,
        });
    };

    // Get billing description
    const getBillingDescription = () => {
        if (!transactionData) return 'Monthly Recurring';
        switch (transactionData.billingPeriod) {
            case 'annual':
                return 'Annual Billing';
            case 'mixed':
                return 'Mixed Billing (Monthly & Annual)';
            default:
                return 'Monthly Recurring';
        }
    };

    return (
        <div className="space-y-8">
            {/* Success Header */}
            <div className="card-glass p-8 text-center">
                <div className="mb-6 inline-flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-10 w-10 text-primary" />
                </div>

                <h2 className="font-display mb-4 text-3xl font-bold text-foreground">
                    Payment Successful!
                </h2>

                <p className="mb-6 text-lg text-muted-foreground">
                    Thank you for choosing Cynergists. Your subscription is now
                    active.
                </p>

                <div className="inline-flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-6 py-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm text-foreground">
                        Confirmation sent to{' '}
                        <strong>{checkoutData.contact.email}</strong>
                    </span>
                </div>
            </div>

            {/* Transaction Receipt */}
            <div className="card-glass p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-display flex items-center gap-2 text-lg font-bold text-foreground">
                        <Receipt className="h-5 w-5 text-primary" />
                        Transaction Receipt
                    </h3>
                    {transactionData?.paidAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDate(new Date(transactionData.paidAt))}
                        </div>
                    )}
                </div>

                {/* Transaction ID */}
                {transactionData?.subscriptionId && (
                    <div className="mb-6 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">
                                    Transaction ID
                                </p>
                                <p className="font-mono text-sm text-foreground">
                                    {transactionData.subscriptionId}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    copyToClipboard(
                                        transactionData.subscriptionId!,
                                        'Transaction ID',
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="mb-6 space-y-3">
                    <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                        Order Items
                    </p>
                    {transactionData?.cartItems?.map((item, index) => {
                        const isAnnual = item.billingPeriod === 'annual';
                        const displayPrice = isAnnual
                            ? item.price * 12 * item.quantity
                            : item.price * item.quantity;
                        const periodLabel = isAnnual ? '/yr' : '/mo';

                        return (
                            <div
                                key={index}
                                className="flex justify-between border-b border-border py-2 last:border-0"
                            >
                                <div>
                                    <span className="text-foreground">
                                        {item.name}
                                    </span>
                                    {item.quantity > 1 && (
                                        <span className="ml-1 text-muted-foreground">
                                            x{item.quantity}
                                        </span>
                                    )}
                                    {item.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    )}
                                    {isAnnual && (
                                        <span className="mt-1 inline-block rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                            Annual
                                        </span>
                                    )}
                                </div>
                                <span className="font-medium text-foreground">
                                    {formatPrice(displayPrice)}
                                    {periodLabel}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Payment Summary */}
                <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">
                            {formatPrice(
                                (transactionData?.amountPaid ||
                                    checkoutData.planPrice) -
                                    (transactionData?.processingFee || 0),
                            )}
                        </span>
                    </div>

                    {transactionData?.processingFee &&
                        transactionData.processingFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Processing Fee
                                </span>
                                <span className="text-foreground">
                                    {formatPrice(transactionData.processingFee)}
                                </span>
                            </div>
                        )}

                    <div className="flex justify-between border-t border-border pt-2">
                        <span className="font-semibold text-foreground">
                            Total Paid
                        </span>
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(
                                transactionData?.amountPaid ||
                                    checkoutData.planPrice,
                            )}
                        </span>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                    <div>
                        <p className="mb-1 text-muted-foreground">
                            Payment Method
                        </p>
                        <div className="flex items-center gap-2 text-foreground">
                            {(transactionData?.paymentMethod ||
                                checkoutData.paymentMethod) === 'ach' ? (
                                <>
                                    <Building className="h-4 w-4" />
                                    ACH Bank Transfer
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Credit Card
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="mb-1 text-muted-foreground">
                            Billing Cycle
                        </p>
                        <p className="text-foreground">
                            {getBillingDescription()}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-muted-foreground">Customer</p>
                        <p className="text-foreground">
                            {checkoutData.contact.firstName}{' '}
                            {checkoutData.contact.lastName}
                        </p>
                    </div>
                    {checkoutData.company.companyName && (
                        <div>
                            <p className="mb-1 text-muted-foreground">
                                Company
                            </p>
                            <p className="text-foreground">
                                {checkoutData.company.companyName}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Important Notice */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-destructive" />
                    <div>
                        <h3 className="font-display mb-2 text-lg font-bold text-foreground">
                            Important: Service Activation
                        </h3>
                        <p className="mb-4 text-foreground">
                            Your service will <strong>not begin</strong> until
                            you complete your onboarding call. Scheduling your
                            onboarding is <strong>required</strong> to activate
                            your subscription.
                        </p>
                    </div>
                </div>
            </div>

            {/* Onboarding Scheduling */}
            <div className="card-glass p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                            Final Step: Schedule Your Onboarding Call
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            This is required to start your services
                        </p>
                    </div>
                </div>

                {/* Calendar Embed Placeholder */}
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-background/50 p-8">
                    <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium text-foreground">
                        Onboarding Calendar
                    </p>
                    <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
                        Calendar embed will be configured here. Select a time
                        that works best for your 30-minute onboarding call.
                    </p>

                    {/* Temporary placeholder - will be replaced with actual calendar embed */}
                    <div className="rounded bg-muted/50 p-4 text-center text-xs text-muted-foreground">
                        <p className="mb-1 font-medium">
                            Calendar Integration Pending
                        </p>
                        <p>
                            The calendar embed will be added once you provide
                            the scheduling tool details.
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Can&apos;t find a time that works?{' '}
                        <Button
                            variant="link"
                            className="h-auto p-0 text-primary"
                            asChild
                        >
                            <a href="mailto:support@cynergists.com">
                                Contact us directly
                            </a>
                        </Button>
                    </p>
                </div>
            </div>

            {/* What's Next */}
            <div className="card-glass p-6">
                <h3 className="font-display mb-4 text-lg font-bold text-foreground">
                    What Happens Next?
                </h3>

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            1
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                Schedule Your Onboarding
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Pick a time above to meet with your dedicated
                                account manager
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                Complete Onboarding Call
                            </p>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ll discuss your priorities, set up
                                communication channels, and assign your team
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                            3
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                Start Working Together
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Your services begin immediately after onboarding
                                is complete
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print/Save Receipt */}
            <div className="text-center">
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="gap-2"
                >
                    <FileText className="h-4 w-4" />
                    Print Receipt
                </Button>
            </div>
        </div>
    );
};

export default ConfirmationStep;
