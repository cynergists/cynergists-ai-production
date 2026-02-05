import Layout from '@/components/layout/Layout';
import { AgentDetailSlider } from '@/components/marketplace/AgentDetailSlider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Bot,
    Check,
    FileText,
    MessageSquare,
    Plug,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
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

                {/* Hero Section */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Left column - Image/Visual */}
                        <div>
                            {/* Gradient border wrapper */}
                            <div className="relative rounded-2xl bg-gradient-to-br from-[#81CA16] to-[#26908B] p-[15px]">
                                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-background">
                                    {(() => {
                                        const primaryMedia =
                                            agent.product_media?.[0];
                                        const displayUrl =
                                            primaryMedia?.url ||
                                            agent.image_url;
                                        const isVideo =
                                            primaryMedia?.type === 'video';

                                        if (displayUrl) {
                                            if (isVideo) {
                                                return (
                                                    <video
                                                        src={displayUrl}
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                        className="h-full w-full object-cover"
                                                    />
                                                );
                                            }
                                            return (
                                                <img
                                                    src={displayUrl}
                                                    alt={agent.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            );
                                        }
                                        return (
                                            <div className="flex h-full flex-col items-center justify-center">
                                                <div className="rounded-2xl border border-lime-500/30 bg-lime-500/20 p-6">
                                                    <Icon className="h-16 w-16 text-accent dark:text-lime-400" />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Right column - Details */}
                        <div className="space-y-6">
                            {/* Title with category badge */}
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                                        {agent.job_title || 'Job Title'}
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="border-lime-500/30 bg-lime-500/10 text-accent dark:text-lime-400"
                                    >
                                        {agent.category}
                                    </Badge>
                                </div>
                                <p className="text-base">
                                    <span className="font-normal text-muted-foreground">
                                        Code Name:{' '}
                                    </span>
                                    <span className="font-bold text-white">
                                        {agent.name}
                                    </span>
                                </p>
                            </div>

                            {/* Description - white text */}
                            <div
                                className="text-lg leading-relaxed text-foreground [&>p]:mb-4 [&>p:last-child]:mb-0 [&>strong]:font-bold"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        agent.long_description ||
                                        agent.description ||
                                        '',
                                }}
                            />

                            {/* What's Included Section - Inline under description */}
                            {agent.features && agent.features.length > 0 && (
                                <div className="rounded-lg bg-muted/30 p-4">
                                    <h3 className="mb-4 text-lg font-bold">
                                        What's Included
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {agent.features.map(
                                            (feature, index) => (
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
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Integrations Section - Right under What's Included */}
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
                                                        className="px-3 py-1.5 text-base"
                                                    >
                                                        {integration}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Tier Slider and Pricing */}
                            <AgentDetailSlider
                                agentId={agent.id}
                                agentName={agent.name}
                                agentDescription={agent.description}
                                agentJobTitle={agent.job_title}
                                agentPrice={agent.price}
                                agentTiers={agent.tiers}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
