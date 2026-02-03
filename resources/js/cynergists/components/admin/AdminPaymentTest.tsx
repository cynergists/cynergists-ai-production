import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { formatPercent } from '@/lib/utils';
import {
    AlertTriangle,
    Building2,
    CreditCard,
    FlaskConical,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type PaymentMethod = 'card' | 'ach';
type BillingPeriod = 'monthly' | 'annual' | 'one_time';

declare global {
    interface Window {
        Square?: {
            payments: (
                appId: string,
                locationId: string,
            ) => Promise<SquarePayments>;
        };
    }
}

interface SquareCardOptions {
    style?: Record<string, Record<string, string>>;
}

interface SquarePayments {
    card: (options?: SquareCardOptions) => Promise<SquareCard>;
    ach?: () => Promise<SquareACH>;
}

interface SquareCard {
    attach: (selector: string) => Promise<void>;
    tokenize: () => Promise<{
        status: string;
        token?: string;
        errors?: Array<{ message: string }>;
    }>;
    destroy: () => void;
}

interface SquareACH {
    tokenize: (options: {
        accountHolderName: string;
        intent: string;
        amount: string;
        currency: string;
        transactionId?: string;
    }) => Promise<{
        status: string;
        token?: string;
        errors?: Array<{ message: string }>;
    }>;
}

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
};

const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
};

const generateIdempotencyKey = () => {
    return `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export function AdminPaymentTest() {
    const { toast } = useToast();
    const { settings: paymentSettings, loading: settingsLoading } =
        usePaymentSettings();

    const [billingPeriod, setBillingPeriod] =
        useState<BillingPeriod>('one_time');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [squareLoaded, setSquareLoaded] = useState(false);
    const [squareCard, setSquareCard] = useState<SquareCard | null>(null);
    const [squarePayments, setSquarePayments] = useState<SquarePayments | null>(
        null,
    );
    const [locationId, setLocationId] = useState<string | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [cardInitError, setCardInitError] = useState<string | null>(null);
    const [isInitializingCard, setIsInitializingCard] = useState(false);
    const cardContainerRef = useRef<HTMLDivElement>(null);

    // Sandbox card details (only shown in sandbox mode)
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    // ACH details
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState<'checking' | 'savings'>(
        'checking',
    );

    const isProduction = paymentSettings.paymentMode === 'production';

    // Test price is always $1 regardless of billing type
    const testPrice = 1;

    // Fee calculation
    const feeRate =
        paymentMethod === 'card' ? paymentSettings.creditCardFeeRate : 0;
    const processingFee = testPrice * feeRate;
    const totalDue = testPrice + processingFee;

    // Load Square SDK for production mode
    useEffect(() => {
        if (isProduction && !squareLoaded) {
            const script = document.createElement('script');
            script.src = 'https://web.squarecdn.com/v1/square.js';
            script.async = true;
            script.onload = () => setSquareLoaded(true);
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [isProduction, squareLoaded]);

    // Fetch location ID and application ID from edge function
    useEffect(() => {
        if (isProduction && (!locationId || !applicationId)) {
            fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-square-payment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'get-location' }),
                },
            )
                .then((res) => res.json())
                .then((data) => {
                    console.log('Square config received:', {
                        locationId: data.locationId,
                        applicationId: data.applicationId,
                        paymentMode: data.paymentMode,
                    });
                    if (data.locationId) setLocationId(data.locationId);
                    if (data.applicationId)
                        setApplicationId(data.applicationId);
                    if (data.error) {
                        console.error(
                            'Error fetching Square config:',
                            data.error,
                        );
                        setCardInitError(data.error);
                    }
                })
                .catch((err) => {
                    console.error('Failed to fetch Square config:', err);
                    setCardInitError('Failed to connect to payment service');
                });
        }
    }, [isProduction, locationId, applicationId]);

    // Initialize Square Card for production card payments
    useEffect(() => {
        let isMounted = true;
        let cardInstance: SquareCard | null = null;

        const initSquareCard = async () => {
            // Need applicationId from edge function now
            if (
                !isProduction ||
                !squareLoaded ||
                !window.Square ||
                !locationId ||
                !applicationId ||
                paymentMethod !== 'card'
            ) {
                return;
            }

            // Wait for the container to be rendered
            const container = document.getElementById('square-card-container');
            if (!container) {
                // Retry after a short delay if container isn't ready
                setTimeout(() => {
                    if (isMounted) initSquareCard();
                }, 100);
                return;
            }

            setIsInitializingCard(true);
            setCardInitError(null);

            try {
                // Clean up any existing Square card first
                if (squareCard) {
                    try {
                        squareCard.destroy();
                    } catch (e) {
                        console.warn(
                            'Error destroying previous Square card:',
                            e,
                        );
                    }
                    setSquareCard(null);
                }

                console.log('Initializing Square payments with:', {
                    applicationId,
                    locationId,
                });
                const payments = await window.Square.payments(
                    applicationId,
                    locationId,
                );
                if (!isMounted) return;

                setSquarePayments(payments);

                // Dark mode styling for Square card to match ACH inputs
                const darkModeCardStyle = {
                    input: {
                        backgroundColor: 'transparent',
                        color: '#e2e8f0',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                    },
                    'input::placeholder': {
                        color: '#64748b',
                    },
                    'input.is-focus': {
                        backgroundColor: 'transparent',
                        color: '#e2e8f0',
                    },
                    '.input-container': {
                        borderColor: '#334155',
                        borderWidth: '1px',
                        borderRadius: '6px',
                    },
                    '.input-container.is-focus': {
                        borderColor: '#84cc16',
                        borderWidth: '1px',
                    },
                    '.input-container.is-error': {
                        borderColor: '#ef4444',
                        borderWidth: '1px',
                    },
                    '.message-text': {
                        color: '#94a3b8',
                    },
                    '.message-icon': {
                        color: '#94a3b8',
                    },
                    '.message-text.is-error': {
                        color: '#ef4444',
                    },
                    '.message-icon.is-error': {
                        color: '#ef4444',
                    },
                };

                const card = await payments.card({
                    style: darkModeCardStyle,
                });
                if (!isMounted) {
                    card.destroy();
                    return;
                }

                cardInstance = card;

                // Double-check container still exists before attaching
                const containerCheck = document.getElementById(
                    'square-card-container',
                );
                if (!containerCheck) {
                    card.destroy();
                    return;
                }

                await card.attach('#square-card-container');
                if (!isMounted) {
                    card.destroy();
                    return;
                }

                setSquareCard(card);
                setCardInitError(null);
                console.log('Square card initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Square card:', error);
                if (isMounted) {
                    setCardInitError(
                        error instanceof Error
                            ? error.message
                            : 'An unexpected error occurred while initializing the payment method',
                    );
                }
            } finally {
                if (isMounted) {
                    setIsInitializingCard(false);
                }
            }
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(initSquareCard, 50);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (cardInstance) {
                try {
                    cardInstance.destroy();
                } catch (e) {
                    console.warn('Error destroying Square card on cleanup:', e);
                }
            }
        };
    }, [isProduction, squareLoaded, locationId, applicationId, paymentMethod]);

    const isSandboxCardValid = () => {
        const cardClean = cardNumber.replace(/\s/g, '');
        return (
            cardClean.length >= 15 &&
            expiry.length === 5 &&
            cvv.length >= 3 &&
            cardName.trim().length >= 2
        );
    };

    const isACHValid = () => {
        return (
            accountNumber.length >= 4 &&
            routingNumber.length === 9 &&
            accountName.trim().length >= 2
        );
    };

    const isFormValid = () => {
        if (paymentMethod === 'card') {
            return isProduction ? squareCard !== null : isSandboxCardValid();
        }
        return isACHValid();
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        setIsProcessing(true);

        try {
            let sourceId: string;

            if (isProduction) {
                // Tokenize with Square SDK
                if (paymentMethod === 'card' && squareCard) {
                    const result = await squareCard.tokenize();
                    if (result.status !== 'OK' || !result.token) {
                        throw new Error(
                            result.errors?.[0]?.message ||
                                'Card tokenization failed',
                        );
                    }
                    sourceId = result.token;
                } else if (paymentMethod === 'ach' && squarePayments) {
                    const ach = await squarePayments.ach();
                    const result = await ach.tokenize({
                        accountHolderName: accountName,
                        intent: 'CHARGE',
                        amount: totalDue.toFixed(2),
                        currency: 'USD',
                    });
                    if (result.status !== 'OK' || !result.token) {
                        throw new Error(
                            result.errors?.[0]?.message ||
                                'ACH tokenization failed',
                        );
                    }
                    sourceId = result.token;
                } else {
                    throw new Error('Payment method not properly initialized');
                }
            } else {
                // Use sandbox test nonces
                sourceId =
                    paymentMethod === 'card'
                        ? 'cnon:card-nonce-ok'
                        : 'cnon:bank-ach-ok';
            }

            const paymentData = {
                customerEmail: 'admin-test@cynergists.com',
                customerName: 'Test Admin',
                amount: Math.round(totalDue * 100),
                currency: 'USD',
                planName: `Test Plan (${billingPeriod === 'one_time' ? 'One-Time' : billingPeriod})`,
                monthlyPrice: Math.round(testPrice * 100),
                billingPeriod:
                    billingPeriod === 'one_time' ? 'monthly' : billingPeriod, // Backend expects monthly/annual
                paymentType: paymentMethod,
                sourceId: sourceId,
                idempotencyKey: generateIdempotencyKey(),
                isOneTime: billingPeriod === 'one_time',
            };

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-square-payment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Payment processing failed');
            }

            toast({
                title: 'Test Payment Successful',
                description: `Subscription created: ${result.subscriptionId || 'N/A'}`,
            });

            // Reset form
            setCardNumber('');
            setExpiry('');
            setCvv('');
            setCardName('');
            setAccountNumber('');
            setRoutingNumber('');
            setAccountName('');
        } catch (error) {
            toast({
                title: 'Payment Failed',
                description:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (settingsLoading) {
        return (
            <Card className="border-dashed border-primary/30">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-dashed border-primary/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                            Quick Payment Test
                        </CardTitle>
                    </div>
                    <Badge variant={isProduction ? 'destructive' : 'secondary'}>
                        {isProduction ? 'PRODUCTION' : 'SANDBOX'}
                    </Badge>
                </div>
                <CardDescription>
                    {isProduction
                        ? '⚠️ Real payments will be processed - use real card/bank details'
                        : 'Test the payment flow with $1 using sandbox mode'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Production Warning */}
                {isProduction && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div>
                            <p className="font-medium text-destructive">
                                Production Mode Active
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                This will process real payments. Use real credit
                                card or bank account information.
                            </p>
                        </div>
                    </div>
                )}

                {/* Order Summary */}
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between text-sm">
                        <span>
                            Test Plan (
                            {billingPeriod === 'one_time'
                                ? 'One-Time'
                                : billingPeriod}
                            )
                        </span>
                        <span>{formatPrice(testPrice)}</span>
                    </div>
                    {paymentMethod === 'card' && processingFee > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                Processing Fee ({formatPercent(feeRate, true)})
                            </span>
                            <span>{formatPrice(processingFee)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Due</span>
                        <span>{formatPrice(totalDue)}</span>
                    </div>
                </div>

                {/* Billing Type Toggle */}
                <div className="space-y-2">
                    <Label>Billing Type (tests different payment flows)</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={
                                billingPeriod === 'one_time'
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => setBillingPeriod('one_time')}
                        >
                            One-Time $1
                        </Button>
                        <Button
                            type="button"
                            variant={
                                billingPeriod === 'monthly'
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => setBillingPeriod('monthly')}
                        >
                            Monthly $1
                        </Button>
                        <Button
                            type="button"
                            variant={
                                billingPeriod === 'annual'
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => setBillingPeriod('annual')}
                        >
                            Annual $1
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        One-Time: single charge • Monthly/Annual: creates
                        subscription
                    </p>
                </div>

                {/* Payment Method Toggle */}
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={
                                paymentMethod === 'ach' ? 'default' : 'outline'
                            }
                            className="justify-start"
                            onClick={() => {
                                // Destroy Square card BEFORE switching to ACH to prevent DOM conflicts
                                if (squareCard) {
                                    try {
                                        squareCard.destroy();
                                    } catch (e) {
                                        console.warn(
                                            'Error destroying Square card before switch:',
                                            e,
                                        );
                                    }
                                    setSquareCard(null);
                                }
                                setPaymentMethod('ach');
                            }}
                            disabled={!isProduction} // ACH only works in production
                        >
                            <Building2 className="mr-2 h-4 w-4" />
                            ACH Bank
                            {!isProduction && (
                                <span className="ml-1 text-xs">
                                    (prod only)
                                </span>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant={
                                paymentMethod === 'card' ? 'default' : 'outline'
                            }
                            className="justify-start"
                            onClick={() => setPaymentMethod('card')}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Credit Card
                        </Button>
                    </div>
                </div>

                {/* Payment Form */}
                {paymentMethod === 'card' ? (
                    isProduction ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Card Details</Label>
                                {cardInitError ? (
                                    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                        <div>
                                            <p className="text-sm font-medium text-destructive">
                                                Payment Form Error
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {cardInitError}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() =>
                                                    window.location.reload()
                                                }
                                            >
                                                Refresh Page
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={`square-card-${applicationId}-${locationId}`}
                                        id="square-card-container"
                                        ref={cardContainerRef}
                                        className="min-h-[48px] rounded-md border border-input bg-background px-3 py-2"
                                    >
                                        {(isInitializingCard ||
                                            !squareCard) && (
                                            <div className="flex h-[48px] items-center justify-center text-muted-foreground">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span className="text-sm">
                                                    Loading payment form...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input
                                    id="cardNumber"
                                    placeholder="4111 1111 1111 1111"
                                    value={cardNumber}
                                    onChange={(e) =>
                                        setCardNumber(
                                            formatCardNumber(e.target.value),
                                        )
                                    }
                                    maxLength={19}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry</Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) =>
                                            setExpiry(
                                                formatExpiry(e.target.value),
                                            )
                                        }
                                        maxLength={5}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) =>
                                            setCvv(
                                                e.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 4),
                                            )
                                        }
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardName">Name on Card</Label>
                                <Input
                                    id="cardName"
                                    placeholder="Test User"
                                    value={cardName}
                                    onChange={(e) =>
                                        setCardName(e.target.value)
                                    }
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Sandbox mode: Use test card 4111 1111 1111 1111
                            </p>
                        </div>
                    )
                ) : (
                    <div className="space-y-4">
                        {!isProduction && (
                            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                <p className="text-xs text-muted-foreground">
                                    ACH is only available in production mode.
                                    Switch to production to test real bank
                                    transfers.
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="routingNumber">
                                Routing Number
                            </Label>
                            <Input
                                id="routingNumber"
                                placeholder="110000000"
                                value={routingNumber}
                                onChange={(e) =>
                                    setRoutingNumber(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 9),
                                    )
                                }
                                maxLength={9}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">
                                Account Number
                            </Label>
                            <Input
                                id="accountNumber"
                                placeholder="000123456789"
                                value={accountNumber}
                                onChange={(e) =>
                                    setAccountNumber(
                                        e.target.value.replace(/\D/g, ''),
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountName">
                                Account Holder Name
                            </Label>
                            <Input
                                id="accountName"
                                placeholder="Test User"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Type</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        accountType === 'checking'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setAccountType('checking')}
                                >
                                    Checking
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        accountType === 'savings'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setAccountType('savings')}
                                >
                                    Savings
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    className="w-full"
                    variant={isProduction ? 'destructive' : 'default'}
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {isProduction
                                ? 'Process Real Payment'
                                : 'Process Test Payment'}
                        </>
                    )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    {isProduction
                        ? 'Real charges will be applied to the payment method'
                        : 'Uses sandbox test nonces for payment processing'}
                </p>
            </CardContent>
        </Card>
    );
}
