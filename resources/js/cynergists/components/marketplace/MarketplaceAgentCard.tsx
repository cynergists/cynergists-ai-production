import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import type { AIAgent, AgentTier } from '@/components/ui/AIAgentCard';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { useState } from 'react';

const stripHtmlTags = (html: string | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

interface MediaItem {
    url?: string;
    file?: string;
    type: 'image' | 'video';
}

function getMediaUrl(media: MediaItem): string {
    return media.file || media.url || '';
}

interface MarketplaceAgentCardProps {
    agent: AIAgent;
}

export function MarketplaceAgentCard({ agent }: MarketplaceAgentCardProps) {
    const cardMedia = agent.card_media || [];
    const hasMedia = cardMedia.length > 0;
    const currentMedia = cardMedia[0];

    const tiers = agent.tiers || [];
    const hasTiers = tiers.length > 0;
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
    const [mediaLoaded, setMediaLoaded] = useState(false);

    const selectedTier = hasTiers ? tiers[selectedTierIndex] : null;
    const displayPrice = selectedTier
        ? typeof selectedTier.price === 'string'
            ? parseFloat(selectedTier.price)
            : selectedTier.price
        : agent.price;
    const isCustomPricing = displayPrice <= 0;

    return (
        <div className="h-auto w-full shrink-0 p-[6px] md:p-[8px] rounded-xl md:rounded-2xl animate-gradient-reverse [box-shadow:0_0_15px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)] hover:scale-[1.02] transition-all duration-300">
            <Card className="group relative flex h-auto flex-col overflow-hidden rounded-lg md:rounded-xl border-0 transition-all duration-300 sm:h-[464px] sm:flex-row">
                {/* Media Section - Responsive */}
                <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-muted/30 sm:aspect-auto sm:h-full sm:w-[280px]">
                    {/* Skeleton Loading State */}
                    {hasMedia && currentMedia && !mediaLoaded && (
                        <div className="absolute inset-0 z-10">
                            <Skeleton className="h-full w-full" />
                        </div>
                    )}

                    {/* Media Content */}
                    {hasMedia && currentMedia ? (
                        currentMedia.type === 'video' ? (
                            <video
                                src={getMediaUrl(currentMedia)}
                                autoPlay
                                muted
                                loop
                                playsInline
                                onLoadedData={() => setMediaLoaded(true)}
                                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${
                                    mediaLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        ) : (
                            <img
                                src={getMediaUrl(currentMedia)}
                                alt={agent.name}
                                onLoad={() => setMediaLoaded(true)}
                                className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${
                                    mediaLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        )
                    ) : (
                        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-lime-500/20 to-lime-500/5" />
                    )}

                    {/* Category Badge */}
                    <Badge
                        variant="outline"
                        className="absolute top-4 left-4 z-20 border-white/30 bg-black/50 text-xs capitalize text-white backdrop-blur-sm"
                    >
                        {agent.category}
                    </Badge>
                </div>

                {/* Content Section */}
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex flex-1 flex-col overflow-hidden px-4 pt-3 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
                        {/* Title */}
                        <div className="mb-2 shrink-0 sm:mb-3">
                            <h3 className="line-clamp-1 text-lg font-bold leading-tight text-white sm:line-clamp-2 sm:text-xl">
                                {agent.job_title || agent.name}
                            </h3>
                            <p className="mt-0.5 text-sm">
                                <span className="font-normal text-muted-foreground">
                                    Code Name:{' '}
                                </span>
                                <span className="font-bold text-white">
                                    {agent.name}
                                </span>
                            </p>
                        </div>

                        {/* Description */}
                        <p className="mb-2 line-clamp-2 shrink-0 text-sm leading-relaxed text-muted-foreground sm:mb-3 sm:line-clamp-3">
                            {stripHtmlTags(agent.description)}
                        </p>

                        {/* Features - Hidden on mobile, shown on desktop */}
                        <div className="hidden flex-1 overflow-hidden sm:block">
                            <div className="space-y-1.5">
                                {agent.features?.slice(0, 3).map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Check className="h-4 w-4 shrink-0 text-accent dark:text-lime-400" />
                                        <span className="truncate text-muted-foreground">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                                {agent.features && agent.features.length > 3 && (
                                    <p className="pl-6 text-xs text-muted-foreground/70">
                                        +{agent.features.length - 3} more
                                        features
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Pricing & CTA */}
                    <div className="mt-auto border-t border-border/50 bg-muted/30 p-4 pt-3 sm:p-6 sm:pt-4">
                        <div className="flex flex-col gap-2 sm:gap-3">
                            {/* Tier Slider - Only if multiple tiers */}
                            {hasTiers && tiers.length > 1 && (
                                <div className="space-y-2">
                                    <Slider
                                        min={0}
                                        max={tiers.length - 1}
                                        step={1}
                                        value={[selectedTierIndex]}
                                        onValueChange={(value) =>
                                            setSelectedTierIndex(value[0])
                                        }
                                        className="w-full"
                                    />
                                    {/* Dot Indicators */}
                                    <div className="flex justify-between px-1">
                                        {tiers.map((tier, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setSelectedTierIndex(index)
                                                }
                                                className={`rounded-full p-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-lime-500/50 ${
                                                    index === selectedTierIndex
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
                                    <p className="line-clamp-1 text-center text-xs text-muted-foreground">
                                        {selectedTier?.description ||
                                            `Tier ${selectedTierIndex + 1}`}
                                    </p>
                                </div>
                            )}

                            {/* Pricing Display */}
                            <div className="text-center">
                                {isCustomPricing ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                                            Custom
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Pricing based on scope
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-2xl font-bold text-foreground sm:text-3xl">
                                            ${Math.floor(displayPrice)}
                                        </span>
                                        <span className="text-base text-muted-foreground">
                                            /mo
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            <Button
                                asChild
                                className="orbiting-button w-full bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:text-sm"
                            >
                                <Link href={`/marketplace/${agent.slug}`} className="inline-flex h-10 items-center justify-center gap-1.5 px-4 py-2 sm:gap-2 sm:px-8">
                                    Learn More
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
