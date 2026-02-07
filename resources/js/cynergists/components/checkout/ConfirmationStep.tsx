import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { CheckoutData, TransactionData } from '@/pages/Checkout';
import {
    Building,
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
