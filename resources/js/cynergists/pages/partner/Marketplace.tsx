import { useState } from "react";
import { usePartnerContext } from "@/contexts/PartnerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Search, 
  Sparkles,
  Percent
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAgentCard, type AIAgent } from "@/components/ui/AIAgentCard";
import { AgentCarouselSection } from "@/components/marketplace/AgentCarouselSection";

export default function PartnerMarketplace() {
  const context = usePartnerContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["partner-marketplace-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_available_agents")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as AIAgent[];
    },
  });

  // Fetch partner discount
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["partner-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_settings")
        .select("global_discount_percent")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const discountPercent = settings?.global_discount_percent || 0;
  const isLoading = agentsLoading || settingsLoading;

  const filteredAgents = agents?.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesSearch;
  }) || [];

  // Section data
  const latestAgents = filteredAgents.filter(agent => agent.category !== 'Software').slice(0, 6);
  const popularAgents = filteredAgents.filter(agent => agent.is_popular && agent.category !== 'Software');
  const plannedAgents = filteredAgents.filter(agent => agent.category !== 'Software').slice(-4);
  const softwareAgents = filteredAgents.filter(agent => agent.category === 'Software');

  const isSearching = searchQuery.length > 0;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Partner Marketplace</h1>
          {discountPercent > 0 && (
            <Badge className="bg-lime-500/10 text-lime-400 border-lime-500/20">
              <Percent className="h-3 w-3 mr-1" />
              {discountPercent}% Partner Discount
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Browse AI agents at your exclusive partner pricing.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            <Card key={i} className="flex-shrink-0 w-[360px]">
              <div className="p-6">
                <Skeleton className="h-6 w-20 mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : isSearching ? (
        // Search results grid
        <>
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardContent className="text-center py-12">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
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
            agents={popularAgents.length > 0 ? popularAgents : latestAgents.slice(0, 4)}
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
