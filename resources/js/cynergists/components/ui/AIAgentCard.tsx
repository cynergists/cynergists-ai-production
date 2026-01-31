import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  Users, 
  Star,
  ArrowRight,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const stripHtmlTags = (html: string | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

interface MediaItem {
  url: string;
  type: "image" | "video";
}

export interface AIAgent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  job_title?: string | null;
  price: number;
  category: string;
  website_category?: string[] | string | null;
  icon: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  card_media?: MediaItem[];
}

interface AIAgentCardProps {
  agent: AIAgent;
  showDiscount?: boolean;
  discountPercent?: number;
}

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

export function AIAgentCard({ agent, showDiscount = false, discountPercent = 0 }: AIAgentCardProps) {
  const Icon = getAgentIcon(agent.category);
  const discountedPrice = showDiscount && discountPercent > 0 
    ? agent.price * (1 - discountPercent / 100) 
    : agent.price;
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const cardMedia = agent.card_media || [];
  const hasMedia = cardMedia.length > 0;
  const currentMedia = cardMedia[currentMediaIndex];
  
  // Check if this is a software product (no media and website_category includes Software)
  const websiteCats = Array.isArray(agent.website_category) ? agent.website_category : (agent.website_category ? [agent.website_category] : []);
  const isSoftware = websiteCats.some(c => c.toLowerCase() === "software") || (!hasMedia && agent.category.toLowerCase() === "software");

  const goToPrevious = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : cardMedia.length - 1));
  };

  const goToNext = () => {
    setCurrentMediaIndex((prev) => (prev < cardMedia.length - 1 ? prev + 1 : 0));
  };

  // Software card variant - full width, no image
  if (isSoftware) {
    return (
      <div className="p-[8px] rounded-2xl bg-gradient-to-br from-[#26908B] to-[#1a365d] h-[440px] w-[560px] shrink-0 [box-shadow:0_0_15px_rgba(38,144,139,0.2)] hover:[box-shadow:0_0_25px_rgba(38,144,139,0.4)] hover:scale-[1.02] transition-all duration-300">
        <Card className="group relative overflow-hidden border-0 transition-all duration-300 flex flex-col h-full w-full rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          
          {/* Top section with icon and category */}
          <div className="relative px-8 pt-8 pb-6">
            {/* Large icon background */}
            <div className="absolute top-4 right-4 opacity-10">
              <Icon className="h-32 w-32 text-teal-400" />
            </div>
            
            {/* Category Badge */}
            <Badge variant="outline" className="text-xs capitalize bg-teal-500/20 text-teal-300 border-teal-400/40 backdrop-blur-sm mb-4">
              {agent.category}
            </Badge>
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
              <Icon className="h-8 w-8 text-white" />
            </div>
            
            {/* Title */}
            <div>
              {agent.job_title && (
                <h3 className="font-bold text-2xl text-white leading-tight mb-1">
                  {agent.job_title}
                </h3>
              )}
              <p className="text-sm">
                <span className="text-slate-400 font-normal">Software: </span>
                <span className="font-semibold text-teal-300">{agent.name}</span>
              </p>
            </div>
          </div>

          {/* Description and Features */}
          <div className="px-8 flex-1">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 mb-5">
              {stripHtmlTags(agent.description)}
            </p>
            
            {/* Features in horizontal layout */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {agent.features?.slice(0, 4).map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-slate-400 line-clamp-1">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-800/50 mt-auto">
            <div className="flex items-center justify-between">
              <div>
                {showDiscount && discountPercent > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      ${discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      ${agent.price}
                    </span>
                    <span className="text-base text-slate-400">/mo</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${agent.price}</span>
                    <span className="text-base text-slate-400">/mo</span>
                  </div>
                )}
              </div>
              <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-6">
                <Link href={`/marketplace/${agent.slug}`}>
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Default AI Agent card variant
  return (
    <div className="p-[8px] rounded-2xl bg-gradient-to-br from-[#81CA16] to-[#26908B] h-[440px] w-[560px] shrink-0 [box-shadow:0_0_15px_rgba(132,204,22,0.15)] hover:[box-shadow:0_0_25px_rgba(132,204,22,0.3)] hover:scale-[1.02] transition-all duration-300">
      <Card 
        className="group relative overflow-hidden border-0 transition-all duration-300 flex flex-row h-full w-full rounded-xl"
      >
      {/* Left Side - Media - Fixed size container */}
      <div className="relative w-[280px] h-full shrink-0 bg-muted/30 overflow-hidden">
        {hasMedia ? (
          <>
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt={agent.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {/* Navigation arrows for carousel */}
            {cardMedia.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Dot indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {cardMedia.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentMediaIndex 
                          ? "bg-white" 
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-lime-500/20 to-lime-500/5">
            <Icon className="h-16 w-16 text-accent/50 dark:text-lime-400/50" />
          </div>
        )}
        
        {/* Category Badge on image */}
        <Badge variant="outline" className="absolute top-4 left-4 text-xs capitalize bg-black/50 text-white border-white/30 backdrop-blur-sm">
          {agent.category}
        </Badge>
      </div>

      {/* Right Side - Content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Card Header */}
        <div className="px-6 pt-6 pb-4 flex-1">
          <div className="mb-4">
            {agent.job_title && (
              <h3 className="font-bold text-xl text-white leading-tight">
                {agent.job_title}
              </h3>
            )}
            <p className="text-sm mt-0.5">
              <span className="text-muted-foreground font-normal">Code Name: </span>
              <span className="font-bold text-white">{agent.name}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 min-h-[60px] mb-4">
            {stripHtmlTags(agent.description)}
          </p>

          {/* Features Section */}
          <div className="space-y-2">
            {agent.features?.slice(0, 3).map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-accent dark:text-lime-400 shrink-0 mt-0.5" />
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
          <div className="flex flex-col gap-3">
            <div className="text-center">
              {showDiscount && discountPercent > 0 ? (
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${discountedPrice.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${agent.price}
                  </span>
                  <span className="text-base text-muted-foreground">/mo</span>
                </div>
              ) : (
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">${agent.price}</span>
                  <span className="text-base text-muted-foreground">/mo</span>
                </div>
              )}
            </div>
            <Button asChild className="w-full bg-lime-500 hover:bg-lime-600 text-black font-medium">
              <Link href={`/marketplace/${agent.slug}`}>
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
}
