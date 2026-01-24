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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your AI agents and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-3xl font-bold">{stats?.agentCount || 0}</div>
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
              <div className="text-3xl font-bold">{stats?.conversationCount || 0}</div>
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
              <div className="text-3xl font-bold">{stats?.totalMessages || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your AI agents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : stats?.agentCount === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse our AI agent marketplace to get started.
              </p>
              <Button asChild>
                <Link href="/services/ai-agents">
                  Explore AI Agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentAgents.map((agent: any) => (
                <Link
                  key={agent.id}
                  href={`/portal/agents/${agent.id}/chat`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.agent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.usage_count || 0} messages
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/portal/agents">View All Agents</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
