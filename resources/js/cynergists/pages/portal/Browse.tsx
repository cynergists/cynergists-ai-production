import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Sparkles,
  Star,
  ArrowRight,
  Zap,
  Users,
  Filter,
  Check
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AIAgent } from "@/components/ui/AIAgentCard";
import { usePortalContext } from "@/contexts/PortalContext";
import { apiClient } from "@/lib/api-client";

const categories = [
  { id: "all", name: "All Agents", icon: Sparkles },
  { id: "Admin", name: "Admin", icon: Users },
  { id: "Communication", name: "Communication", icon: MessageSquare },
  { id: "Content", name: "Content", icon: FileText },
  { id: "Data and Analytics", name: "Data & Analytics", icon: TrendingUp },
  { id: "Finance", name: "Finance", icon: Zap },
  { id: "Growth", name: "Growth", icon: TrendingUp },
  { id: "Operations", name: "Operations", icon: Zap },
  { id: "Personal", name: "Personal", icon: Star },
  { id: "Sales", name: "Sales", icon: TrendingUp },
  { id: "Support", name: "Support", icon: MessageSquare },
  { id: "Tech", name: "Tech", icon: Zap },
];

const getAgentIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "admin":
      return Users;
    case "communication":
      return MessageSquare;
    case "content":
      return FileText;
    case "data and analytics":
      return TrendingUp;
    case "finance":
      return Zap;
    case "growth":
      return TrendingUp;
    case "operations":
      return Zap;
    case "personal":
      return Star;
    case "sales":
      return TrendingUp;
    case "support":
      return MessageSquare;
    case "tech":
      return Zap;
    default:
      return Bot;
  }
};

export default function PortalBrowse() {
  const { user } = usePortalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch agents and owned agent names from database
  const { data, isLoading } = useQuery({
    queryKey: ["portal-browse-agents", user?.id],
    queryFn: async () => {
      return apiClient.get<{ agents: AIAgent[]; ownedAgentNames: string[] }>("/api/portal/browse");
    },
    enabled: Boolean(user?.id),
  });

  const agents = data?.agents ?? [];
  const ownedAgentNames = data?.ownedAgentNames ?? [];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isOwned = (agentId: string) => {
    const agent = agents.find((item) => item.id === agentId);
    return agent ? ownedAgentNames.includes(agent.name) : false;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Browse Agents</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Discover AI agents to automate your business processes.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px] h-10 bg-background">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <div className="p-6">
                <Skeleton className="h-6 w-20 mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const Icon = getAgentIcon(agent.category);
            const owned = isOwned(agent.id);
            const isCustomPricing = agent.price <= 0;

            return (
              <Card 
                key={agent.id} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col"
              >
                {/* Category Badge */}
                <div className="px-6 pt-6 pb-2">
                  <Badge variant="outline" className="text-xs capitalize bg-primary/10 text-primary border-primary/30">
                    {agent.category}
                  </Badge>
                </div>

                {/* Popular badge */}
                {agent.is_popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-primary text-primary-foreground border-0 font-medium">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Card Header */}
                <div className="px-6 pb-4 flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg text-foreground leading-tight">
                        {agent.name}
                      </h3>
                      {agent.job_title && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {agent.job_title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 min-h-[60px] mb-4">
                    {agent.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {agent.features?.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground line-clamp-1">{feature}</span>
                      </div>
                    ))}
                    {agent.features && agent.features.length > 3 && (
                      <p className="text-xs text-muted-foreground/70 pl-6">
                        +{agent.features.length - 3} more features
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-border/50 bg-muted/30 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      {isCustomPricing ? (
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-foreground">Custom</span>
                          <span className="text-xs text-muted-foreground">Pricing based on scope</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-foreground">${agent.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
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
                        <Link href={`/marketplace/${agent.slug}`}>
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
          <CardContent className="text-center py-12">
            <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria.
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
