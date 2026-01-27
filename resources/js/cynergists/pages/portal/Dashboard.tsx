import { Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortalContext } from "@/contexts/PortalContext";

export default function PortalDashboard() {
  const { session } = usePortalContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['portal-stats', session?.user?.id],
    queryFn: async () => {
      // Get agent access count
      const { data: agents, error: agentsError } = await supabase
        .from('agent_access')
        .select('id, agent_name, usage_count, last_used_at')
        .eq('is_active', true);

      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
        return { agentCount: 0, conversationCount: 0, totalMessages: 0, recentAgents: [] };
      }

      // Get conversation count
      const { count: conversationCount } = await supabase
        .from('agent_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        agentCount: agents?.length || 0,
        conversationCount: conversationCount || 0,
        totalMessages: agents?.reduce((sum, a) => sum + (a.usage_count || 0), 0) || 0,
        recentAgents: agents?.slice(0, 3) || [],
      };
    },
    enabled: !!session?.user?.id,
  });

  const hasAgents = (stats?.agentCount ?? 0) > 0;
  const recentAgents = stats?.recentAgents ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">Customer Portal</p>
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome back{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Launch, manage, and scale your AI agents with a dashboard that keeps everything
              in one place.
            </p>
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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Jump back into your most used agents.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : !hasAgents ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background px-6 py-8 text-center">
                  <Bot className="h-10 w-10 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">No agents yet</p>
                    <p className="text-sm text-muted-foreground">
                      Explore the marketplace to add your first agent.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/portal/browse">Explore the marketplace</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {recentAgents.map((agent: any) => (
                    <Link
                      key={agent.id}
                      href={`/portal/agents/${agent.id}/chat`}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-foreground">{agent.agent_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.usage_count || 0} messages
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/portal/agents">View all agents</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>Keep momentum with curated actions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Invite your team</p>
                <p className="text-sm text-muted-foreground">
                  Add teammates to collaborate and share usage insights.
                </p>
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <Link href="/portal/settings">Manage access</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Plan your roadmap</p>
                <p className="text-sm text-muted-foreground">
                  Track upcoming releases and request new capabilities.
                </p>
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <Link href="/portal/roadmap">View roadmap</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Connect integrations</p>
                <p className="text-sm text-muted-foreground">
                  Wire up your tools for automated workflows.
                </p>
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <Link href="/portal/integrations">Add integrations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
