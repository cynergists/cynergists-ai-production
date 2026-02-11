import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Bot,
    Check,
    FileText,
    MessageSquare,
    Plug,
    ShoppingCart,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

interface MediaItem {
    url?: string;
    file?: string;
    type: 'image' | 'video';
}

/**
 * Get the URL for a media item (prefers file upload over external URL)
 */
function getMediaUrl(media: MediaItem): string {
    return media.file || media.url || '';
}

interface AgentTier {
    price: number;
    description: string;
}

export interface AgentPreviewData {
    id?: string;
    name: string;
    job_title?: string | null;
    description?: string | null;
    category: string;
    website_category?: string;
    features?: string[];
    integrations?: string[];
    image_url?: string | null;
    product_media?: MediaItem[];
    tiers?: AgentTier[];
    price?: number;
}

interface AgentPreviewProps {
    agent: AgentPreviewData;
    isAdmin?: boolean;
    className?: string;
}

const getAgentIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'admin':
            return Users;
        case 'communication':
            return MessageSquare;
        case 'content':
            return FileText;
        case 'data and analytics':
            return TrendingUp;
        case 'finance':
            return Zap;
        case 'growth':
            return TrendingUp;
        case 'operations':
            return Zap;
        case 'personal':
            return Star;
        case 'sales':
            return TrendingUp;
        case 'support':
            return MessageSquare;
        case 'tech':
            return Zap;
        default:
            return Bot;
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export function AgentPreview({
    agent,
    isAdmin = false,
    className,
}: AgentPreviewProps) {
    const Icon = getAgentIcon(agent.category);

    // Get display media - prefer product_media, fallback to image_url
    const primaryMedia = agent.product_media?.[0];
    const displayUrl = primaryMedia
        ? getMediaUrl(primaryMedia)
        : agent.image_url;
    const isVideo = primaryMedia?.type === 'video';

    // Get current price - first tier or base price
    const currentPrice = agent.tiers?.[0]?.price ?? agent.price ?? 0;

    return (
        <div className={cn('bg-background', className)}>
            {/* Hero Section */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left column - Image/Visual */}
                <div>
                    {/* Gradient border wrapper */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-[#81CA16] to-[#26908B] p-[15px]">
                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-background">
                            {displayUrl ? (
                                isVideo ? (
                                    <video
                                        src={displayUrl}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={displayUrl}
                                        alt={agent.name}
                                        className="h-full w-full object-contain"
                                    />
                                )
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center">
                                    <div className="rounded-2xl border border-lime-500/30 bg-lime-500/20 p-6">
                                        <Icon className="h-16 w-16 text-accent dark:text-lime-400" />
                                    </div>
                                </div>
                            )}
                            {/* Product Category Badge on image */}
                            <Badge
                                variant="outline"
                                className="absolute top-4 left-4 border-white/30 bg-black/50 text-xs text-white capitalize backdrop-blur-sm"
                            >
                                {agent.category || 'Category'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Right column - Details */}
                <div className="space-y-6 pt-4">
                    {/* Title with website category badge */}
                    <div>
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold text-white md:text-4xl">
                                {agent.job_title || 'Job Title'}
                            </h1>
                            {agent.website_category && (
                                <Badge className="border-lime-500/30 bg-lime-500/10 text-accent dark:text-lime-400">
                                    {agent.website_category}
                                </Badge>
                            )}
                        </div>
                        <p className="text-base">
                            <span className="font-normal text-muted-foreground">
                                Code Name:{' '}
                            </span>
                            <span className="font-bold text-white">
                                {agent.name || 'Agent Name'}
                            </span>
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-lg leading-relaxed text-foreground">
                        {agent.description ||
                            'Enter a description for this AI agent...'}
                    </p>

                    {/* What's Included Section - Inline */}
                    {agent.features && agent.features.length > 0 && (
                        <div className="rounded-lg bg-muted/30 p-4">
                            <h3 className="mb-4 text-lg font-bold">
                                What's Included
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {agent.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-500/20">
                                            <Check className="h-3 w-3 text-accent dark:text-lime-400" />
                                        </div>
                                        <span className="text-sm text-foreground">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Integrations Section - Right under What's Included */}
                    {agent.integrations && agent.integrations.length > 0 && (
                        <div className="rounded-lg bg-muted/30 p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <Plug className="h-5 w-5 text-accent dark:text-lime-400" />
                                <h3 className="text-lg font-bold">
                                    Integrations
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {agent.integrations.map(
                                    (integration, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="px-3 py-1.5 text-base"
                                        >
                                            {integration}
                                        </Badge>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tier Slider Preview (simplified for preview) */}
                    {agent.tiers && agent.tiers.length > 0 ? (
                        <div className="space-y-4">
                            {agent.tiers[0]?.description && (
                                <div className="rounded-lg border border-border/50 bg-muted/50 px-4 py-3">
                                    <p className="text-lg font-bold text-foreground">
                                        {agent.tiers[0].description}
                                    </p>
                                </div>
                            )}

                            {/* Tier indicators */}
                            {agent.tiers.length > 1 && (
                                <div className="flex gap-2 px-1">
                                    {agent.tiers.map((_, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                'h-3 w-3 rounded-full border-2 transition-all',
                                                index === 0
                                                    ? 'border-lime-400 bg-lime-400'
                                                    : 'border-muted-foreground/50',
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="rounded-lg bg-muted/30 p-4">
                                <p className="text-base text-accent dark:text-lime-400">
                                    <span className="font-medium">Price:</span>{' '}
                                    {formatCurrency(currentPrice)}/mo
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-muted/30 p-4">
                            <p className="text-base text-accent dark:text-lime-400">
                                <span className="font-medium">Price:</span>{' '}
                                {formatCurrency(currentPrice)}/mo
                            </p>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                        size="lg"
                        className="w-full bg-lime-500 font-medium text-black hover:bg-lime-600"
                        disabled={isAdmin}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart - {formatCurrency(currentPrice)}/mo
                    </Button>
                </div>
            </div>
        </div>
    );
}
