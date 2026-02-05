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
import { ArrowRight, Bot, MessageSquare, Zap } from 'lucide-react';

export default function PortalDashboard() {
    const { user } = usePortalContext();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['portal-stats', user?.id],
        queryFn: async () => {
            return apiClient.get<{
                agentCount: number;
                conversationCount: number;
                totalMessages: number;
                recentAgents: Array<{
                    id: string;
                    agent_name: string;
                    usage_count: number | null;
                    redirect_url?: string | null;
                }>;
            }>('/api/portal/stats');
        },
        enabled: Boolean(user?.id),
    });

    const hasAgents = (stats?.agentCount ?? 0) > 0;
    const recentAgents = stats?.recentAgents ?? [];
    const plannerDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const plannerBlocks = [
        { day: 'Mon', time: '9:00 AM', label: 'Social post draft' },
        { day: 'Tue', time: '11:00 AM', label: 'Sales follow-up' },
        { day: 'Wed', time: '2:00 PM', label: 'Content refresh' },
        { day: 'Thu', time: '9:30 AM', label: 'Lead research' },
        { day: 'Fri', time: '10:00 AM', label: 'Weekly summary' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
                <section className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium text-primary">
                            Customer Portal
                        </p>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-semibold text-foreground">
                                    Welcome back
                                    {user?.email
                                        ? `, ${user.email.split('@')[0]}`
                                        : ''}
                                    .
                                </h1>
                                <p className="text-muted-foreground">
                                    Track your agents, content, and workflow in
                                    one place.
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
                                    <Link href="/portal/suggest">
                                        Request an agent
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Agents
                            </CardTitle>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-3xl font-semibold text-foreground">
                                    {stats?.agentCount || 0}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Conversations
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-3xl font-semibold text-foreground">
                                    {stats?.conversationCount || 0}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Messages
                            </CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-3xl font-semibold text-foreground">
                                    {stats?.totalMessages || 0}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Agents</CardTitle>
                            <CardDescription>
                                Your active lineup.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {isLoading ? (
                                <Skeleton className="h-40 w-full" />
                            ) : !hasAgents ? (
                                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background px-6 py-8 text-center">
                                    <Bot className="h-10 w-10 text-muted-foreground" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            No agents yet
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Explore the marketplace to add your
                                            first agent.
                                        </p>
                                    </div>
                                    <Button asChild>
                                        <Link href="/portal/browse">
                                            Explore the marketplace
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {recentAgents.map((agent: any) =>
                                        agent.redirect_url ? (
                                            <button
                                                key={agent.id}
                                                onClick={() => {
                                                    window.location.href =
                                                        agent.redirect_url!;
                                                }}
                                                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-accent"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <Bot className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {agent.agent_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {agent.usage_count || 0}{' '}
                                                        messages
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        ) : (
                                            <Link
                                                key={agent.id}
                                                href={`/portal/agents/${agent.id}/chat`}
                                                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-accent"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <Bot className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {agent.agent_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {agent.usage_count || 0}{' '}
                                                        messages
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        ),
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href="/portal/agents">
                                            View all agents
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Planner</CardTitle>
                                <CardDescription>
                                    Upcoming tasks from your agents.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/activity">
                                    View activity
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
                                {plannerDays.map((day) => (
                                    <div
                                        key={day}
                                        className="text-center font-medium uppercase"
                                    >
                                        {day}
                                    </div>
                                ))}
                                {plannerDays.map((day) => (
                                    <div
                                        key={`${day}-block`}
                                        className="h-16 rounded-lg border border-dashed border-border bg-muted/40"
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {plannerBlocks.map((block) => (
                                    <div
                                        key={`${block.day}-${block.time}`}
                                        className="rounded-xl border border-border px-4 py-3"
                                    >
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {block.day} • {block.time}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {block.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
