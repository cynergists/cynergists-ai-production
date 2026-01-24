import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Plug, Bot, MessageSquare, TrendingUp, FileText, Users, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface AgentTier {
  price: number;
  description: string;
}

export interface AgentPreviewData {
  id?: string;
  name: string;
  job_title?: string | null;
  description?: string | null;
  category: string;
  website_category?: string;
  features?: string[];
  integrations?: string[];
  image_url?: string | null;
  product_media?: MediaItem[];
  tiers?: AgentTier[];
  price?: number;
}

interface AgentPreviewProps {
  agent: AgentPreviewData;
  isAdmin?: boolean;
  className?: string;
}

const getAgentIcon = (category: string) => {
  switch (category?.toLowerCase()) {
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function AgentPreview({ agent, isAdmin = false, className }: AgentPreviewProps) {
  const Icon = getAgentIcon(agent.category);
  
  // Get display media - prefer product_media, fallback to image_url
  const primaryMedia = agent.product_media?.[0];
  const displayUrl = primaryMedia?.url || agent.image_url;
  const isVideo = primaryMedia?.type === "video";
  
  // Get current price - first tier or base price
  const currentPrice = agent.tiers?.[0]?.price ?? agent.price ?? 0;

  return (
    <div className={cn("bg-background", className)}>
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column - Image/Visual */}
        <div>
          {/* Gradient border wrapper */}
          <div className="relative rounded-2xl p-[15px] bg-gradient-to-br from-[#81CA16] to-[#26908B]">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background">
              {displayUrl ? (
                isVideo ? (
                  <video
                    src={displayUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={displayUrl}
                    alt={agent.name}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="p-6 rounded-2xl bg-lime-500/20 border border-lime-500/30">
                    <Icon className="h-16 w-16 text-accent dark:text-lime-400" />
                  </div>
                </div>
              )}
              {/* Product Category Badge on image */}
              <Badge variant="outline" className="absolute top-4 left-4 text-xs capitalize bg-black/50 text-white border-white/30 backdrop-blur-sm">
                {agent.category || "Category"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div className="space-y-6 pt-4">
          {/* Title with website category badge */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{agent.job_title || "Job Title"}</h1>
              {agent.website_category && (
                <Badge className="bg-lime-500/10 text-accent dark:text-lime-400 border-lime-500/30">
                  {agent.website_category}
                </Badge>
              )}
            </div>
            <p className="text-base">
              <span className="text-muted-foreground font-normal">Code Name: </span>
              <span className="font-bold text-white">{agent.name || "Agent Name"}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-foreground text-lg leading-relaxed">
            {agent.description || "Enter a description for this AI agent..."}
          </p>

          {/* What's Included Section - Inline */}
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

          {/* Tier Slider Preview (simplified for preview) */}
          {agent.tiers && agent.tiers.length > 0 ? (
            <div className="space-y-4">
              {agent.tiers[0]?.description && (
                <div className="py-3 px-4 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-lg font-bold text-foreground">
                    {agent.tiers[0].description}
                  </p>
                </div>
              )}
              
              {/* Tier indicators */}
              {agent.tiers.length > 1 && (
                <div className="flex gap-2 px-1">
                  {agent.tiers.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-3 w-3 rounded-full border-2 transition-all",
                        index === 0 
                          ? "bg-lime-400 border-lime-400" 
                          : "border-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
              )}
              
              {/* Pricing */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-base text-accent dark:text-lime-400">
                  <span className="font-medium">Price:</span> {formatCurrency(currentPrice)}/mo
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-base text-accent dark:text-lime-400">
                <span className="font-medium">Price:</span> {formatCurrency(currentPrice)}/mo
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button 
            size="lg" 
            className="w-full bg-lime-500 hover:bg-lime-600 text-black font-medium"
            disabled={isAdmin}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart - {formatCurrency(currentPrice)}/mo
          </Button>
        </div>
      </div>
    </div>
  );
}
