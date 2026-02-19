import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { useAddToCartWithToast } from '@/hooks/useAddToCartWithToast';
import { apiClient } from '@/lib/api-client';
import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Bot,
    Check,
    Circle,
    FileText,
    MessageSquare,
    Pause,
    Play,
    Plug,
    ShoppingCart,
    Star,
    TrendingUp,
    Users,
    Volume2,
    VolumeX,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

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

interface Agent {
    id: string;
    name: string;
    job_title: string | null;
    description: string | null;
    long_description: string | null;
    price: number;
    category: string;
    icon: string | null;
    features: string[];
    perfect_for: string[] | null;
    integrations: string[] | null;
    is_popular: boolean;
    is_active: boolean;
    image_url: string | null;
    product_media: MediaItem[] | null;
    tiers?: AgentTier[] | null;
}

const getAgentIcon = (category?: string | null) => {
    const normalizedCategory = (category ?? 'general').toLowerCase();
    switch (normalizedCategory) {
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

export default function AgentDetail({ slug }: { slug: string }) {
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
        null,
    );

    const {
        data: agent,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['agent-detail', slug],
        queryFn: async () => {
            return apiClient.get<Agent>(`/api/public/agents/${slug}`);
        },
        enabled: !!slug,
    });

    const { addToCart } = useAddToCartWithToast();

    const handleTogglePlay = () => {
        if (videoElement) {
            if (isPlaying) {
                videoElement.pause();
            } else {
                videoElement.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleToggleMute = () => {
        if (videoElement) {
            videoElement.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12">
                    <Skeleton className="mb-8 h-8 w-48" />
                    <div className="grid gap-12 lg:grid-cols-2">
                        <Skeleton className="aspect-video rounded-2xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-32" />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !agent) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12 text-center">
                    <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h1 className="mb-2 text-2xl font-bold">Agent Not Found</h1>
                    <p className="mb-6 text-muted-foreground">
                        The AI agent you're looking for doesn't exist or is no
                        longer available.
                    </p>
                    <Button asChild>
                        <Link href="/marketplace">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    const Icon = getAgentIcon(agent.category);
    const tiers = agent.tiers || [];
    const hasTiers = tiers.length > 0;
    const selectedTier = hasTiers ? tiers[selectedTierIndex] : null;
    const displayPrice = selectedTier
        ? typeof selectedTier.price === 'string'
            ? parseFloat(selectedTier.price)
            : selectedTier.price
        : agent.price;

    const primaryMedia = agent.product_media?.[0];
    const displayUrl = primaryMedia ? getMediaUrl(primaryMedia) : agent.image_url;
    const isVideo = primaryMedia?.type === 'video';

    const handleAddToCart = () => {
        addToCart({
            id: agent.id,
            type: 'ai-agent',
            name: agent.name,
            description: selectedTier?.description || agent.job_title || '',
            price: displayPrice,
            billingPeriod: 'monthly',
        });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Back button */}
                <div className="container mx-auto px-4 pt-8">
                    <Button variant="ghost" asChild>
                        <Link href="/marketplace">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Left column - Media */}
                        <div>
                            <div className="relative rounded-2xl bg-gradient-to-br from-[#81CA16] to-[#26908B] p-[15px]">
                                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                                    {/* Category Badge */}
                                    <Badge
                                        variant="outline"
                                        className="absolute top-4 left-4 z-10 border-white/30 bg-black/50 text-xs capitalize text-white backdrop-blur-sm"
                                    >
                                        {agent.category}
                                    </Badge>

                                    {/* Media Content */}
                                    <div className="group relative h-full w-full">
                                        {displayUrl ? (
                                            isVideo ? (
                                                <video
                                                    ref={setVideoElement}
                                                    src={displayUrl}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={displayUrl}
                                                    alt={agent.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center bg-muted/30">
                                                <div className="rounded-2xl border border-lime-500/30 bg-lime-500/20 p-6">
                                                    <Icon className="h-16 w-16 text-accent dark:text-lime-400" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Video Controls */}
                                        {isVideo && displayUrl && (
                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={handleTogglePlay}
                                                    className="rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                                                    aria-label={
                                                        isPlaying
                                                            ? 'Pause'
                                                            : 'Play'
                                                    }
                                                >
                                                    {isPlaying ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleToggleMute}
                                                    className="rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                                                    aria-label={
                                                        isMuted
                                                            ? 'Unmute'
                                                            : 'Mute'
                                                    }
                                                >
                                                    {isMuted ? (
                                                        <VolumeX className="h-4 w-4" />
                                                    ) : (
                                                        <Volume2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Details */}
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                                    {agent.job_title || agent.name}
                                </h1>
                                <p className="text-base">
                                    <span className="font-normal text-muted-foreground">
                                        Code Name:{' '}
                                    </span>
                                    <span className="font-bold text-white">
                                        {agent.name}
                                    </span>
                                </p>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-4">
                                {/* Price Display */}
                                <div className="rounded-lg border border-border/50 bg-muted/50 px-5 py-4">
                                    <p className="text-2xl font-bold text-white">
                                        Price: ${displayPrice} /mo
                                    </p>
                                    {selectedTier && (
                                        <p className="mt-1 text-lg text-lime-400">
                                            {selectedTier.description}
                                        </p>
                                    )}
                                </div>

                                {/* Tier Slider */}
                                {hasTiers && tiers.length > 1 && (
                                    <div className="mb-2">
                                        <Slider
                                            min={0}
                                            max={tiers.length - 1}
                                            step={1}
                                            value={[selectedTierIndex]}
                                            onValueChange={(value) =>
                                                setSelectedTierIndex(value[0])
                                            }
                                            className="w-full"
                                            aria-label={`Select tier for ${agent.name}`}
                                        />
                                        {/* Dot Indicators */}
                                        <div className="mt-2 flex justify-between px-1">
                                            {tiers.map((tier, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedTierIndex(
                                                            index,
                                                        )
                                                    }
                                                    className={`rounded-full p-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50 ${
                                                        index ===
                                                        selectedTierIndex
                                                            ? 'text-accent dark:text-lime-400'
                                                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                    }`}
                                                    aria-label={`Select tier ${index + 1}`}
                                                    title={tier.description}
                                                >
                                                    <Circle
                                                        className={`h-3 w-3 transition-all ${
                                                            index ===
                                                            selectedTierIndex
                                                                ? 'fill-accent dark:fill-lime-400'
                                                                : ''
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add to Cart Button */}
                                <Button
                                    onClick={handleAddToCart}
                                    className="h-11 w-full rounded-md bg-lime-500 px-8 font-medium text-black hover:bg-lime-600"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart - ${displayPrice}/mo
                                </Button>
                            </div>

                            {/* What's Included */}
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

                            {/* Integrations */}
                            {agent.integrations &&
                                agent.integrations.length > 0 && (
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
                                                        className="px-3 py-1.5 text-base font-semibold"
                                                    >
                                                        {integration}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Description */}
                            {(agent.long_description || agent.description) && (
                                <div>
                                    <h2 className="mb-4 text-2xl font-bold text-foreground">
                                        Description
                                    </h2>
                                    <div
                                        className="text-lg leading-relaxed text-foreground [&>li]:mb-1 [&>p]:mb-4 [&>p:last-child]:mb-0 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                agent.long_description ||
                                                agent.description ||
                                                '',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
