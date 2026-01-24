import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";
import { type AIAgent } from "@/components/ui/AIAgentCard";
import { AgentCarouselSection } from "@/components/marketplace/AgentCarouselSection";
import { UpcomingAgentsSection } from "@/components/marketplace/UpcomingAgentsSection";

// Shuffle array using Fisher-Yates algorithm with a seed for consistent shuffles per session
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["marketplace-agents"],
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

  // Extract unique categories from agents
  const categories = useMemo(() => {
    if (!agents) return [];
    const uniqueCategories = [...new Set(agents.map(agent => agent.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [agents]);

  // Filter agents based on search and categories
  const filteredAgents = agents?.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategories.length === 0 || 
      (agent.category && selectedCategories.includes(agent.category));
    return matchesSearch && matchesCategory;
  }) || [];

  // Helper to check if agent is in a website category section
  const isInSection = (agent: AIAgent, section: string) => {
    const cats = Array.isArray(agent.website_category) ? agent.website_category : (agent.website_category ? [agent.website_category] : []);
    return cats.some(c => c.toLowerCase() === section.toLowerCase());
  };

  // Section data - filter by website category, exclude Software from Latest/Popular
  const latestAgents = shuffleArray(filteredAgents.filter(agent => 
    isInSection(agent, "New") && !isInSection(agent, "Software")
  ).slice(0, 6));
  
  const popularAgents = shuffleArray(filteredAgents.filter(agent => 
    (isInSection(agent, "Popular") || agent.is_popular) && !isInSection(agent, "Software")
  ));
  
  const softwareAgents = shuffleArray(filteredAgents.filter(agent => 
    isInSection(agent, "Software") || agent.category === 'Software'
  ));

  const isSearching = searchQuery.length > 0 || selectedCategories.length > 0;

  return (
    <Layout 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
      categories={categories}
      selectedCategories={selectedCategories}
      onCategoryChange={setSelectedCategories}
    >
      <div className="min-h-screen">
        {/* Original Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-lime-500/15 via-lime-500/5 to-transparent dark:from-lime-500/10 dark:via-lime-500/5 dark:to-transparent" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-lime-500/10 text-accent dark:text-lime-400 border-lime-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Agent Marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Deploy AI Agents That{" "}
                <span className="text-gradient">Work For You</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse our collection of specialized AI agents designed to automate your business processes,
                boost productivity, and scale your operations.
              </p>
            </div>
          </div>
        </div>


        <div className="container mx-auto py-8">
          {/* Loading State */}
          {isLoading ? (
            <div className="px-4 md:px-0">
              <Skeleton className="h-10 w-64 mb-4" />
              <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="flex-shrink-0 w-[360px] [box-shadow:0_0_20px_rgba(132,204,22,0.15)]">
                    <div className="p-6">
                      <Skeleton className="h-6 w-20 mb-4" />
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            // Search results view - show all matching in a grid
            <div className="px-4 md:px-0">
              <h2 className="text-2xl font-bold mb-6">
                Search Results {filteredAgents.length > 0 && `(${filteredAgents.length})`}
              </h2>
              {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent) => (
                    <div key={agent.id}>
                      <Link href={`/marketplace/${agent.slug}`} className="block">
                        <Card className="h-full [box-shadow:0_0_20px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_30px_rgba(132,204,22,0.25)] transition-shadow">
                          <CardContent className="p-6">
                            <Badge variant="secondary" className="mb-3">{agent.category}</Badge>
                            <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
                            {agent.job_title && (
                              <p className="text-sm text-muted-foreground mb-2">{agent.job_title}</p>
                            )}
                            <p className="text-muted-foreground text-sm line-clamp-2">{agent.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="[box-shadow:0_0_20px_rgba(132,204,22,0.15)]">
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
            </div>
          ) : (
            // Default carousel sections view
            <div className="space-y-12">
              <AgentCarouselSection
                title="The latest."
                subtitle="Take a look at what's new, right now."
                agents={latestAgents}
              />

          <AgentCarouselSection
            title="Most Popular."
            subtitle="The top picks customers keep coming back to."
            agents={popularAgents.length > 0 ? popularAgents : latestAgents.slice(0, 4)}
          />

          {softwareAgents.length > 0 && (
            <AgentCarouselSection
              title="Tools that run the mission."
              subtitle="Deploy proven software that keeps your team organized, consistent, and moving."
              agents={softwareAgents}
            />
          )}

              <UpcomingAgentsSection />
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 px-4 md:px-0">
            <Card className="bg-gradient-to-r from-lime-500/10 to-primary/10 border-lime-500/20 [box-shadow:0_0_20px_rgba(132,204,22,0.15)]">
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Need a Custom AI Agent?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Don't see what you're looking for? We can build custom AI agents tailored to your specific business needs.
                </p>
                <Button asChild size="lg" className="bg-lime-500 hover:bg-lime-600 text-black">
                  <Link href="/schedule">
                    Schedule a Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
