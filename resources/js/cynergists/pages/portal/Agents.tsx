import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalContext } from '@/contexts/PortalContext';
import { apiClient } from '@/lib/api-client';
import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Bot, Clock, MessageSquare } from 'lucide-react';

export default function PortalAgents() {
    const { user } = usePortalContext();

    const { data: agents, isLoading } = useQuery({
        queryKey: ['portal-agents', user?.id],
        queryFn: async () => {
            const response = await apiClient.get<{
                agents: Array<{
                    id: string;
                    agent_type: string;
                    agent_name: string;
                    configuration: Record<string, unknown> | null;
                    is_active: boolean;
                    usage_count: number | null;
                    usage_limit: number | null;
                    last_used_at: string | null;
                    created_at: string;
                    redirect_url?: string | null;
                    subscription: {
                        status: string;
                        tier: string;
                        end_date: string | null;
                    } | null;
                }>;
            }>('/api/portal/agents');

            return response.agents;
        },
        enabled: Boolean(user?.id),
    });

    const getAgentIcon = (type: string) => {
        // Could expand this to have different icons per agent type
        return Bot;
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'enterprise':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'pro':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const totalMessages =
        agents?.reduce((sum, agent) => sum + (agent.usage_count || 0), 0) ?? 0;
    const activeAgents = agents?.length ?? 0;
    const latestAgent = agents?.[0];

    return (
        <div className="p-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        My AI Agents
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your active lineup and jump into conversations
                        fast.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/portal/browse">
                            Browse agents
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/portal/suggest">Request an agent</Link>
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : agents?.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <h3 className="mb-2 text-xl font-semibold">
                            No agents yet
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                            You don't have any AI agents. Browse our marketplace
                            to find the perfect agent for your needs.
                        </p>
                        <Button asChild>
                            <Link href="/services/ai-agents">
                                Browse AI Agents
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                Quick look at your portfolio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="rounded-xl border border-border px-4 py-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Active agents
                                </p>
                                <p className="text-2xl font-semibold text-foreground">
                                    {activeAgents}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border px-4 py-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total messages
                                </p>
                                <p className="text-2xl font-semibold text-foreground">
                                    {totalMessages}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border px-4 py-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Latest agent
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    {latestAgent?.agent_name || '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {latestAgent?.agent_type ||
                                        'No activity yet'}
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/portal/activity">
                                    View activity
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {agents?.map((agent) => {
                            const Icon = getAgentIcon(agent.agent_type);
                            const subscription = agent.subscription;
                            const tier = subscription?.tier || 'basic';

                            return (
                                <Card
                                    key={agent.id}
                                    className="group transition-shadow hover:shadow-lg"
                                >
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {agent.agent_name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {agent.agent_type}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={getTierColor(tier)}
                                        >
                                            {tier}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>
                                                    {agent.usage_count || 0}{' '}
                                                    messages
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {agent.last_used_at
                                                        ? formatDistanceToNow(
                                                              new Date(
                                                                  agent.last_used_at,
                                                              ),
                                                              {
                                                                  addSuffix: true,
                                                              },
                                                          )
                                                        : 'Never used'}
                                                </span>
                                            </div>
                                        </div>

                                        {agent.usage_limit && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Usage
                                                    </span>
                                                    <span>
                                                        {agent.usage_count || 0}{' '}
                                                        / {agent.usage_limit}
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{
                                                            width: `${Math.min(100, ((agent.usage_count || 0) / agent.usage_limit) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {agent.redirect_url ? (
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    window.location.href =
                                                        agent.redirect_url!;
                                                }}
                                            >
                                                Start Chat
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button className="w-full" asChild>
                                                <Link
                                                    href={`/portal/agents/${agent.id}/chat`}
                                                >
                                                    Start Chat
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
