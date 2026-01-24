import { Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, ArrowRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { usePortalContext } from "@/contexts/PortalContext";

export default function PortalAgents() {
  const { session } = usePortalContext();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['portal-agents', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_access')
        .select(`
          id,
          agent_type,
          agent_name,
          configuration,
          is_active,
          usage_count,
          usage_limit,
          last_used_at,
          created_at,
          customer_subscriptions(
            status,
            tier,
            end_date
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return data;
    },
    enabled: !!session?.user?.id,
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My AI Agents</h1>
        <p className="text-muted-foreground mt-1">
          Manage and interact with your AI agents.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have any AI agents. Browse our marketplace to find the perfect agent for your needs.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents?.map((agent) => {
            const Icon = getAgentIcon(agent.agent_type);
            const subscription = agent.customer_subscriptions?.[0];
            const tier = subscription?.tier || 'basic';

            return (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                        <CardDescription className="capitalize">{agent.agent_type}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getTierColor(tier)}>
                      {tier}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{agent.usage_count || 0} messages</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {agent.last_used_at
                          ? formatDistanceToNow(new Date(agent.last_used_at), { addSuffix: true })
                          : 'Never used'}
                      </span>
                    </div>
                  </div>

                  {agent.usage_limit && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span>{agent.usage_count || 0} / {agent.usage_limit}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, ((agent.usage_count || 0) / agent.usage_limit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <Button className="w-full" asChild>
                    <Link href={`/portal/agents/${agent.id}/chat`}>
                      Start Chat
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
