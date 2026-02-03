import { AIAgentCard, type AIAgent } from '@/components/ui/AIAgentCard';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    className,
}: AgentCarouselSectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current;
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
            scrollContainerRef.current.scrollBy({
                left: cardWidth,
                behavior: 'smooth',
            });
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const cardWidth = 584; // 560px card + 24px gap
            scrollContainerRef.current.scrollBy({
                left: -cardWidth,
                behavior: 'smooth',
            });
        }
    };

    if (agents.length === 0) return null;

    return (
        <section className={cn('py-6', className)}>
            {/* Section Header - Apple Style */}
            <div className="mb-5 px-4 md:px-0">
                <h2 className="text-2xl font-semibold tracking-tight md:text-[28px]">
                    <span className="text-foreground">{title}</span>
                    {subtitle && (
                        <span className="font-normal text-muted-foreground">
                            {' '}
                            {subtitle}
                        </span>
                    )}
                </h2>
            </div>

            {/* Scrollable Container with Arrow */}
            <div className="group relative">
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="scrollbar-hide -mx-2 -my-4 flex gap-6 overflow-x-auto px-4 py-4 md:px-2"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {agents.map((agent) => (
                        <div key={agent.id} className="w-[560px] flex-shrink-0">
                            <AIAgentCard agent={agent} />
                        </div>
                    ))}
                </div>

                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={scrollLeft}
                        className="absolute top-1/2 left-0 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-background md:flex"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6 text-foreground" />
                    </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={scrollRight}
                        className="absolute top-1/2 right-0 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/80 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-background md:flex"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6 text-foreground" />
                    </button>
                )}
            </div>
        </section>
    );
}
