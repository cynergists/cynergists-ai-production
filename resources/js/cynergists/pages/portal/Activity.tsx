import { usePortalContext } from "@/contexts/PortalContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity as ActivityIcon, 
  MessageSquare, 
  Bot,
  Clock,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { apiClient } from "@/lib/api-client";


export default function PortalActivity() {
  const { user } = usePortalContext();

  const { data: activity, isLoading } = useQuery({
    queryKey: ['portal-conversations', user?.id],
    queryFn: async () => {
      return apiClient.get<{
        conversations: Array<{
          id: string;
          title: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          access?: { agent_name: string; agent_type: string };
        }>;
        agentStats: Array<{
          id: string;
          agent_name: string;
          usage_count: number | null;
          last_used_at: string | null;
        }>;
      }>("/api/portal/activity");
    },
    enabled: Boolean(user?.id),
  });

  const conversations = activity?.conversations ?? [];
  const agentStats = activity?.agentStats ?? [];
  const statsLoading = isLoading;
  const maxUsage = Math.max(1, ...agentStats.map((agent) => agent.usage_count || 0));

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ActivityIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Activity</h1>
        </div>
        <p className="text-muted-foreground">
          View your recent agent interactions and usage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Conversations
              </CardTitle>
              <CardDescription>Your latest agent interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with an agent to see activity here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => {
                    const agent = conv.access;
                    return (
                      <div key={conv.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{conv.title || "Untitled Conversation"}</p>
                            <p className="text-sm text-muted-foreground">
                              {agent?.agent_name || "Agent"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={conv.status === 'active' ? 'default' : 'outline'}>
                            {conv.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Agent Usage Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Agent Usage
              </CardTitle>
              <CardDescription>Messages per agent</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : agentStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No agent usage yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentStats.map((agent) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{agent.agent_name}</span>
                        <span className="text-muted-foreground">{agent.usage_count || 0} msgs</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, ((agent.usage_count || 0) / maxUsage) * 100)}%`,
                          }}
                        />
                      </div>
                      {agent.last_used_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last used {formatDistanceToNow(new Date(agent.last_used_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
