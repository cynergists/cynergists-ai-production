import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Building,
    Check,
    CreditCard,
    Loader2,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

type PaymentMethod = 'credit_card' | 'ach' | null;

interface PartnerPaymentFormProps {
    productName: string;
    productPrice: number;
    partnerEmail: string;
    partnerName: string;
    companyName?: string;
    onSuccess: (transactionData: TransactionResult) => void;
    onBack: () => void;
}

export interface TransactionResult {
    transactionId?: string;
    subscriptionId?: string;
    customerId?: string;
    amountPaid: number;
    processingFee: number;
    paymentMethod: PaymentMethod;
    paidAt: Date;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : '';
};

const formatExpiry = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
};

const generateIdempotencyKey = () => {
    return `partner-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export function PartnerPaymentForm({
    productName,
    productPrice,
    partnerEmail,
    partnerName,
    companyName,
    onSuccess,
    onBack,
}: PartnerPaymentFormProps) {
    const { settings: paymentSettings } = usePaymentSettings();
    const { toast } = useToast();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Credit Card State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState(partnerName);

    // ACH State
    const [routingNumber, setRoutingNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState(partnerName);
    const [accountType, setAccountType] = useState<'checking' | 'savings'>(
        'checking',
    );

    // No processing fee - we absorb credit card fees
    const processingFee = 0;
    const totalAmount = productPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const sourceId = 'pending-tokenization';

            const cartItemsForApi = [
                {
                    name: productName,
                    description: 'Partner LinkedIn Outreach Package',
                    quantity: 1,
                    price: Math.round(productPrice * 100), // Convert to cents
                },
            ];

            const { data, error } = await supabase.functions.invoke(
                'process-square-payment',
                {
                    body: {
                        sourceId,
                        amount: Math.round(totalAmount * 100), // Total in cents
                        currency: 'USD',
                        customerEmail: partnerEmail,
                        customerName: partnerName,
                        planName: productName,
                        billingPeriod: 'monthly',
                        monthlyPrice: Math.round(productPrice * 100),
                        idempotencyKey: generateIdempotencyKey(),
                        paymentType:
                            selectedMethod === 'credit_card' ? 'card' : 'ach',
                        cartItems: cartItemsForApi,
                        processingFee: 0,
                        isPartnerPurchase: true,
                        companyName: companyName,
                    },
                },
            );

            if (error) {
                throw new Error(error.message || 'Payment processing failed');
            }

            if (data?.success) {
                const transactionData: TransactionResult = {
                    transactionId: data?.transactionId,
                    subscriptionId: data?.subscriptionId,
                    customerId: data?.customerId,
                    amountPaid: totalAmount,
                    processingFee: 0,
                    paymentMethod: selectedMethod,
                    paidAt: new Date(),
                };

                // Send confirmation email (don't block on this)
                const isTestMode = paymentSettings.paymentMode === 'sandbox';
                supabase.functions
                    .invoke('send-checkout-confirmation', {
                        body: {
                            customerEmail: partnerEmail,
                            customerName: partnerName,
                            planName: productName,
                            billingPeriod: 'monthly',
                            amountPaid: Math.round(totalAmount * 100),
                            cartItems: cartItemsForApi,
                            paymentMethod: selectedMethod,
                            processingFee: 0,
                            companyName: companyName || undefined,
                            transactionId:
                                data?.subscriptionId || data?.transactionId,
                            isTestMode,
                            isPartnerPurchase: true,
                        },
                    })
                    .catch((err) =>
                        console.error(
                            'Failed to send confirmation email:',
                            err,
                        ),
                    );

                toast({
                    title: 'Payment Successful',
                    description: 'Your subscription is now active!',
                });

                onSuccess(transactionData);
            } else {
                throw new Error(data?.error || 'Payment failed');
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'There was an error processing your payment. Please try again.';
            toast({
                title: 'Payment Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const isCreditCardValid = () => {
        const cardDigits = cardNumber.replace(/\s/g, '');
        const expiryParts = expiry.split('/');
        return (
            cardDigits.length === 16 &&
            expiryParts.length === 2 &&
            expiryParts[0].length === 2 &&
            expiryParts[1].length === 2 &&
            cvv.length >= 3 &&
            cardName.trim().length > 0
        );
    };

    const isACHValid = () => {
        return (
            routingNumber.length === 9 &&
            accountNumber.length >= 4 &&
            accountName.trim().length > 0
        );
    };

    const isFormValid =
        selectedMethod === 'credit_card'
            ? isCreditCardValid()
            : selectedMethod === 'ach'
              ? isACHValid()
              : false;

    return (
        <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <p className="mb-3 font-semibold text-foreground">
                    Order Summary
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            {productName}
                        </span>
                        <span className="text-foreground">
                            {formatPrice(productPrice)}/mo
                        </span>
                    </div>

                    <div className="flex justify-between border-t border-primary/20 pt-2">
                        <span className="font-semibold text-foreground">
                            Due Today
                        </span>
                        <span className="text-xl font-bold text-primary">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>

                    <p className="text-right text-xs text-muted-foreground">
                        Billed monthly • Cancel anytime
                    </p>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
                <Label className="font-medium text-foreground">
                    Select Payment Method
                </Label>

                {/* ACH Option */}
                <button
                    type="button"
                    onClick={() => setSelectedMethod('ach')}
                    className={cn(
                        'w-full rounded-lg border-2 p-4 text-left transition-all duration-200',
                        selectedMethod === 'ach'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card/50 hover:border-primary/50',
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                'rounded-lg p-2',
                                selectedMethod === 'ach'
                                    ? 'bg-primary/20'
                                    : 'bg-muted',
                            )}
                        >
                            <Building
                                className={cn(
                                    'h-5 w-5',
                                    selectedMethod === 'ach'
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">
                                    ACH Bank Transfer
                                </h3>
                                {selectedMethod === 'ach' && (
                                    <Check className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No processing fees
                            </p>
                        </div>
                    </div>
                </button>

                {/* Credit Card Option */}
                <button
                    type="button"
                    onClick={() => setSelectedMethod('credit_card')}
                    className={cn(
                        'w-full rounded-lg border-2 p-4 text-left transition-all duration-200',
                        selectedMethod === 'credit_card'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card/50 hover:border-primary/50',
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                'rounded-lg p-2',
                                selectedMethod === 'credit_card'
                                    ? 'bg-primary/20'
                                    : 'bg-muted',
                            )}
                        >
                            <CreditCard
                                className={cn(
                                    'h-5 w-5',
                                    selectedMethod === 'credit_card'
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">
                                    Credit Card
                                </h3>
                                {selectedMethod === 'credit_card' && (
                                    <Check className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Pay securely with your card
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Payment Details Form */}
            {selectedMethod && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 border-t border-border pt-6"
                >
                    <div className="mb-4 flex items-center gap-2">
                        {selectedMethod === 'credit_card' ? (
                            <CreditCard className="h-4 w-4 text-primary" />
                        ) : (
                            <Building className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium text-foreground">
                            {selectedMethod === 'credit_card'
                                ? 'Credit Card Details'
                                : 'Bank Account Details'}
                        </span>
                    </div>

                    {selectedMethod === 'credit_card' ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardName">
                                    Cardholder Name
                                </Label>
                                <Input
                                    id="cardName"
                                    name="ccname"
                                    type="text"
                                    autoComplete="cc-name"
                                    value={cardName}
                                    onChange={(e) =>
                                        setCardName(e.target.value)
                                    }
                                    placeholder="John Smith"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <div className="relative">
                                    <Input
                                        id="cardNumber"
                                        name="cardnumber"
                                        type="text"
                                        autoComplete="cc-number"
                                        inputMode="numeric"
                                        value={cardNumber}
                                        onChange={(e) =>
                                            setCardNumber(
                                                formatCardNumber(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="4242 4242 4242 4242"
                                        maxLength={19}
                                        required
                                    />
                                    <CreditCard className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">
                                        Expiration Date
                                    </Label>
                                    <Input
                                        id="expiry"
                                        name="cc-exp"
                                        type="text"
                                        autoComplete="cc-exp"
                                        inputMode="numeric"
                                        value={expiry}
                                        onChange={(e) =>
                                            setExpiry(
                                                formatExpiry(e.target.value),
                                            )
                                        }
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        name="cvc"
                                        type="text"
                                        autoComplete="cc-csc"
                                        inputMode="numeric"
                                        value={cvv}
                                        onChange={(e) =>
                                            setCvv(
                                                e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 4),
                                            )
                                        }
                                        placeholder="123"
                                        maxLength={4}
                                        required
                                    />
                                </div>
                            </div>

                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" />
                                Your payment is securely processed
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="accountName">
                                    Account Holder Name
                                </Label>
                                <Input
                                    id="accountName"
                                    name="account-name"
                                    type="text"
                                    autoComplete="name"
                                    value={accountName}
                                    onChange={(e) =>
                                        setAccountName(e.target.value)
                                    }
                                    placeholder="John Smith or Company Name"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="routingNumber">
                                        Routing Number
                                    </Label>
                                    <Input
                                        id="routingNumber"
                                        type="text"
                                        value={routingNumber}
                                        onChange={(e) =>
                                            setRoutingNumber(
                                                e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 9),
                                            )
                                        }
                                        placeholder="123456789"
                                        maxLength={9}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">
                                        Account Number
                                    </Label>
                                    <Input
                                        id="accountNumber"
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        placeholder="••••••••1234"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Account Type</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAccountType('checking')
                                        }
                                        className={cn(
                                            'rounded-lg border-2 p-3 text-center transition-all',
                                            accountType === 'checking'
                                                ? 'border-primary bg-primary/10 text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary/50',
                                        )}
                                    >
                                        Checking
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAccountType('savings')
                                        }
                                        className={cn(
                                            'rounded-lg border-2 p-3 text-center transition-all',
                                            accountType === 'savings'
                                                ? 'border-primary bg-primary/10 text-foreground'
                                                : 'border-border bg-card/50 text-muted-foreground hover:border-primary/50',
                                        )}
                                    >
                                        Savings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Secure Payment
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your payment information is encrypted and
                                securely processed
                            </p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={isProcessing}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="btn-primary w-full sm:flex-1"
                            disabled={!isFormValid || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Complete Purchase -{' '}
                                    {formatPrice(totalAmount)}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Back button when no method selected */}
            {!selectedMethod && (
                <div className="pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Agreement
                    </Button>
                </div>
            )}
        </div>
    );
}
