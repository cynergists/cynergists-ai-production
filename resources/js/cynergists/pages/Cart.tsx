import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'role':
            return 'Specialist';
        case 'plan':
            return 'Plan';
        case 'ai-agent':
            return 'AI Agent';
        default:
            return type;
    }
};

const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'role':
            return 'default';
        case 'plan':
            return 'secondary';
        case 'ai-agent':
            return 'outline';
        default:
            return 'default';
    }
};

// Full pool of specialists to recommend as upsells
const allRecommendedSpecialists = [
    {
        id: 'administrative-assistant',
        name: 'Administrative Assistant',
        hourlyRate: 15,
        partTime: 1200,
        fullTime: 2400,
        description:
            'Keep your operations running smoothly with dedicated admin support.',
    },
    {
        id: 'bookkeeper',
        name: 'Bookkeeper',
        hourlyRate: 18,
        partTime: 1440,
        fullTime: 2880,
        description:
            'Maintain accurate financials and stay IRS-ready year-round.',
    },
    {
        id: 'video-editor',
        name: 'Video Editor',
        hourlyRate: 25,
        partTime: 2000,
        fullTime: 4000,
        description:
            'Transform raw footage into polished, professional content.',
    },
    {
        id: 'seo-specialist',
        name: 'SEO Specialist',
        hourlyRate: 25,
        partTime: 2000,
        fullTime: 4000,
        description: 'Boost your organic traffic and search engine rankings.',
    },
    {
        id: 'ad-campaign-manager',
        name: 'Ad Campaign Manager',
        hourlyRate: 25,
        partTime: 2000,
        fullTime: 4000,
        description: 'Maximize your ad spend ROI across all platforms.',
    },
    {
        id: 'copywriter',
        name: 'Copywriter',
        hourlyRate: 20,
        partTime: 1600,
        fullTime: 3200,
        description:
            'Craft compelling copy that converts visitors into customers.',
    },
    {
        id: 'executive-assistant',
        name: 'Executive Assistant',
        hourlyRate: 20,
        partTime: 1600,
        fullTime: 3200,
        description: 'High-level support for busy executives and founders.',
    },
    {
        id: 'crm-administrator',
        name: 'CRM Administrator',
        hourlyRate: 18,
        partTime: 1440,
        fullTime: 2880,
        description: 'Keep your CRM organized and your pipeline flowing.',
    },
    {
        id: 'automation-engineer',
        name: 'Automation Engineer',
        hourlyRate: 25,
        partTime: 2000,
        fullTime: 4000,
        description: 'Eliminate manual tasks with smart automation workflows.',
    },
    {
        id: 'web-developer',
        name: 'Web Developer',
        hourlyRate: 25,
        partTime: 2000,
        fullTime: 4000,
        description: 'Build and maintain high-performance websites and apps.',
    },
    {
        id: 'customer-success-manager',
        name: 'Customer Success Manager',
        hourlyRate: 21,
        partTime: 1680,
        fullTime: 3360,
        description: 'Keep your customers happy and reduce churn.',
    },
    {
        id: 'appointment-setter',
        name: 'Appointment Setter',
        hourlyRate: 18,
        partTime: 1440,
        fullTime: 2880,
        description: 'Fill your calendar with qualified leads and meetings.',
    },
];

const Cart = () => {
    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        addItem,
        totalItems,
        totalPrice,
    } = useCart();

    const handleTypeBadgeClick = (type: string) => {
        router.visit(
            `/admin/plans?search=${encodeURIComponent(getTypeLabel(type))}`,
        );
    };

    const handleCheckout = () => {
        router.visit('/checkout');
    };

    // Filter out specialists that are already in cart and limit to 4
    const filteredRecommendations = allRecommendedSpecialists
        .filter(
            (specialist) =>
                !items.some((item) => item.id.startsWith(specialist.id)),
        )
        .slice(0, 4);

    // Track commitment selection for each recommended specialist
    const [commitmentSelections, setCommitmentSelections] = useState<
        Record<string, 'part-time' | 'full-time'>
    >({});

    // Get commitment for a specialist, defaulting to part-time
    const getCommitment = (specialistId: string) =>
        commitmentSelections[specialistId] || 'full-time';

    const handleCommitmentChange = (
        specialistId: string,
        commitment: 'part-time' | 'full-time',
    ) => {
        setCommitmentSelections((prev) => ({
            ...prev,
            [specialistId]: commitment,
        }));
    };

    const handleAddRecommended = (
        specialist: (typeof allRecommendedSpecialists)[0],
    ) => {
        const commitment = getCommitment(specialist.id);
        const price =
            commitment === 'part-time'
                ? specialist.partTime
                : specialist.fullTime;
        const hours = commitment === 'part-time' ? 80 : 160;

        addItem({
            id: `${specialist.id}-${commitment}`,
            type: 'role',
            name: specialist.name,
            description: `${commitment === 'part-time' ? 'Part-Time' : 'Full-Time'} – ${hours} hrs/mo`,
            price,
            billingPeriod: 'monthly',
            metadata: {
                hoursPerMonth: hours,
                commitment,
                hourlyRate: specialist.hourlyRate,
            },
        });
    };

    return (
        <Layout>
            <Helmet>
                <title>Your Cart | Cynergists</title>
                <meta
                    name="description"
                    content="Review your selected services and specialists before scheduling a call to finalize."
                />
            </Helmet>

            <main className="py-20 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-5xl">
                        {/* Header */}
                        <div className="mb-10 flex items-center gap-4">
                            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                                <ShoppingCart className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold md:text-4xl">
                                    Your Cart
                                </h1>
                                {totalItems > 0 && (
                                    <p className="text-muted-foreground">
                                        {totalItems}{' '}
                                        {totalItems === 1 ? 'item' : 'items'} •{' '}
                                        {formatCurrency(totalPrice)}/month
                                    </p>
                                )}
                            </div>
                        </div>

                        {items.length === 0 ? (
                            /* Empty State */
                            <div className="card-glass py-16 text-center">
                                <ShoppingCart className="mx-auto mb-6 h-20 w-20 text-muted-foreground/30" />
                                <h2 className="mb-3 text-2xl font-bold">
                                    Your cart is empty
                                </h2>
                                <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                                    Add specialists, plans, or AI agents to get
                                    started building your dream team.
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <OrbitingButton
                                        asChild
                                        className="btn-primary"
                                    >
                                        <Link href="/marketplace">
                                            View Plans
                                        </Link>
                                    </OrbitingButton>
                                    <Button asChild variant="outline">
                                        <Link href="/services">
                                            Learn About AI Agents
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-8 lg:grid-cols-3">
                                {/* Cart Items - Scrollable */}
                                <div className="lg:col-span-2">
                                    <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="card-glass flex flex-col gap-4 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                getTypeBadgeVariant(
                                                                    item.type,
                                                                ) as
                                                                    | 'default'
                                                                    | 'secondary'
                                                                    | 'outline'
                                                            }
                                                            className="cursor-pointer transition-opacity hover:opacity-80"
                                                            onClick={() =>
                                                                handleTypeBadgeClick(
                                                                    item.type,
                                                                )
                                                            }
                                                        >
                                                            {getTypeLabel(
                                                                item.type,
                                                            )}
                                                        </Badge>
                                                        {item.metadata
                                                            ?.commitment && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {item.metadata
                                                                    .commitment ===
                                                                'full-time'
                                                                    ? 'Full-Time'
                                                                    : 'Part-Time'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-semibold">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="min-w-[100px] text-right">
                                                        <p className="text-lg font-bold text-primary">
                                                            {formatCurrency(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatCurrency(
                                                                item.price,
                                                            )}
                                                            /mo
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            removeItem(item.id)
                                                        }
                                                        className="rounded-lg p-2 transition-colors hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="mt-4 text-muted-foreground hover:text-destructive"
                                        onClick={clearCart}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear Cart
                                    </Button>
                                </div>

                                {/* Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="card-glass sticky top-24">
                                        <h2 className="mb-6 text-xl font-bold">
                                            Order Summary
                                        </h2>

                                        <div className="mb-6 space-y-3">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="truncate pr-2 text-muted-foreground">
                                                        {item.name}{' '}
                                                        {item.quantity > 1 &&
                                                            `x${item.quantity}`}
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            item.price *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-6 border-t border-border pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium">
                                                    Monthly Total
                                                </span>
                                                <span className="text-2xl font-bold text-primary">
                                                    {formatCurrency(totalPrice)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Billed monthly • 6-month
                                                commitment
                                            </p>
                                        </div>

                                        <OrbitingButton
                                            className="btn-primary mb-3 w-full"
                                            onClick={handleCheckout}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Check Out
                                        </OrbitingButton>

                                        <p className="text-center text-xs text-muted-foreground">
                                            Review your selections and complete
                                            your order.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommended Specialists Section */}
                        {items.length > 0 &&
                            filteredRecommendations.length > 0 && (
                                <section className="mt-16">
                                    <div className="mb-6 flex items-center gap-3">
                                        <Users className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-bold">
                                            Recommended Based On Your Cart
                                        </h2>
                                    </div>
                                    <p className="mb-8 text-muted-foreground">
                                        Complement your team with these popular
                                        specialists.
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {filteredRecommendations.map(
                                            (specialist) => {
                                                const commitment =
                                                    getCommitment(
                                                        specialist.id,
                                                    );
                                                const price =
                                                    commitment === 'part-time'
                                                        ? specialist.partTime
                                                        : specialist.fullTime;

                                                return (
                                                    <div
                                                        key={specialist.id}
                                                        className="card-glass flex flex-col"
                                                    >
                                                        <h3 className="mb-2 font-semibold">
                                                            {specialist.name}
                                                        </h3>
                                                        <p className="mb-4 flex-1 text-sm text-muted-foreground">
                                                            {
                                                                specialist.description
                                                            }
                                                        </p>

                                                        {/* Price Display */}
                                                        <div className="mb-3">
                                                            <span className="text-2xl font-bold text-primary">
                                                                {formatCurrency(
                                                                    price,
                                                                )}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                /mo
                                                            </span>
                                                        </div>

                                                        {/* Commitment Dropdown */}
                                                        <div className="mb-3">
                                                            <Select
                                                                value={
                                                                    commitment
                                                                }
                                                                onValueChange={(
                                                                    value:
                                                                        | 'part-time'
                                                                        | 'full-time',
                                                                ) =>
                                                                    handleCommitmentChange(
                                                                        specialist.id,
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-9 w-full border-primary/30 bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 focus:ring-primary/30">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="part-time">
                                                                        Part-Time
                                                                        (80
                                                                        hrs/mo)
                                                                    </SelectItem>
                                                                    <SelectItem value="full-time">
                                                                        Full-Time
                                                                        (160
                                                                        hrs/mo)
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full"
                                                            onClick={() =>
                                                                handleAddRecommended(
                                                                    specialist,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="mr-1 h-4 w-4" />
                                                            Add to Cart
                                                        </Button>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>

                                    <div className="mt-8 text-center">
                                        <Button asChild variant="outline">
                                            <Link href="/hourly-specialists">
                                                View All Specialists
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </section>
                            )}
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default Cart;
