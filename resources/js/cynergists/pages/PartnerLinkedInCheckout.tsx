import Layout from '@/components/layout/Layout';
import {
    PartnerPaymentForm,
    TransactionResult,
} from '@/components/partner/PartnerPaymentForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Check,
    CheckCircle,
    CreditCard,
    Mail,
    MessageSquare,
    PartyPopper,
    Target,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

const PARTNER_PRODUCT = {
    id: 'partner-linkedin-outreach',
    type: 'product' as const,
    name: 'Partner Package: LinkedIn Outreach',
    description: 'AI-powered LinkedIn lead generation and outreach automation',
    price: 189,
    billingPeriod: 'monthly' as const,
    metadata: { isPartnerPackage: true },
};

type CheckoutStep = 'payment' | 'confirmation';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function PartnerLinkedInCheckout() {
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('payment');
    const [transactionData, setTransactionData] =
        useState<TransactionResult | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string>('');

    const handlePaymentSuccess = (result: TransactionResult) => {
        setTransactionData(result);
        setCurrentStep('confirmation');
        toast({
            title: 'Payment Successful!',
            description: 'Your LinkedIn Outreach package is now active.',
        });
    };

    const features = [
        { icon: Target, title: 'AI-Powered Targeting' },
        { icon: MessageSquare, title: 'Personalized Outreach' },
        { icon: BarChart3, title: 'Performance Analytics' },
        { icon: Zap, title: 'Done-For-You Setup' },
    ];

    return (
        <Layout>
            <Helmet>
                <title>
                    Checkout: LinkedIn Outreach Partner Package | Cynergists
                </title>
                <meta
                    name="description"
                    content="Complete your purchase of the LinkedIn Outreach Partner Package at exclusive partner pricing."
                />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <main className="min-h-screen py-12 lg:py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/partner/linkedin-outreach">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Offer
                                </Link>
                            </Button>
                        </div>

                        {/* Simple Progress Indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-center gap-4">
                                <div
                                    className={`flex items-center gap-2 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            currentStep === 'payment'
                                                ? 'bg-primary text-primary-foreground'
                                                : currentStep === 'confirmation'
                                                  ? 'bg-primary/20 text-primary'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {currentStep === 'confirmation' ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <CreditCard className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Payment
                                    </span>
                                </div>
                                <div
                                    className={`h-0.5 w-12 ${currentStep === 'confirmation' ? 'bg-primary' : 'bg-muted'}`}
                                />
                                <div
                                    className={`flex items-center gap-2 ${currentStep === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                            currentStep === 'confirmation'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Complete
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                {/* Payment Step */}
                                {currentStep === 'payment' && (
                                    <div className="card-glass p-6 lg:p-8">
                                        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            Complete Your Purchase
                                        </h2>

                                        {/* Payment Form */}
                                        <PartnerPaymentForm
                                            productName={PARTNER_PRODUCT.name}
                                            productPrice={PARTNER_PRODUCT.price}
                                            partnerEmail=""
                                            partnerName=""
                                            onSuccess={handlePaymentSuccess}
                                            onBack={() =>
                                                router.visit(
                                                    '/partner/linkedin-outreach',
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {/* Confirmation Step */}
                                {currentStep === 'confirmation' &&
                                    transactionData && (
                                        <div className="card-glass p-6 text-center lg:p-8">
                                            <div className="mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                                                    <PartyPopper className="h-8 w-8 text-primary" />
                                                </div>
                                                <h2 className="mb-2 text-2xl font-bold">
                                                    Welcome Aboard!
                                                </h2>
                                                <p className="text-muted-foreground">
                                                    Your LinkedIn Outreach
                                                    package is now active
                                                </p>
                                            </div>

                                            {/* Transaction Details */}
                                            <div className="mb-6 space-y-3 rounded-lg bg-muted/30 p-4 text-left">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Product
                                                    </span>
                                                    <span className="font-medium">
                                                        {PARTNER_PRODUCT.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Amount Paid
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            transactionData.amountPaid,
                                                        )}
                                                    </span>
                                                </div>
                                                {transactionData.processingFee >
                                                    0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Processing Fee
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {formatCurrency(
                                                                transactionData.processingFee,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Payment Method
                                                    </span>
                                                    <span className="font-medium capitalize">
                                                        {transactionData.paymentMethod ===
                                                        'credit_card'
                                                            ? 'Credit Card'
                                                            : 'ACH Bank Transfer'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Date
                                                    </span>
                                                    <span className="font-medium">
                                                        {format(
                                                            transactionData.paidAt,
                                                            'MMMM d, yyyy',
                                                        )}
                                                    </span>
                                                </div>
                                                {transactionData.subscriptionId && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Subscription ID
                                                        </span>
                                                        <span className="font-mono text-xs">
                                                            {transactionData.subscriptionId.slice(
                                                                0,
                                                                16,
                                                            )}
                                                            ...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Next Steps */}
                                            <div className="mb-6 space-y-4 text-left">
                                                <h3 className="font-semibold">
                                                    What Happens Next?
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Check Your Email
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                We've sent a
                                                                confirmation and
                                                                onboarding
                                                                details to your
                                                                email
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Onboarding Call
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Our team will
                                                                reach out within
                                                                24-48 hours to
                                                                schedule your
                                                                kickoff call
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Get Started
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                You'll be
                                                                generating leads
                                                                on LinkedIn
                                                                within 7 days of
                                                                onboarding
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <Button
                                                    asChild
                                                    className="btn-primary flex-1"
                                                >
                                                    <Link href="/">
                                                        Back to Home
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* Order Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="card-glass sticky top-24 p-6">
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Order Summary
                                    </h3>

                                    {/* Product */}
                                    <div className="mb-4 border-b border-border pb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Zap className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">
                                                    {PARTNER_PRODUCT.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Monthly subscription
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-4 space-y-2">
                                        {features.map((feature, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 text-xs text-muted-foreground"
                                            >
                                                <Check className="h-3 w-3 text-primary" />
                                                {feature.title}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-2 border-t border-border pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Retail Price
                                            </span>
                                            <span className="text-muted-foreground line-through">
                                                $397/mo
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Partner Discount
                                            </span>
                                            <span className="text-primary">
                                                -$208
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                                            <span>Due Today</span>
                                            <span className="text-primary">
                                                {formatCurrency(
                                                    PARTNER_PRODUCT.price,
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-center text-xs text-muted-foreground">
                                            Billed monthly • Cancel anytime
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
