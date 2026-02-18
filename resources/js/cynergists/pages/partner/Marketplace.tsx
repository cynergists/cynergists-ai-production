import { AgentCarouselSection } from '@/components/marketplace/AgentCarouselSection';
import { AIAgentCard, type AIAgent } from '@/components/ui/AIAgentCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartnerContext } from '@/contexts/PartnerContext';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Bot, Percent, Search } from 'lucide-react';
import { useState } from 'react';

export default function PartnerMarketplace() {
    const context = usePartnerContext();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch agents
    const { data: agents, isLoading: agentsLoading } = useQuery({
        queryKey: ['partner-marketplace-agents'],
        queryFn: async () => {
            const data = await apiClient.get<AIAgent[]>('/public/agents');
            return data;
        },
    });

    // Fetch partner discount
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['partner-settings'],
        queryFn: async () => {
            const data = await apiClient.get<any>('/partner/settings');
            return data;
        },
    });

    const discountPercent = settings?.global_discount_percent || 0;
    const isLoading = agentsLoading || settingsLoading;

    const filteredAgents =
        agents?.filter((agent) => {
            const matchesSearch =
                agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (agent.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ??
                    false);
            return matchesSearch;
        }) || [];

    // Section data
    const latestAgents = filteredAgents
        .filter((agent) => agent.category !== 'Software')
        .slice(0, 6);
    const popularAgents = filteredAgents.filter(
        (agent) => agent.is_popular && agent.category !== 'Software',
    );
    const plannedAgents = filteredAgents
        .filter((agent) => agent.category !== 'Software')
        .slice(-4);
    const softwareAgents = filteredAgents.filter(
        (agent) => agent.category === 'Software',
    );

    const isSearching = searchQuery.length > 0;

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 md:mb-8">
                <div className="mb-2 flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Partner Marketplace
                    </h1>
                    {discountPercent > 0 && (
                        <Badge className="border-lime-500/20 bg-lime-500/10 text-lime-400">
                            <Percent className="mr-1 h-3 w-3" />
                            {discountPercent}% Partner Discount
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground md:text-base">
                    Browse AI agents at your exclusive partner pricing.
                </p>
            </div>

            {/* Search */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="w-[360px] flex-shrink-0">
                            <div className="p-6">
                                <Skeleton className="mb-4 h-6 w-20" />
                                <Skeleton className="mb-2 h-6 w-32" />
                                <Skeleton className="mb-4 h-4 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : isSearching ? (
                // Search results grid
                <>
                    {filteredAgents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAgents.map((agent) => (
                                <AIAgentCard
                                    key={agent.id}
                                    agent={agent}
                                    showDiscount={discountPercent > 0}
                                    discountPercent={discountPercent}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-semibold">
                                    No agents found
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    Try adjusting your search criteria.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Clear Search
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                // Carousel sections
                <div className="space-y-12">
                    <AgentCarouselSection
                        title="The latest."
                        subtitle="Take a look at what's new, right now."
                        agents={latestAgents}
                    />

                    <AgentCarouselSection
                        title="Most Popular"
                        agents={
                            popularAgents.length > 0
                                ? popularAgents
                                : latestAgents.slice(0, 4)
                        }
                    />

                    <AgentCarouselSection
                        title="Planned Agents"
                        subtitle="Coming soon to the marketplace."
                        agents={plannedAgents}
                    />

                    {softwareAgents.length > 0 && (
                        <AgentCarouselSection
                            title="Software."
                            subtitle="Add the tools that power your workflows, ready to plug in and perform."
                            agents={softwareAgents}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
