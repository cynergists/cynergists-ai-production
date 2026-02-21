import { type AIAgent } from '@/components/ui/AIAgentCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowRight,
    Bot,
    Check,
    FileText,
    Filter,
    MessageSquare,
    Search,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

const categories = [
    { id: 'all', name: 'All Agents', icon: Sparkles },
    { id: 'Admin', name: 'Admin', icon: Users },
    { id: 'Communication', name: 'Communication', icon: MessageSquare },
    { id: 'Content', name: 'Content', icon: FileText },
    { id: 'Data and Analytics', name: 'Data & Analytics', icon: TrendingUp },
    { id: 'Finance', name: 'Finance', icon: Zap },
    { id: 'Growth', name: 'Growth', icon: TrendingUp },
    { id: 'Operations', name: 'Operations', icon: Zap },
    { id: 'Personal', name: 'Personal', icon: Star },
    { id: 'Sales', name: 'Sales', icon: TrendingUp },
    { id: 'Support', name: 'Support', icon: MessageSquare },
    { id: 'Tech', name: 'Tech', icon: Zap },
];

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

export default function PortalBrowse() {
    const { user } = usePortalContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Fetch agents and owned agent names from database
    const { data, isLoading } = useQuery({
        queryKey: ['portal-browse-agents', user?.id],
        queryFn: async () => {
            return apiClient.get<{
                agents: AIAgent[];
                ownedAgentNames: string[];
            }>('/api/portal/browse');
        },
        enabled: Boolean(user?.id),
    });

    const agents = data?.agents ?? [];
    const ownedAgentNames = data?.ownedAgentNames ?? [];

    const filteredAgents = agents.filter((agent) => {
        const matchesSearch =
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (agent.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ??
                false);
        const matchesCategory =
            selectedCategory === 'all' || agent.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isOwned = (agentId: string) => {
        const agent = agents.find((item) => item.id === agentId);
        return agent ? ownedAgentNames.includes(agent.name) : false;
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                    Browse Agents
                </h1>
                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                    Discover AI agents to automate your business processes.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row">
                <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                >
                    <SelectTrigger className="h-10 w-full bg-background md:w-[180px]">
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="All Agents" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Agent Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <div className="p-6">
                                <Skeleton className="mb-4 h-6 w-20" />
                                <Skeleton className="mb-2 h-6 w-32" />
                                <Skeleton className="mb-4 h-4 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAgents.map((agent) => {
                        const Icon = getAgentIcon(agent.category);
                        const owned = isOwned(agent.id);
                        const isCustomPricing = agent.price <= 0;

                        return (
                            <Card
                                key={agent.id}
                                className="group relative flex flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
                            >
                                {/* Category Badge */}
                                <div className="px-6 pt-6 pb-2">
                                    <Badge
                                        variant="outline"
                                        className="border-primary/30 bg-primary/10 text-xs text-primary capitalize"
                                    >
                                        {agent.category}
                                    </Badge>
                                </div>

                                {/* Popular badge */}
                                {agent.is_popular && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <Badge className="border-0 bg-primary font-medium text-primary-foreground">
                                            <Star className="mr-1 h-3 w-3 fill-current" />
                                            Popular
                                        </Badge>
                                    </div>
                                )}

                                {/* Card Header */}
                                <div className="flex-1 px-6 pb-4">
                                    <div className="mb-4 flex items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 group-hover:from-primary/30 group-hover:to-primary/10">
                                            <Icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-lg leading-tight font-semibold text-foreground">
                                                {agent.name}
                                            </h3>
                                            {agent.job_title && (
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    {agent.job_title}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="mb-4 line-clamp-3 min-h-[60px] text-sm leading-relaxed text-muted-foreground">
                                        {agent.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        {agent.features
                                            ?.slice(0, 3)
                                            .map((feature) => (
                                                <div
                                                    key={feature}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    <span className="line-clamp-1 text-muted-foreground">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        {agent.features &&
                                            agent.features.length > 3 && (
                                                <p className="pl-6 text-xs text-muted-foreground/70">
                                                    +{agent.features.length - 3}{' '}
                                                    more features
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-auto border-t border-border/50 bg-muted/30 p-6 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {isCustomPricing ? (
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-foreground">
                                                        Custom
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Pricing based on scope
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-2xl font-bold text-foreground">
                                                        ${Math.floor(agent.price)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        /mo
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {owned ? (
                                            <Button variant="outline" asChild>
                                                <Link href="/portal/agents">
                                                    View Agent
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button asChild>
                                                <Link
                                                    href={`/marketplace/${agent.slug}`}
                                                >
                                                    Learn More
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {filteredAgents.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <h3 className="mb-2 text-xl font-semibold">
                            No agents found
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                            Try adjusting your search or filter criteria.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
