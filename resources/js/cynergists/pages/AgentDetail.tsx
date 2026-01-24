import { Link } from "@inertiajs/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentDetailSlider } from "@/components/marketplace/AgentDetailSlider";
import { 
  ArrowLeft, 
  Bot, 
  Check, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Users, 
  Star, 
  Zap,
  Plug
} from "lucide-react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface Agent {
  id: string;
  name: string;
  job_title: string | null;
  description: string | null;
  long_description: string | null;
  price: number;
  category: string;
  icon: string | null;
  features: string[];
  perfect_for: string[] | null;
  integrations: string[] | null;
  is_popular: boolean;
  is_active: boolean;
  image_url: string | null;
  product_media: MediaItem[] | null;
}

const getAgentIcon = (category?: string | null) => {
  const normalizedCategory = (category ?? "general").toLowerCase();
  switch (normalizedCategory) {
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

export default function AgentDetail({ slug }: { slug: string }) {

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ["agent-detail", slug],
    queryFn: async () => {
      return apiClient.get<Agent>(`/api/public/agents/${slug}`);
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-video rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !agent) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The AI agent you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const Icon = getAgentIcon(agent.category);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Back button */}
        <div className="container mx-auto px-4 pt-8">
          <Button variant="ghost" asChild>
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left column - Image/Visual */}
            <div>
              {/* Gradient border wrapper */}
              <div className="relative rounded-2xl p-[15px] bg-gradient-to-br from-[#81CA16] to-[#26908B]">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background">
                  {(() => {
                    const primaryMedia = agent.product_media?.[0];
                    const displayUrl = primaryMedia?.url || agent.image_url;
                    const isVideo = primaryMedia?.type === "video";
                    
                    if (displayUrl) {
                      if (isVideo) {
                        return (
                          <video
                            src={displayUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <img
                          src={displayUrl}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="p-6 rounded-2xl bg-lime-500/20 border border-lime-500/30">
                          <Icon className="h-16 w-16 text-accent dark:text-lime-400" />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right column - Details */}
            <div className="space-y-6">
              {/* Title with category badge */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{agent.job_title || "Job Title"}</h1>
                  <Badge variant="outline" className="bg-lime-500/10 text-accent dark:text-lime-400 border-lime-500/30">
                    {agent.category}
                  </Badge>
                </div>
                <p className="text-base">
                  <span className="text-muted-foreground font-normal">Code Name: </span>
                  <span className="font-bold text-white">{agent.name}</span>
                </p>
              </div>

              {/* Description - white text */}
              <p className="text-foreground text-lg leading-relaxed">
                {agent.long_description || agent.description}
              </p>

              {/* What's Included Section - Inline under description */}
              {agent.features && agent.features.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {agent.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-accent dark:text-lime-400" />
                        </div>
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations Section - Right under What's Included */}
              {agent.integrations && agent.integrations.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Plug className="h-5 w-5 text-accent dark:text-lime-400" />
                    <h3 className="text-lg font-bold">Integrations</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.integrations.map((integration, index) => (
                      <Badge key={index} variant="outline" className="text-base py-1.5 px-3">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier Slider and Pricing */}
              <AgentDetailSlider
                agentId={agent.id}
                agentName={agent.name}
                agentDescription={agent.description}
                agentJobTitle={agent.job_title}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
