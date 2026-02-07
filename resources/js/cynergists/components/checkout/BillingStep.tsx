import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import type { TransactionData } from '@/pages/Checkout';
import {
    CheckCircle2,
    CreditCard,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const getCsrfToken = (): string | null =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? null;

// Square SDK types
interface SquareCardLocal {
    attach: (selector: string) => Promise<void>;
    tokenize: () => Promise<{
        status: string;
        token?: string;
        errors?: Array<{ message: string }>;
    }>;
    destroy: () => void;
}

interface BillingStepProps {
    onNext: () => void;
    onTransactionComplete: (transaction: TransactionData) => void;
    user?: { id: string; name: string; email: string } | null;
}

type AccountState =
    | 'checking'
    | 'enter_email'
    | 'logged_in'
    | 'existing_user'
    | 'new_user'
    | 'registering';

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
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const BillingStep = ({
    onNext,
    onTransactionComplete,
    user,
}: BillingStepProps) => {
    const { items, clearCart } = useCart();
    const { settings: paymentSettings } = usePaymentSettings();
    const squareCardRef = useRef<SquareCardLocal | null>(null);

    // Account state
    const [accountState, setAccountState] = useState<AccountState>('checking');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<{
        name: string;
        email: string;
    } | null>(null);

    // Form errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Payment state
    const [isProcessing, setIsProcessing] = useState(false);
    const [squareLoaded, setSquareLoaded] = useState(false);
    const [squareCard, setSquareCard] = useState<SquareCardLocal | null>(null);
    const [locationId, setLocationId] = useState<string | null>(null);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [isInitializingCard, setIsInitializingCard] = useState(false);
    const [cardInitError, setCardInitError] = useState<string | null>(null);

    // Sandbox card state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    const isProduction = paymentSettings.paymentMode === 'production';

    // Calculate totals
    const monthlyItems = items.filter(
        (item) => item.billingPeriod === 'monthly',
    );
    const annualItems = items.filter((item) => item.billingPeriod === 'annual');
    const monthlyItemsTotal = monthlyItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const annualItemsTotal = annualItems.reduce(
        (sum, item) => sum + item.price * 12 * item.quantity,
        0,
    );
    const amountDue = annualItemsTotal + monthlyItemsTotal;
    const hasAnnualItems = annualItems.length > 0;
    const hasMonthlyItems = monthlyItems.length > 0;
    const hasMixedBilling = hasAnnualItems && hasMonthlyItems;

    // Build order description
    const orderDescription = items
        .map(
            (item) =>
                `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`,
        )
        .join(', ');

    // Check if user is logged in via Inertia props
    useEffect(() => {
        if (user) {
            // User is logged in
            setLoggedInUser({ name: user.name, email: user.email });
            setEmail(user.email);
            setAccountState('logged_in');
            setCardName(user.name || '');
        } else {
            // User is not logged in
            setAccountState('enter_email');
        }
    }, [user]);

    // Load Square SDK
    useEffect(() => {
        if (isProduction && !squareLoaded) {
            const script = document.createElement('script');
            script.src = 'https://web.squarecdn.com/v1/square.js';
            script.async = true;
            script.onload = () => setSquareLoaded(true);
            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            };
        }
    }, [isProduction, squareLoaded]);

    // Fetch Square config from Laravel API
    useEffect(() => {
        if (isProduction && (!locationId || !applicationId)) {
            fetch('/api/payment/config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(getCsrfToken() && {
                        'X-CSRF-TOKEN': getCsrfToken()!,
                    }),
                },
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.locationId) setLocationId(data.locationId);
                    if (data.applicationId)
                        setApplicationId(data.applicationId);
                    if (data.error) setCardInitError(data.error);
                })
                .catch((err) => {
                    console.error('Failed to fetch Square config:', err);
                    setCardInitError('Failed to connect to payment service');
                });
        }
    }, [isProduction, locationId, applicationId]);

    // Initialize Square Card
    useEffect(() => {
        let isMounted = true;
        let cardInstance: SquareCardLocal | null = null;

        const initSquareCard = async () => {
            if (
                !isProduction ||
                !squareLoaded ||
                !window.Square ||
                !locationId ||
                !applicationId
            ) {
                return;
            }

            const container = document.getElementById('square-card-container');
            if (!container) {
                setTimeout(() => {
                    if (isMounted) initSquareCard();
                }, 100);
                return;
            }

            setIsInitializingCard(true);
            setCardInitError(null);

            try {
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

                const payments = await window.Square.payments(
                    applicationId,
                    locationId,
                );
                if (!isMounted) return;

                const cardStyle = {
                    input: {
                        backgroundColor: 'transparent',
                        color: '#f0f0f0',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                    },
                    'input::placeholder': {
                        color: '#9ca3af',
                    },
                    '.input-container': {
                        borderColor: '#374151',
                        borderWidth: '1px',
                        borderRadius: '6px',
                    },
                    '.input-container.is-focus': {
                        borderColor: '#818cf8',
                    },
                    '.input-container.is-error': {
                        borderColor: '#ef4444',
                    },
                };

                const card = await payments.card({ style: cardStyle });
                if (!isMounted) {
                    card.destroy();
                    return;
                }

                cardInstance = card;

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
            } catch (error) {
                console.error('Failed to initialize Square card:', error);
                if (isMounted) {
                    setCardInitError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to initialize payment',
                    );
                }
            } finally {
                if (isMounted) {
                    setIsInitializingCard(false);
                }
            }
        };

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
    }, [isProduction, squareLoaded, locationId, applicationId]);

    // Keep ref in sync with state for cleanup
    useEffect(() => {
        squareCardRef.current = squareCard;
    }, [squareCard]);

    // Cleanup Square card on unmount
    useEffect(() => {
        return () => {
            if (squareCardRef.current) {
                try {
                    squareCardRef.current.destroy();
                } catch (e) {
                    console.warn('Error destroying Square card on unmount:', e);
                }
            }
        };
    }, []);

    const handleCheckEmail = async () => {
        if (!isValidEmail(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsCheckingEmail(true);
        setErrors({});

        try {
            const response = await fetch('/api/checkout/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(getCsrfToken() && {
                        'X-CSRF-TOKEN': getCsrfToken()!,
                    }),
                },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.exists) {
                setAccountState('existing_user');
            } else {
                setAccountState('new_user');
            }
        } catch (error) {
            console.error('Error checking email:', error);
            toast.error('Failed to check email. Please try again.');
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleRegister = async () => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) newErrors.firstName = 'First name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!isValidEmail(email)) newErrors.email = 'Valid email is required';
        if (password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsRegistering(true);
        setErrors({});

        try {
            const response = await fetch('/api/checkout/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(getCsrfToken() && {
                        'X-CSRF-TOKEN': getCsrfToken()!,
                    }),
                },
                credentials: 'include',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setLoggedInUser({
                    name: data.user.name,
                    email: data.user.email,
                });
                setCardName(`${firstName} ${lastName}`);
                setAccountState('logged_in');
                toast.success('Account created successfully!');
            } else {
                // Handle validation errors
                if (data.errors) {
                    const apiErrors: Record<string, string> = {};
                    Object.keys(data.errors).forEach((key) => {
                        apiErrors[key] = data.errors[key][0];
                    });
                    setErrors(apiErrors);
                } else {
                    toast.error(data.message || 'Failed to create account');
                }
            }
        } catch (error) {
            console.error('Error registering:', error);
            toast.error('Failed to create account. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            let sourceId: string;

            if (isProduction) {
                if (!squareCard) {
                    throw new Error(
                        'Payment form not properly initialized. Please refresh and try again.',
                    );
                }
                const result = await squareCard.tokenize();
                if (result.status !== 'OK' || !result.token) {
                    throw new Error(
                        result.errors?.[0]?.message ||
                            'Card tokenization failed.',
                    );
                }
                sourceId = result.token;
            } else {
                sourceId = 'cnon:card-nonce-ok';
            }

            const cartItemsForApi = items.map((item) => ({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                price: Math.round(item.price * 100),
            }));

            const customerEmail = loggedInUser?.email || email;
            const customerName =
                loggedInUser?.name ||
                `${firstName} ${lastName}`.trim() ||
                cardName;

            // Process payment via Laravel API
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(getCsrfToken() && {
                        'X-CSRF-TOKEN': getCsrfToken()!,
                    }),
                },
                credentials: 'include',
                body: JSON.stringify({
                    source_id: sourceId,
                    amount: Math.round(amountDue * 100),
                    currency: 'USD',
                    customer_email: customerEmail,
                    customer_name: customerName,
                    idempotency_key: generateIdempotencyKey(),
                    order_description: orderDescription || 'Custom Order',
                    cart_items: cartItemsForApi,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment processing failed');
            }

            if (data.success) {
                const transactionData: TransactionData = {
                    subscriptionId: data.payment_id,
                    customerId: undefined,
                    amountPaid: amountDue,
                    processingFee: 0,
                    paymentMethod: 'credit_card',
                    billingPeriod: hasMixedBilling
                        ? 'mixed'
                        : hasAnnualItems
                          ? 'annual'
                          : 'monthly',
                    paidAt: new Date(),
                    cartItems: items.map((item) => ({
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        billingPeriod: item.billingPeriod,
                    })),
                };

                onTransactionComplete(transactionData);

                clearCart();
                toast.success('Payment successful!');
                onNext();
            } else {
                throw new Error(data.error || 'Payment failed');
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Payment failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const isSandboxCardValid = () => {
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

    const isPaymentFormValid = isProduction
        ? squareCard !== null && !isInitializingCard
        : isSandboxCardValid();
    const canSubmit =
        (accountState === 'logged_in' || accountState === 'existing_user') &&
        isPaymentFormValid &&
        !isProcessing;

    return (
        <div className="space-y-6">
            {/* Account Section */}
            <div className="card-glass p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-bold text-foreground">
                            Account
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {accountState === 'checking'
                                ? 'Checking your login status...'
                                : accountState === 'logged_in'
                                  ? "You're signed in and ready to checkout"
                                  : accountState === 'existing_user'
                                    ? 'Welcome back!'
                                    : 'Enter your email to continue'}
                        </p>
                    </div>
                </div>

                {accountState === 'checking' && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Verifying your account...
                        </p>
                    </div>
                )}

                {accountState === 'logged_in' && loggedInUser && (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium text-foreground">
                                {loggedInUser.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {loggedInUser.email}
                            </p>
                        </div>
                    </div>
                )}

                {accountState === 'existing_user' && (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                            <p className="font-medium text-foreground">
                                Welcome back!
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {email}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setAccountState('enter_email')}
                        >
                            Change
                        </Button>
                    </div>
                )}

                {accountState === 'enter_email' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Email Address
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({});
                                    }}
                                    placeholder="you@example.com"
                                    className={
                                        errors.email ? 'border-destructive' : ''
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={handleCheckEmail}
                                    disabled={isCheckingEmail || !email}
                                >
                                    {isCheckingEmail ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {accountState === 'new_user' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">
                                {email}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-xs"
                                onClick={() => setAccountState('enter_email')}
                            >
                                Change
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    placeholder="John"
                                    className={
                                        errors.firstName
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    placeholder="Smith"
                                    className={
                                        errors.lastName
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 8 characters"
                                className={
                                    errors.password ? 'border-destructive' : ''
                                }
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm your password"
                                className={
                                    errors.confirmPassword
                                        ? 'border-destructive'
                                        : ''
                                }
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={handleRegister}
                            disabled={isRegistering}
                            className="w-full"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account & Continue'
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Payment Section - Show for logged in users or existing users */}
            {(accountState === 'logged_in' ||
                accountState === 'existing_user') && (
                <div className="card-glass p-6">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-bold text-foreground">
                                Payment
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Enter your card details
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-4">
                        <div className="mb-3">
                            <p className="mb-2 font-semibold text-foreground">
                                Your Order
                            </p>
                            <div className="space-y-1">
                                {items.map((item) => {
                                    const isItemAnnual =
                                        item.billingPeriod === 'annual';
                                    const displayPrice = isItemAnnual
                                        ? item.price * 12 * item.quantity
                                        : item.price * item.quantity;
                                    const periodLabel = isItemAnnual
                                        ? '/yr'
                                        : '/mo';

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.name}{' '}
                                                {item.quantity > 1 &&
                                                    `x${item.quantity}`}
                                            </span>
                                            <span className="text-foreground">
                                                {formatPrice(displayPrice)}
                                                {periodLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-primary/20 pt-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-foreground">
                                    Due today
                                </span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(amountDue)}
                                </span>
                            </div>
                            <p className="mt-1 text-right text-xs text-muted-foreground">
                                {hasMixedBilling
                                    ? 'Annual items paid upfront • Monthly items billed monthly'
                                    : hasAnnualItems
                                      ? 'Billed annually'
                                      : 'Billed monthly'}
                            </p>
                        </div>
                    </div>

                    {/* Card Form */}
                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                        {isProduction ? (
                            <div className="space-y-4">
                                {cardInitError && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                        {cardInitError}
                                    </div>
                                )}

                                {isInitializingCard && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Initializing payment form...
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="cardName">
                                        Cardholder Name
                                    </Label>
                                    <Input
                                        id="cardName"
                                        type="text"
                                        value={cardName}
                                        onChange={(e) =>
                                            setCardName(e.target.value)
                                        }
                                        placeholder="Name on card"
                                        required
                                    />
                                </div>

                                <div
                                    id="square-card-container"
                                    className="min-h-[120px] rounded-lg border border-border bg-background p-4"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardName">
                                        Cardholder Name
                                    </Label>
                                    <Input
                                        id="cardName"
                                        type="text"
                                        value={cardName}
                                        onChange={(e) =>
                                            setCardName(e.target.value)
                                        }
                                        placeholder="John Smith"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">
                                        Card Number
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="cardNumber"
                                            type="text"
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
                                            Expiration
                                        </Label>
                                        <Input
                                            id="expiry"
                                            type="text"
                                            inputMode="numeric"
                                            value={expiry}
                                            onChange={(e) =>
                                                setExpiry(
                                                    formatExpiry(
                                                        e.target.value,
                                                    ),
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
                                            type="text"
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={!canSubmit}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Complete Purchase - {formatPrice(amountDue)}
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BillingStep;
