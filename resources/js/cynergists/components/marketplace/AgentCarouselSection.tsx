import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AIAgentCard, type AIAgent } from "@/components/ui/AIAgentCard";
import { cn } from "@/lib/utils";

interface AgentCarouselSectionProps {
  title: string;
  subtitle?: string;
  agents: AIAgent[];
  className?: string;
}

export function AgentCarouselSection({ 
  title, 
  subtitle, 
  agents,
  className 
}: AgentCarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [agents]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 584; // 560px card + 24px gap
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 584; // 560px card + 24px gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  if (agents.length === 0) return null;

  return (
    <section className={cn("py-6", className)}>
      {/* Section Header - Apple Style */}
      <div className="mb-5 px-4 md:px-0">
        <h2 className="text-2xl md:text-[28px] font-semibold tracking-tight">
          <span className="text-foreground">{title}</span>
          {subtitle && (
            <span className="text-muted-foreground font-normal"> {subtitle}</span>
          )}
        </h2>
      </div>

      {/* Scrollable Container with Arrow */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-4 md:px-2 -my-4 -mx-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className="flex-shrink-0 w-[560px]"
            >
              <AIAgentCard agent={agent} />
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
