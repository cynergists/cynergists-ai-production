import { type AIAgent } from '@/components/ui/AIAgentCard';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrbitingButton } from '@/components/ui/orbiting-button';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api-client';
import { Link, router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowRight,
    Bot,
    Check,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const stripHtmlAndTruncate = (
    html: string | null | undefined,
    maxLength: number = 120,
): string => {
    if (!html) return '';
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    const decoded = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'");
    // Truncate
    if (decoded.length <= maxLength) return decoded;
    return decoded.substring(0, maxLength).trim() + '...';
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

/**
 * Get the display price for an agent (lowest tier price, or base price).
 */
const getAgentDisplayPrice = (agent: AIAgent): number => {
    if (agent.tiers && agent.tiers.length > 0) {
        const prices = agent.tiers.map((t) =>
            typeof t.price === 'string' ? parseFloat(t.price) : t.price,
        );
        return Math.min(...prices);
    }
    return typeof agent.price === 'string'
        ? parseFloat(agent.price as unknown as string)
        : agent.price;
};

/**
 * Get the URL for a media item (prefers file upload over external URL).
 */
const getMediaUrl = (media: { url?: string; file?: string }): string => {
    const src = media.file || media.url || '';
    if (src && !src.startsWith('http') && !src.startsWith('/storage/')) {
        return `/storage/${src}`;
    }
    return src;
};

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

    // Fetch AI agents for recommendations
    const { data: allAgents = [] } = useQuery({
        queryKey: ['recommended-agents'],
        queryFn: () => apiClient.get<AIAgent[]>('/api/public/agents'),
    });

    // Filter out agents already in cart and limit to 4
    const recommendedAgents = allAgents
        .filter((agent) => !items.some((item) => item.id === agent.id))
        .filter((agent) => getAgentDisplayPrice(agent) > 0)
        .slice(0, 4);

    const handleAddRecommendedAgent = (agent: AIAgent) => {
        const price = getAgentDisplayPrice(agent);
        const tier = agent.tiers?.[0];

        addItem({
            id: agent.id,
            type: 'ai-agent',
            name: agent.name,
            description: tier?.description || agent.job_title || '',
            price,
            billingPeriod: 'monthly',
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
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {stripHtmlAndTruncate(
                                                                item.description,
                                                                120,
                                                            )}
                                                        </p>
                                                    )}
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

                        {/* Recommended AI Agents Section */}
                        {items.length > 0 &&
                            recommendedAgents.length > 0 && (
                                <section className="mt-16">
                                    <div className="mb-6 flex items-center gap-3">
                                        <Bot className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-bold">
                                            Recommended AI Agents
                                        </h2>
                                    </div>
                                    <p className="mb-8 text-muted-foreground">
                                        Supercharge your workflow with these AI
                                        agents.
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {recommendedAgents.map((agent) => {
                                            const price =
                                                getAgentDisplayPrice(agent);
                                            const hasTiers =
                                                (agent.tiers?.length ?? 0) > 1;
                                            const media =
                                                agent.card_media?.[0];
                                            const mediaUrl = media
                                                ? getMediaUrl(media)
                                                : null;
                                            const isVideo =
                                                media?.type === 'video';

                                            return (
                                                <div
                                                    key={agent.id}
                                                    className="rounded-xl bg-gradient-to-br from-[#81CA16] to-[#26908B] p-[3px] transition-all duration-300 hover:scale-[1.01] hover:[box-shadow:0_0_20px_rgba(132,204,22,0.2)]"
                                                >
                                                    <div className="flex h-[260px] flex-row overflow-hidden rounded-[9px] bg-card">
                                                        {/* Left - Media */}
                                                        <div className="relative h-full w-[140px] shrink-0 overflow-hidden bg-muted/30">
                                                            {mediaUrl ? (
                                                                isVideo ? (
                                                                    <video
                                                                        src={
                                                                            mediaUrl
                                                                        }
                                                                        autoPlay
                                                                        muted
                                                                        loop
                                                                        playsInline
                                                                        className="absolute inset-0 h-full w-full object-cover"
                                                                        style={{
                                                                            objectPosition:
                                                                                'center 15%',
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={
                                                                            mediaUrl
                                                                        }
                                                                        alt={
                                                                            agent.name
                                                                        }
                                                                        className="absolute inset-0 h-full w-full object-cover"
                                                                    />
                                                                )
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lime-500/20 to-lime-500/5">
                                                                    <Bot className="h-10 w-10 text-accent/50 dark:text-lime-400/50" />
                                                                </div>
                                                            )}
                                                            <Badge
                                                                variant="outline"
                                                                className="absolute top-2 left-2 border-white/30 bg-black/50 text-[10px] text-white capitalize backdrop-blur-sm"
                                                            >
                                                                {
                                                                    agent.category
                                                                }
                                                            </Badge>
                                                        </div>

                                                        {/* Right - Content */}
                                                        <div className="flex min-w-0 flex-1 flex-col">
                                                            <div className="flex-1 px-4 pt-3 pb-2">
                                                                <h3 className="line-clamp-1 text-sm font-bold text-white">
                                                                    {agent.job_title ||
                                                                        agent.name}
                                                                </h3>
                                                                <p className="mt-0.5 text-xs">
                                                                    <span className="text-muted-foreground">
                                                                        Code
                                                                        Name:{' '}
                                                                    </span>
                                                                    <span className="font-bold text-white">
                                                                        {
                                                                            agent.name
                                                                        }
                                                                    </span>
                                                                </p>

                                                                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                                    {stripHtmlAndTruncate(
                                                                        agent.description,
                                                                        120,
                                                                    )}
                                                                </p>

                                                                {/* Features */}
                                                                <div className="mt-2 space-y-1">
                                                                    {agent.features
                                                                        ?.slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                feature,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        feature
                                                                                    }
                                                                                    className="flex items-center gap-1.5 text-xs"
                                                                                >
                                                                                    <Check className="h-3 w-3 shrink-0 text-accent dark:text-lime-400" />
                                                                                    <span className="truncate text-muted-foreground">
                                                                                        {
                                                                                            feature
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    {agent
                                                                        .features
                                                                        ?.length >
                                                                        2 && (
                                                                        <p className="pl-[18px] text-[10px] text-muted-foreground/70">
                                                                            +
                                                                            {agent
                                                                                .features
                                                                                .length -
                                                                                2}{' '}
                                                                            more
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Footer */}
                                                            <div className="mt-auto border-t border-border/50 bg-muted/30 px-4 py-2.5">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        {hasTiers && (
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                Starting
                                                                                at{' '}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-lg font-bold text-foreground">
                                                                            {formatCurrency(
                                                                                price,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            /mo
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 bg-lime-500 px-3 text-xs font-medium text-black hover:bg-lime-600"
                                                                        onClick={() =>
                                                                            handleAddRecommendedAgent(
                                                                                agent,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Plus className="mr-1 h-3 w-3" />
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 text-center">
                                        <Button asChild variant="outline">
                                            <Link href="/marketplace">
                                                View All AI Agents
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
