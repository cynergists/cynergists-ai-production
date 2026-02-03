import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    MessageSquare,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const stripHtmlTags = (html: string | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

export interface AIAgent {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    job_title?: string | null;
    price: number;
    category: string;
    website_category?: string[] | string | null;
    icon: string | null;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    card_media?: MediaItem[];
}

interface AIAgentCardProps {
    agent: AIAgent;
    showDiscount?: boolean;
    discountPercent?: number;
}

const getAgentIcon = (category: string) => {
    switch (category.toLowerCase()) {
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

export function AIAgentCard({
    agent,
    showDiscount = false,
    discountPercent = 0,
}: AIAgentCardProps) {
    const Icon = getAgentIcon(agent.category);
    const discountedPrice =
        showDiscount && discountPercent > 0
            ? agent.price * (1 - discountPercent / 100)
            : agent.price;

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const cardMedia = agent.card_media || [];
    const hasMedia = cardMedia.length > 0;
    const currentMedia = cardMedia[currentMediaIndex];

    // Check if this is a software product (no media and website_category includes Software)
    const websiteCats = Array.isArray(agent.website_category)
        ? agent.website_category
        : agent.website_category
          ? [agent.website_category]
          : [];
    const isSoftware =
        websiteCats.some((c) => c.toLowerCase() === 'software') ||
        (!hasMedia && agent.category.toLowerCase() === 'software');

    const goToPrevious = () => {
        setCurrentMediaIndex((prev) =>
            prev > 0 ? prev - 1 : cardMedia.length - 1,
        );
    };

    const goToNext = () => {
        setCurrentMediaIndex((prev) =>
            prev < cardMedia.length - 1 ? prev + 1 : 0,
        );
    };

    // Software card variant - full width, no image
    if (isSoftware) {
        return (
            <div className="h-[440px] w-[560px] shrink-0 rounded-2xl bg-gradient-to-br from-[#26908B] to-[#1a365d] p-[8px] [box-shadow:0_0_15px_rgba(38,144,139,0.2)] transition-all duration-300 hover:scale-[1.02] hover:[box-shadow:0_0_25px_rgba(38,144,139,0.4)]">
                <Card className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all duration-300">
                    {/* Top section with icon and category */}
                    <div className="relative px-8 pt-8 pb-6">
                        {/* Large icon background */}
                        <div className="absolute top-4 right-4 opacity-10">
                            <Icon className="h-32 w-32 text-teal-400" />
                        </div>

                        {/* Category Badge */}
                        <Badge
                            variant="outline"
                            className="mb-4 border-teal-400/40 bg-teal-500/20 text-xs text-teal-300 capitalize backdrop-blur-sm"
                        >
                            {agent.category}
                        </Badge>

                        {/* Icon */}
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
                            <Icon className="h-8 w-8 text-white" />
                        </div>

                        {/* Title */}
                        <div>
                            {agent.job_title && (
                                <h3 className="mb-1 text-2xl leading-tight font-bold text-white">
                                    {agent.job_title}
                                </h3>
                            )}
                            <p className="text-sm">
                                <span className="font-normal text-slate-400">
                                    Software:{' '}
                                </span>
                                <span className="font-semibold text-teal-300">
                                    {agent.name}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Description and Features */}
                    <div className="flex-1 px-8">
                        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-slate-300">
                            {stripHtmlTags(agent.description)}
                        </p>

                        {/* Features in horizontal layout */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {agent.features?.slice(0, 4).map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                                    <span className="line-clamp-1 text-slate-400">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto border-t border-slate-700/50 bg-slate-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                {showDiscount && discountPercent > 0 ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-white">
                                            ${discountedPrice.toFixed(0)}
                                        </span>
                                        <span className="text-sm text-slate-500 line-through">
                                            ${agent.price}
                                        </span>
                                        <span className="text-base text-slate-400">
                                            /mo
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">
                                            ${agent.price}
                                        </span>
                                        <span className="text-base text-slate-400">
                                            /mo
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                asChild
                                className="bg-teal-500 px-6 font-medium text-white hover:bg-teal-600"
                            >
                                <Link href={`/marketplace/${agent.slug}`}>
                                    Learn More
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Default AI Agent card variant
    return (
        <div className="h-[440px] w-[560px] shrink-0 rounded-2xl bg-gradient-to-br from-[#81CA16] to-[#26908B] p-[8px] [box-shadow:0_0_15px_rgba(132,204,22,0.15)] transition-all duration-300 hover:scale-[1.02] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)]">
            <Card className="group relative flex h-full w-full flex-row overflow-hidden rounded-xl border-0 transition-all duration-300">
                {/* Left Side - Media - Fixed size container */}
                <div className="relative h-full w-[280px] shrink-0 overflow-hidden bg-muted/30">
                    {hasMedia ? (
                        <>
                            {currentMedia?.type === 'video' ? (
                                <video
                                    src={currentMedia.url}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src={currentMedia?.url}
                                    alt={agent.name}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}

                            {/* Navigation arrows for carousel */}
                            {cardMedia.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goToPrevious();
                                        }}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            goToNext();
                                        }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>

                                    {/* Dot indicators */}
                                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                                        {cardMedia.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`h-2 w-2 rounded-full transition-colors ${
                                                    index === currentMediaIndex
                                                        ? 'bg-white'
                                                        : 'bg-white/50 hover:bg-white/75'
                                                }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setCurrentMediaIndex(index);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-lime-500/20 to-lime-500/5">
                            <Icon className="h-16 w-16 text-accent/50 dark:text-lime-400/50" />
                        </div>
                    )}

                    {/* Category Badge on image */}
                    <Badge
                        variant="outline"
                        className="absolute top-4 left-4 border-white/30 bg-black/50 text-xs text-white capitalize backdrop-blur-sm"
                    >
                        {agent.category}
                    </Badge>
                </div>

                {/* Right Side - Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Card Header */}
                    <div className="flex-1 px-6 pt-6 pb-4">
                        <div className="mb-4">
                            {agent.job_title && (
                                <h3 className="text-xl leading-tight font-bold text-white">
                                    {agent.job_title}
                                </h3>
                            )}
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
                        <p className="mb-4 line-clamp-3 min-h-[60px] text-sm leading-relaxed text-muted-foreground">
                            {stripHtmlTags(agent.description)}
                        </p>

                        {/* Features Section */}
                        <div className="space-y-2">
                            {agent.features?.slice(0, 3).map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent dark:text-lime-400" />
                                    <span className="line-clamp-1 text-muted-foreground">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                            {agent.features && agent.features.length > 3 && (
                                <p className="pl-6 text-xs text-muted-foreground/70">
                                    +{agent.features.length - 3} more features
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto border-t border-border/50 bg-muted/30 p-6 pt-4">
                        <div className="flex flex-col gap-3">
                            <div className="text-center">
                                {showDiscount && discountPercent > 0 ? (
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-3xl font-bold text-foreground">
                                            ${discountedPrice.toFixed(0)}
                                        </span>
                                        <span className="text-sm text-muted-foreground line-through">
                                            ${agent.price}
                                        </span>
                                        <span className="text-base text-muted-foreground">
                                            /mo
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-bold text-foreground">
                                            ${agent.price}
                                        </span>
                                        <span className="text-base text-muted-foreground">
                                            /mo
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Button
                                asChild
                                className="w-full bg-lime-500 font-medium text-black hover:bg-lime-600"
                            >
                                <Link href={`/marketplace/${agent.slug}`}>
                                    Learn More
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
